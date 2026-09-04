import { computed, inject, Injectable, signal } from '@angular/core';

import { STORAGE_KEYS } from '@constants/storage-keys';
import { CreatePaymentPayload, PendingPayment } from '@models/payment.model';
import { GroupService } from '@services/group.service';

@Injectable({ providedIn: 'root' })
export class PendingPaymentsService {
  private readonly groupService = inject(GroupService);

  private readonly _pending = signal<PendingPayment[]>(this.loadFromStorage());

  readonly pending = this._pending.asReadonly();

  getPendingForGroup(groupId: number) {
    return computed(() => this._pending().filter((p) => p.groupId === groupId));
  }

  add(request: CreatePaymentPayload): string {
    const localId = this.generateLocalId();
    const pendingPayment: PendingPayment = {
      localId,
      groupId: request.groupId,
      request,
      createdAt: new Date().toISOString(),
    };

    this._pending.update((list) => [...list, pendingPayment]);
    this.saveToStorage();
    return localId;
  }

  remove(localId: string): void {
    this._pending.update((list) => list.filter((p) => p.localId !== localId));
    this.saveToStorage();
  }

  syncAll(): void {
    for (const pendingPayment of this._pending()) {
      this.groupService.createPayment(pendingPayment.request).subscribe({
        next: () => {
          this.remove(pendingPayment.localId);
          this.groupService.invalidateGroupDetail(pendingPayment.groupId);
        },
        error: () => {
          // Network still unavailable or request failed; keep it queued for the next sync.
        },
      });
    }
  }

  private generateLocalId(): string {
    return `pending-payment-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }

  private loadFromStorage(): PendingPayment[] {
    const stored = localStorage.getItem(STORAGE_KEYS.PENDING_PAYMENTS);
    try {
      const parsed = stored ? JSON.parse(stored) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private saveToStorage(): void {
    localStorage.setItem(STORAGE_KEYS.PENDING_PAYMENTS, JSON.stringify(this._pending()));
  }
}
