import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { Expense, ExpenseExtended, ExpenseUser } from '@app/core/models/expenses.model';
import { AuthService } from '@app/core/services/auth.service';
import { ExpenseService } from '@app/core/services/expenses.service';
import { EXPENSE_CATEGORIES } from '@app/shared/data/expense-categories';
import {
  detectQuickOptionFromParticipants,
  findGroupIdInRoute,
} from '@app/shared/helpers/expense.utils';
import { SharedUiModule } from '@app/shared/shared-ui.module';
import { ConfirmDialogComponent } from '@app/shared/ui/theme-toggle/dialogs/confirm-dialog.component';

@Component({
  selector: 'app-expense-detail',
  standalone: true,
  imports: [CommonModule, MatIconModule, SharedUiModule, TranslateModule],
  templateUrl: './expense-detail.component.html',
  styleUrls: ['./expense-detail.component.scss'],
})
export class ExpenseDetailComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private translate = inject(TranslateService);
  private dialog = inject(MatDialog);
  private authService = inject(AuthService);
  private snackbar = inject(MatSnackBar);
  private expenseService = inject(ExpenseService);

  expense = signal<Expense | null>(null);
  currentUserId = this.authService.currentUser()?.id;

  constructor() {
    const expenseFromState = history.state?.expense;
    const routeGroupId = findGroupIdInRoute(this.route);

    if (expenseFromState) {
      this.expense.set({ ...expenseFromState, groupId: routeGroupId });
      return;
    }

    const expenseIdParam = this.route.snapshot.paramMap.get('expenseId');
    const expenseId = expenseIdParam ? Number(expenseIdParam) : NaN;

    if (isNaN(expenseId)) {
      void this.router.navigate(['/groups', routeGroupId]);
      return;
    }

    const groupDetail = history.state?.group as { expenses?: Expense[] } | undefined;
    let found: Expense | undefined;

    if (groupDetail?.expenses) {
      found = groupDetail.expenses.find((e) => e.id === expenseId);
    }

    if (!found && (window as any).currentGroupDetail?.expenses) {
      found = (window as any).currentGroupDetail.expenses.find((e: Expense) => e.id === expenseId);
    }

    if (found) {
      this.expense.set({ ...found, groupId: routeGroupId });
    } else {
      void this.router.navigate(['/groups', routeGroupId]);
    }
  }

  onEdit(): void {
    const expense = this.expense() as ExpenseExtended | null;
    if (!expense) return;

    const routeGroupId = findGroupIdInRoute(this.route);
    if (!expense.groupId) expense.groupId = routeGroupId;

    if (!expense.groupId || !expense.id) {
      this.snackbar.open(this.translate.instant('expenses.invalidExpense'), 'OK', {
        duration: 2500,
      });
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
      } else {
        const currentUserId = this.currentUserId ?? null;
        if (currentUserId) {
          paidBy = [{ userId: currentUserId, amount: Number(expense.total) }];
        }
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
      optionId,
      paidBy,
      splits,
      category,
    };

    void this.router.navigate(['/groups', expense.groupId, 'expenses', expense.id, 'edit'], {
      state: { expense: expenseForEdit },
    });
  }

  onDelete(): void {
    const expense = this.expense();
    if (!expense) return;

    const confirmDialog = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: this.translate.instant('confirmDelete.title'),
        message: this.translate.instant('confirmDelete.message'),
        confirmText: this.translate.instant('common.confirm'),
        cancelText: this.translate.instant('common.cancel'),
      },
    });

    confirmDialog.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;

      this.expenseService.deleteExpense(expense.id!).subscribe({
        next: () => {
          this.snackbar.open(this.translate.instant('expenses.deletedSuccess'), 'OK', {
            duration: 2000,
          });
          void this.router.navigate(['/groups', expense.groupId]);
        },
        error: () => {
          this.snackbar.open(this.translate.instant('expenses.deleteError'), 'OK', {
            duration: 3000,
          });
        },
      });
    });
  }

  closeDialog(): void {
    const expense = this.expense();
    void this.router.navigate(['/groups', expense?.groupId ?? '']);
  }
}
