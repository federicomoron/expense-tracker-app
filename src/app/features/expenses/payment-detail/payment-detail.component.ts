import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { SettleUpDialogComponent } from '@features/groups/settle-up-dialog/settle-up-dialog.component';
import { GroupMember } from '@models/group-detail.model';
import { HeaderAction } from '@models/header-action.model';
import { Payment } from '@models/payment.model';
import { ApiErrorService } from '@services/api-error.service';
import { AuthService } from '@services/auth.service';
import { DialogService } from '@services/dialog.service';
import { GroupService } from '@services/group.service';
import { UiMessageService } from '@services/ui-message.service';
import { HeaderComponent } from '@shared/components/header/header.component';
import { SpinnerComponent } from '@shared/components/spinner/spinner.component';
import { getInitials } from '@shared/helpers/avatar.utils';
import { findGroupIdInRoute } from '@shared/helpers/expense.utils';
import { CurrencySymbolPipe } from '@shared/pipes/currency-symbol.pipe';
import { SharedMaterialModule } from '@shared/shared-material.module';
import { ConfirmDialogComponent } from '@shared/ui/dialogs/confirm-dialog.component';

interface PaymentForDetail extends Payment {
  readonly fromName: string;
  readonly toName: string;
}

@Component({
  selector: 'app-payment-detail',
  standalone: true,
  imports: [
    CommonModule,
    SharedMaterialModule,
    TranslateModule,
    HeaderComponent,
    SpinnerComponent,
    CurrencySymbolPipe,
  ],
  templateUrl: './payment-detail.component.html',
  styleUrls: ['./payment-detail.component.scss'],
})
export class PaymentDetailComponent {
  readonly payment = signal<PaymentForDetail | null>(null);
  readonly getInitials = getInitials;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);
  private readonly authService = inject(AuthService);
  private readonly apiErrorService = inject(ApiErrorService);
  private readonly uiMessage = inject(UiMessageService);
  private readonly groupService = inject(GroupService);
  private readonly dialogService = inject(DialogService);

  readonly currentUser = this.authService.currentUser;

  constructor() {
    this._initPayment();
  }

  get headerActions(): HeaderAction[] {
    return [
      {
        icon: 'edit',
        label: 'Edit',
        color: 'primary',
        onClick: () => this.onEdit(),
      },
      {
        icon: 'delete',
        label: 'Delete',
        color: 'warn',
        onClick: () => this.onDelete(),
      },
    ];
  }

  onEdit(): void {
    const payment = this.payment();
    if (!payment) return;

    const members: GroupMember[] = (window as any).currentGroupDetail?.members ?? [];

    const dialogRef = this.dialogService.openFullScreen(SettleUpDialogComponent, {
      groupId: payment.groupId,
      members,
      editingPayment: payment,
    });

    dialogRef.afterClosed().subscribe((result: { updated?: boolean } | undefined) => {
      if (result?.updated) {
        void this.router.navigate(['/groups', payment.groupId]);
      }
    });
  }

  onDelete(): void {
    const payment = this.payment();
    if (!payment) return;

    const confirmDialog = this.dialogService.openFixed(ConfirmDialogComponent, '400px', {
      title: this.translate.instant('confirmDeletePayment.title'),
      message: this.translate.instant('confirmDeletePayment.message'),
      confirmText: this.translate.instant('common.confirm'),
      cancelText: this.translate.instant('common.cancel'),
    });

    confirmDialog.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;

      this.groupService.deletePayment(payment.id, payment.groupId).subscribe({
        next: () => {
          this.uiMessage.showSuccess('paymentDetail.deletedSuccess');
          void this.router.navigate(['/groups', payment.groupId]);
        },
        error: (err) => {
          const message = this.apiErrorService.handleError(err);
          this.uiMessage.showError(message);
        },
      });
    });
  }

  closeDialog(): void {
    const payment = this.payment();
    void this.router.navigate(['/groups', payment?.groupId ?? '']);
  }

  private _initPayment(): void {
    const routeGroupId = findGroupIdInRoute(this.route);
    const paymentFromState = history.state?.payment as Payment | undefined;

    let found: Payment | undefined = paymentFromState;

    if (!found) {
      const paymentIdParam = this.route.snapshot.paramMap.get('paymentId');
      const paymentId = paymentIdParam ? +paymentIdParam : null;
      if (!paymentId) {
        void this.router.navigate(['/groups', routeGroupId]);
        return;
      }

      const currentGroup = (window as any).currentGroupDetail;
      found = currentGroup?.activity?.find(
        (item: any) => item.type === 'payment' && item.id === paymentId,
      );
    }

    if (!found) {
      void this.router.navigate(['/groups', routeGroupId]);
      return;
    }

    const members: GroupMember[] = (window as any).currentGroupDetail?.members ?? [];
    const currentUserId = this.currentUser()?.id;

    const resolveName = (userId: number): string => {
      if (userId === currentUserId) return this.translate.instant('common.you');
      return members.find((m) => m.userId === userId)?.name ?? `User #${userId}`;
    };

    this.payment.set({
      ...found,
      groupId: found.groupId ?? routeGroupId,
      fromName: resolveName(found.fromUserId),
      toName: resolveName(found.toUserId),
    });
  }
}
