import { computed, inject, Injectable, signal } from '@angular/core';

import { STORAGE_KEYS } from '@constants/storage-keys';
import { ExpenseRequest, PendingExpense } from '@models/expenses.model';
import { ExpenseService } from '@services/expenses.service';
import { GroupService } from '@services/group.service';

@Injectable({ providedIn: 'root' })
export class PendingExpensesService {
  private readonly expenseService = inject(ExpenseService);
  private readonly groupService = inject(GroupService);

  private readonly _pending = signal<PendingExpense[]>(this.loadFromStorage());

  readonly pending = this._pending.asReadonly();

  getPendingForGroup(groupId: number) {
    return computed(() => this._pending().filter((p) => p.groupId === groupId));
  }

  add(request: ExpenseRequest): string {
    const localId = this.generateLocalId();
    const pendingExpense: PendingExpense = {
      localId,
      groupId: request.groupId,
      request,
      createdAt: new Date().toISOString(),
    };

    this._pending.update((list) => [...list, pendingExpense]);
    this.saveToStorage();
    return localId;
  }

  remove(localId: string): void {
    this._pending.update((list) => list.filter((p) => p.localId !== localId));
    this.saveToStorage();
  }

  syncAll(): void {
    for (const pendingExpense of this._pending()) {
      this.expenseService.createExpense(pendingExpense.request).subscribe({
        next: () => {
          this.remove(pendingExpense.localId);
          this.groupService.invalidateGroupDetail(pendingExpense.groupId);
        },
        error: () => {
          // Network still unavailable or request failed; keep it queued for the next sync.
        },
      });
    }
  }

  private generateLocalId(): string {
    return `pending-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }

  private loadFromStorage(): PendingExpense[] {
    const stored = localStorage.getItem(STORAGE_KEYS.PENDING_EXPENSES);
    try {
      const parsed = stored ? JSON.parse(stored) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private saveToStorage(): void {
    localStorage.setItem(STORAGE_KEYS.PENDING_EXPENSES, JSON.stringify(this._pending()));
  }
}
