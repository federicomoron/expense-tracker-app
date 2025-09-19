import { computed, inject, Injectable, signal } from '@angular/core';
import { map, Observable, tap } from 'rxjs';

import { API_ENDPOINTS } from '@constants/api-endpoints';
import { STORAGE_KEYS } from '@constants/storage-keys';
import { environment } from '@environments/environment';
import { GroupDetailResponse, GroupDetailWithExpenses } from '@models/group-detail.model';
import { CreateGroupPayload, CreateGroupResponse } from '@models/group-request.model';
import { Group } from '@models/group.model';
import { HttpService } from '@services/http.service';

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

  uploadImage(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('image', file);
    return this.http
      .post<
        { success: boolean; data: { url: string } },
        FormData
      >(`${this.apiUrl}${API_ENDPOINTS.UPLOAD_GROUP_IMAGE}`, formData)
      .pipe(map((res) => res.data.url));
  }

  deleteGroup(groupId: number): Observable<{ success: boolean; data: any }> {
    return this.http
      .delete<{
        success: boolean;
        data: any;
      }>(`${this.apiUrl}${API_ENDPOINTS.DELETE_GROUP(groupId)}`)
      .pipe(
        tap((res) => {
          if (res.success) {
            this._groupsSignal.update((groups) => groups.filter((g) => g.id !== groupId));
            this.saveToStorage();
          }
        }),
      );
  }

  addMember(groupId: number, email: string) {
    const payload = { group_id: groupId, email };
    return this.http.post<{ success: boolean; message: string }, typeof payload>(
      `${this.apiUrl}${API_ENDPOINTS.SEND_INVITATION}`,
      payload,
    );
  }

  getGroupInvitations(groupId: number) {
    return this.http
      .get<{ success: boolean; data: any[] }>(`${this.apiUrl}${API_ENDPOINTS.GET_INVITATIONS}`)
      .pipe(map((res) => res.data.filter((inv) => inv.group_id === groupId)));
  }

  sendInvitation(groupId: number, invitedUserId: number) {
    return this.http.post<
      { success: boolean; data: any },
      { groupId: number; invitedUserId: number }
    >(`${this.apiUrl}${API_ENDPOINTS.SEND_INVITATION}`, { groupId, invitedUserId });
  }
}
