import { computed, inject, Injectable, signal } from '@angular/core';
import { map, Observable, tap } from 'rxjs';

import { API_ENDPOINTS } from '@constants/api-endpoints';
import { STORAGE_KEYS } from '@constants/storage-keys';
import { environment } from '@environments/environment';
import { GroupDetailResponse, GroupDetailWithExpenses } from '@models/group-detail.model';
import { GroupType } from '@models/group-type.enum';
import { Group } from '@models/group.model';
import { HttpService } from '@services/http.service';

interface CreateGroupPayload {
  name: string;
  type: GroupType;
}

interface CreateGroupResponse {
  success: boolean;
  data: Group;
}
@Injectable({
  providedIn: 'root',
})
export class GroupService {
  private readonly apiUrl = environment.apiUrl;
  private _groupsSignal = signal<Group[]>(this.loadFromStorage());
  private http = inject(HttpService);

  private _activeGroupId = signal<number | null>(null);

  readonly activeGroup = computed(() => {
    const groupId = this._activeGroupId();
    return this.groups().find((group) => group.id === groupId) ?? null;
  });

  setActiveGroup(groupId: number) {
    this._activeGroupId.set(groupId);
  }

  readonly groups = computed(() => {
    return this._groupsSignal();
  });

  private loadFromStorage(): Group[] {
    const stored = localStorage.getItem(STORAGE_KEYS.GROUPS);
    try {
      const parsed = stored ? JSON.parse(stored) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private saveToStorage() {
    localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(this._groupsSignal()));
  }

  fetchGroups() {
    return this.http
      .get<{
        success: boolean;
        data: { groups: Group[] };
      }>(`${this.apiUrl}${API_ENDPOINTS.GET_GROUPS}`)
      .pipe(
        tap((res) => {
          const groups = res.data.groups;
          this._groupsSignal.set(groups);
          this.saveToStorage();
        }),
      );
  }

  addGroup(group: Group) {
    if (!group || !group.name || !group.id) return;

    this._groupsSignal.update((groups) => [...groups, group]);
    this.saveToStorage();
  }

  clearGroups() {
    this._groupsSignal.set([]);
    this.saveToStorage();
  }

  createGroup(group: CreateGroupPayload): Observable<CreateGroupResponse> {
    return this.http
      .post<
        CreateGroupResponse,
        CreateGroupPayload
      >(`${this.apiUrl}${API_ENDPOINTS.CREATE_GROUP}`, group)
      .pipe(
        tap((response) => {
          if (response.success) {
            this.addGroup(response.data);
          }
        }),
      );
  }

  getGroupDetail(groupId: number): Observable<GroupDetailWithExpenses> {
    return this.http
      .get<GroupDetailResponse>(`${this.apiUrl}${API_ENDPOINTS.GET_GROUP_DETAIL(groupId)}`)
      .pipe(map((res) => res.data));
  }
}
