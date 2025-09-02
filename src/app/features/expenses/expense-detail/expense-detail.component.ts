import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { Expense, ExpenseExtended } from '@app/core/models/expenses.model';
import { AuthService } from '@app/core/services/auth.service';
import { ExpenseService } from '@app/core/services/expenses.service';
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

    const optionId =
      expense.optionId ?? detectQuickOptionFromParticipants(expense, this.currentUserId);

    const expenseForEdit: ExpenseExtended = {
      ...expense,
      optionId,
      paidBy: expense.paidBy,
      splits: expense.splits,
      category: expense.category,
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
