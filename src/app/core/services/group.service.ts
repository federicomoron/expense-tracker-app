import { computed, inject, Injectable, signal } from '@angular/core';
import { map, Observable, tap } from 'rxjs';

import { API_ENDPOINTS } from '@constants/api-endpoints';
import { STORAGE_KEYS } from '@constants/storage-keys';
import { GroupDetailResponse, GroupDetailWithExpenses } from '@models/group-detail.model';
import { CreateGroupPayload, CreateGroupResponse } from '@models/group-request.model';
import { Group } from '@models/group.model';
import { EnvironmentService } from '@services/environment.service';
import { HttpService } from '@services/http.service';

@Injectable({ providedIn: 'root' })
export class GroupService {
  private _groupsSignal = signal<Group[]>(this.loadFromStorage());
  private _activeGroupId = signal<number | null>(null);
  private readonly _groupDetailCache = this.loadGroupDetailsFromStorage();

  readonly groups = computed(() => this._groupsSignal());
  readonly activeGroup = computed(() => {
    const groupId = this._activeGroupId();
    return this.groups().find((group) => group.id === groupId) ?? null;
  });

  private readonly http = inject(HttpService);
  private readonly env = inject(EnvironmentService);

  private readonly apiUrl = this.env.apiUrl;

  setActiveGroup(groupId: number) {
    this._activeGroupId.set(groupId);
  }

  fetchGroups() {
    return this.http
      .get<{
        success: boolean;
        data: { groups: Group[] };
      }>(`${this.apiUrl}${API_ENDPOINTS.GET_GROUPS}`)
      .pipe(
        tap((res) => {
          this._groupsSignal.set(res.data.groups);
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
    this.saveGroupDetailsToStorage();
  }

  createGroup(group: CreateGroupPayload): Observable<CreateGroupResponse> {
    return this.http
      .post<
        CreateGroupResponse,
        CreateGroupPayload
      >(`${this.apiUrl}${API_ENDPOINTS.CREATE_GROUP}`, group)
      .pipe(
        tap((response) => {
          if (response.success) this.addGroup(response.data);
        }),
      );
  }

  getGroupDetail(groupId: number): Observable<GroupDetailWithExpenses> {
    return this.http
      .get<GroupDetailResponse>(`${this.apiUrl}${API_ENDPOINTS.GET_GROUP_DETAIL(groupId)}`)
      .pipe(
        map((res) => res.data),
        tap((detail) => {
          this._groupDetailCache.set(groupId, detail);
          this.saveGroupDetailsToStorage();
        }),
      );
  }

  getCachedGroupDetail(groupId: number): GroupDetailWithExpenses | null {
    return this._groupDetailCache.get(groupId) ?? null;
  }

  invalidateGroupDetail(groupId: number): void {
    this._groupDetailCache.delete(groupId);
    this.saveGroupDetailsToStorage();
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
    const payload = { groupId, invitedUserEmail: email };
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

  private loadGroupDetailsFromStorage(): Map<number, GroupDetailWithExpenses> {
    const stored = localStorage.getItem(STORAGE_KEYS.GROUP_DETAILS);
    try {
      const parsed: [number, GroupDetailWithExpenses][] = stored ? JSON.parse(stored) : [];
      return new Map(Array.isArray(parsed) ? parsed : []);
    } catch {
      return new Map();
    }
  }

  private saveGroupDetailsToStorage() {
    localStorage.setItem(
      STORAGE_KEYS.GROUP_DETAILS,
      JSON.stringify(Array.from(this._groupDetailCache.entries())),
    );
  }
}
