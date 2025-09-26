import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { Expense, ExpenseExtended, ExpenseUser } from '@core/models/expenses.model';
import { ApiErrorService } from '@services/api-error.service';
import { AuthService } from '@services/auth.service';
import { DialogService } from '@services/dialog.service';
import { ExpenseService } from '@services/expenses.service';
import { UiMessageService } from '@services/ui-message.service';
import { EXPENSE_CATEGORIES } from '@shared/data/expense-categories';
import {
  detectQuickOptionFromParticipants,
  findGroupIdInRoute,
} from '@shared/helpers/expense.utils';
import { SharedMaterialModule } from '@shared/shared-material.module';
import { ConfirmDialogComponent } from '@shared/ui/dialogs/confirm-dialog.component';

@Component({
  selector: 'app-expense-detail',
  standalone: true,
  imports: [CommonModule, SharedMaterialModule, TranslateModule],
  templateUrl: './expense-detail.component.html',
  styleUrls: ['./expense-detail.component.scss'],
})
export class ExpenseDetailComponent {
  readonly expense = signal<Expense | null>(null);

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);
  private readonly authService = inject(AuthService);
  private readonly apiErrorService = inject(ApiErrorService);
  private readonly uiMessage = inject(UiMessageService);
  private readonly expenseService = inject(ExpenseService);
  private readonly dialogService = inject(DialogService);

  readonly currentUserId = this.authService.currentUser()?.id ?? undefined;

  constructor() {
    this._initExpense();
  }

  onEdit(): void {
    const expense = this.expense() as ExpenseExtended | null;
    if (!expense) return;

    const routeGroupId = findGroupIdInRoute(this.route);

    // Prefer the groupId from the expense (in case we navigated from another group), fallback to route
    const groupId = expense.groupId ?? routeGroupId;

    if (!groupId || !expense.id) {
      this.apiErrorService.handleError('expenses.invalidExpense');
      return;
    }

    const participants = expense.participants ?? [];
    const groupSize = participants.length;

    let paidBy: ExpenseUser[] =
      Array.isArray(expense.paidBy) && expense.paidBy.length
        ? expense.paidBy.map((p) => ({ userId: p.userId, amount: Number(p.amount) }))
        : [];

    // if paidBy is empty, try to find participants with amount > 0 (in case paidBy was not saved but participants was)
    if (paidBy.length === 0) {
      const payerParticipants = participants.filter((p) => Number(p.amount) > 0);
      if (payerParticipants.length > 0) {
        // if multiple, take them all (could be a group payment)
        paidBy = payerParticipants.map((p) => ({ userId: p.userId, amount: Number(p.amount) }));
      }
    }

    // Fallback: if no paidBy, try to find a payer in participants, otherwise use currentUser as last resort
    if (paidBy.length === 0) {
      const payer = participants.find((p) => Number(p.amount) > 0);
      if (payer) {
        paidBy = [{ userId: payer.userId, amount: Number(payer.amount) }];
      } else if (this.currentUserId) {
        paidBy = [{ userId: this.currentUserId, amount: Number(expense.total) }];
      }
    }

    let splits: ExpenseUser[] =
      Array.isArray(expense.splits) && expense.splits.length
        ? expense.splits.map((s) => ({ userId: s.userId, amount: Number(s.amount) }))
        : [];

    if (splits.length === 0 && groupSize >= 1) {
      // if splits is empty, use participants amounts as  fallback
      splits = participants.map((p) => ({ userId: p.userId, amount: Number(p.amount) }));

      // if the sum is 0 (no amounts), split equally
      const sum = splits.reduce((acc, s) => acc + s.amount, 0);
      if (Math.abs(sum) < 0.0001) {
        const totalNum = Number(expense.total);
        const equalSplit = Math.floor((totalNum / groupSize) * 100) / 100;
        splits = participants.map((p, i) => ({
          userId: p.userId,
          amount:
            i === groupSize - 1
              ? Math.round((totalNum - equalSplit * (groupSize - 1)) * 100) / 100
              : equalSplit,
        }));
      }
    }

    const optionId =
      expense.optionId ?? detectQuickOptionFromParticipants(expense, this.currentUserId);

    // Try to infer category if not set
    let category = expense.category;
    if (!category && expense.description) {
      // Try to infer category from description
      const desc = expense.description.toLowerCase();
      const matchedCategory = EXPENSE_CATEGORIES.find(
        (c: any) =>
          c.label.toLowerCase() === desc ||
          c.key.toLowerCase() === desc ||
          (c.keywords && c.keywords.some((k: string) => desc.includes(k))),
      );
      if (matchedCategory) {
        category = matchedCategory.key;
      }
    }

    const expenseForEdit: ExpenseExtended = {
      ...expense,
      groupId,
      optionId,
      paidBy,
      splits,
      category,
    };

    void this.router.navigate(['/groups', groupId, 'expenses', expense.id, 'edit'], {
      state: { expense: expenseForEdit },
    });
  }

  onDelete(): void {
    const expense = this.expense();
    if (!expense) return;

    const confirmDialog = this.dialogService.openFixed(ConfirmDialogComponent, '400px', {
      title: this.translate.instant('confirmDelete.title'),
      message: this.translate.instant('confirmDelete.message'),
      confirmText: this.translate.instant('common.confirm'),
      cancelText: this.translate.instant('common.cancel'),
    });

    confirmDialog.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;

      this.expenseService.deleteExpense(expense.id!).subscribe({
        next: () => {
          this.uiMessage.showSuccess(this.translate.instant('expenses.deletedSuccess'));
          void this.router.navigate(['/groups', expense.groupId]);
        },
        error: () => {
          this.apiErrorService.handleError('expenses.deleteError', true);
        },
      });
    });
  }

  closeDialog(): void {
    const expense = this.expense();
    void this.router.navigate(['/groups', expense?.groupId ?? '']);
  }

  private _initExpense(): void {
    const expenseFromState = history.state?.expense as Expense | null;
    const routeGroupId = findGroupIdInRoute(this.route);

    if (expenseFromState) {
      this.expense.set({ ...expenseFromState, groupId: routeGroupId });
      return;
    }

    const expenseIdParam = this.route.snapshot.paramMap.get('expenseId');
    const expenseId = expenseIdParam ? +expenseIdParam : null;

    if (!expenseId) {
      void this.router.navigate(['/groups', routeGroupId]);
      return;
    }

    const groupDetail = history.state?.group as { expenses?: Expense[] } | undefined;
    let found: Expense | undefined;

    if (groupDetail?.expenses) {
      found = groupDetail.expenses.find((e) => e.id === expenseId);
    }

    if (!found && (window as any).currentGroupDetail?.expenses) {
      const currentGroup = (window as any).currentGroupDetail as { expenses?: Expense[] };
      found = currentGroup.expenses?.find((e) => e.id === expenseId);
    }

    if (found) {
      this.expense.set({ ...found, groupId: routeGroupId });
    } else {
      void this.router.navigate(['/groups', routeGroupId]);
    }
  }
}
