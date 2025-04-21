import { HttpClient } from '@angular/common/http';
import { computed, Injectable, signal } from '@angular/core';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Group } from '../../core/models/group.model';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { STORAGE_KEYS } from '../constants/storage-keys';
import { GroupType } from '../models/group-type.enum';

@Injectable({
  providedIn: 'root',
})
export class GroupService {
  private readonly apiUrl = environment.apiUrl;
  private _groupsSignal = signal<Group[]>(this.loadFromStorage());

  readonly groups = computed(() => {
    return this._groupsSignal();
  });

  constructor(private http: HttpClient) {}

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
      .get<{ success: boolean; data: { groups: Group[] } }>(
        `${this.apiUrl}${API_ENDPOINTS.GET_GROUPS}`
      )
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

  createGroup(group: { name: string; type: GroupType }) {
    return this.http
      .post<{ success: boolean; data: Group }>(
        `${this.apiUrl}${API_ENDPOINTS.CREATE_GROUP}`,
        group
      )
      .pipe(
        tap((response) => {
          if (response.success) {
            this.addGroup(response.data);
          }
        })
      );
  }
}
