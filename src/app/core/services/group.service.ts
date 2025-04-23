import { computed, inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { Group } from '@app/core/models/group.model';
import { HttpService } from '@app/core/services/http.service';
import { API_ENDPOINTS } from '@constants/api-endpoints';
import { STORAGE_KEYS } from '@constants/storage-keys';
import { environment } from '@environments/environment';
import { GroupType } from '@models/group-type.enum';

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
    localStorage.setItem(
      STORAGE_KEYS.GROUPS,
      JSON.stringify(this._groupsSignal())
    );
  }

  // Fetch groups from API and update state
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
        })
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
        })
      );
  }
}
