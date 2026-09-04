import { Component, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { GroupMember } from '@models/group-detail.model';
import { Payment } from '@models/payment.model';
import { ApiErrorService } from '@services/api-error.service';
import { ApiStatusService } from '@services/api-status.service';
import { GroupService } from '@services/group.service';
import { PendingPaymentsService } from '@services/pending-payments.service';
import { UiMessageService } from '@services/ui-message.service';
import { HeaderComponent } from '@shared/components/header/header.component';
import { SpinnerComponent } from '@shared/components/spinner/spinner.component';
import { getInitials } from '@shared/helpers/avatar.utils';
import { CurrencySymbolPipe } from '@shared/pipes/currency-symbol.pipe';
import { SharedMaterialModule } from '@shared/shared-material.module';

export interface SettleUpPreset {
  fromUserId: number;
  toUserId: number;
  amount: number;
  currency: string;
}

export interface SettleUpDialogData {
  groupId: number;
  members: GroupMember[];
  preset?: SettleUpPreset;
  editingPayment?: Payment;
}

@Component({
  selector: 'app-settle-up-dialog',
  standalone: true,
  imports: [
    SharedMaterialModule,
    TranslateModule,
    HeaderComponent,
    SpinnerComponent,
    CurrencySymbolPipe,
  ],
  templateUrl: './settle-up-dialog.component.html',
  styleUrls: ['./settle-up-dialog.component.scss'],
})
export class SettleUpDialogComponent {
  readonly isSubmitting = signal(false);
  readonly getInitials = getInitials;

  public readonly dialogRef = inject(MatDialogRef<SettleUpDialogComponent>);
  public readonly data = inject(MAT_DIALOG_DATA) as SettleUpDialogData;

  private readonly groupService = inject(GroupService);
  private readonly apiStatus = inject(ApiStatusService);
  private readonly pendingPaymentsService = inject(PendingPaymentsService);
  private readonly apiErrorService = inject(ApiErrorService);
  private readonly uiMessage = inject(UiMessageService);
  private readonly translate = inject(TranslateService);

  readonly hasPreset = !!this.data.preset;
  readonly isEditing = !!this.data.editingPayment;

  readonly fromUserId = signal<number | null>(
    this.data.editingPayment?.fromUserId ?? this.data.preset?.fromUserId ?? null,
  );
  readonly toUserId = signal<number | null>(
    this.data.editingPayment?.toUserId ?? this.data.preset?.toUserId ?? null,
  );
  readonly amount = signal<number | null>(
    this.data.editingPayment?.amount ?? this.data.preset?.amount ?? null,
  );
  readonly currency = signal<string>(
    this.data.editingPayment?.currency ?? this.data.preset?.currency ?? 'ARS',
  );

  get members(): GroupMember[] {
    return this.data.members;
  }

  get fromOptions(): GroupMember[] {
    const toId = this.toUserId();
    return this.members.filter((m) => m.userId !== toId);
  }

  get toOptions(): GroupMember[] {
    const fromId = this.fromUserId();
    return this.members.filter((m) => m.userId !== fromId);
  }

  get fromName(): string {
    return this.members.find((m) => m.userId === this.fromUserId())?.name ?? '';
  }

  get toName(): string {
    return this.members.find((m) => m.userId === this.toUserId())?.name ?? '';
  }

  get isSubmitDisabled(): boolean {
    const from = this.fromUserId();
    const to = this.toUserId();
    const amount = this.amount();
    return !from || !to || from === to || !amount || amount <= 0;
  }

  setFromUserId(event: MatSelectChange) {
    this.fromUserId.set(event.value);
    if (this.toUserId() === event.value) this.toUserId.set(null);
  }

  setToUserId(event: MatSelectChange) {
    this.toUserId.set(event.value);
    if (this.fromUserId() === event.value) this.fromUserId.set(null);
  }

  setCurrency(currency: string) {
    this.currency.set(currency);
  }

  updateAmount(event: Event) {
    const target = event.target as HTMLInputElement;
    this.amount.set(target.value ? Number(target.value) : null);
  }

  useFullAmount() {
    if (this.data.preset) this.amount.set(this.data.preset.amount);
  }

  submit(): void {
    if (this.isSubmitDisabled || this.isSubmitting()) return;

    if (this.isEditing) {
      this.submitEdit();
    } else {
      this.submitCreate();
    }
  }

  private submitEdit(): void {
    const editingPayment = this.data.editingPayment!;
    const payload = this.buildPayload();

    this.isSubmitting.set(true);

    this.groupService.updatePayment(editingPayment.id, payload).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.uiMessage.showSuccess('settleUp.updateSuccess');
        this.dialogRef.close({ updated: true });
      },
      error: (err) => {
        console.error('Error updating payment', err);
        this.isSubmitting.set(false);
        const message = this.apiErrorService.handleError(err);
        this.uiMessage.showError(message);
      },
    });
  }

  private submitCreate(): void {
    const payload = {
      ...this.buildPayload(),
      clientRequestId: crypto.randomUUID(),
    };

    if (!this.apiStatus.isApiReachable()) {
      this.pendingPaymentsService.add(payload);
      this.uiMessage.showInfo(this.translate.instant('settleUp.savedOffline'), false);
      this.dialogRef.close({ created: true });
      return;
    }

    this.isSubmitting.set(true);

    this.groupService.createPayment(payload).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.uiMessage.showSuccess('settleUp.success');
        this.dialogRef.close({ created: true });
      },
      error: (err) => {
        if (this.isNetworkError(err)) {
          this.pendingPaymentsService.add(payload);
          this.uiMessage.showInfo(this.translate.instant('settleUp.savedOffline'), false);
          this.isSubmitting.set(false);
          this.dialogRef.close({ created: true });
          return;
        }

        console.error('Error recording payment', err);
        this.isSubmitting.set(false);
        const message = this.apiErrorService.handleError(err);
        this.uiMessage.showError(message);
      },
    });
  }

  private buildPayload() {
    return {
      groupId: this.data.groupId,
      fromUserId: this.fromUserId()!,
      toUserId: this.toUserId()!,
      amount: this.amount()!,
      currency: this.currency(),
      title: this.translate.instant('settleUp.defaultTitle', {
        from: this.fromName,
        to: this.toName,
      }),
    };
  }

  private isNetworkError(error: unknown): boolean {
    return (
      error instanceof Object && 'status' in error && (error as { status: number }).status === 0
    );
  }

  close(): void {
    this.dialogRef.close();
  }
}
