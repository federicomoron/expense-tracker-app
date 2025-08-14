import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { Expense } from '@app/core/models/expenses.model';
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

  expense = signal<Expense | null>(null);

  constructor() {
    const expenseFromState = history.state?.expense;

    if (expenseFromState) {
      const routeGroupId = this.findGroupIdInRoute(this.route);
      this.expense.set({ ...expenseFromState, groupId: routeGroupId });
      return;
    }

    const expenseId = Number(this.route.snapshot.paramMap.get('expenseId'));
    const routeGroupId = this.findGroupIdInRoute(this.route);

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

  private findGroupIdInRoute(route: ActivatedRoute): number {
    let currentRoute: ActivatedRoute | null = route;
    while (currentRoute) {
      const groupIdParam =
        currentRoute.snapshot.paramMap.get('groupId') ?? currentRoute.snapshot.paramMap.get('id');
      if (groupIdParam) {
        const id = Number(groupIdParam);
        if (!isNaN(id) && id > 0) return id;
      }
      currentRoute = currentRoute.parent;
    }
    return 0;
  }

  onEdit() {
    let expense = this.expense();
    const routeGroupId = this.findGroupIdInRoute(this.route);

    if (expense && (!expense.groupId || expense.groupId <= 0)) {
      expense = { ...expense, groupId: routeGroupId };
      this.expense.set(expense);
    }

    if (!expense?.groupId || !expense?.id) {
      console.error('[ExpenseDetail] Falta groupId o id en el expense:', expense);
      return;
    }

    void this.router.navigate(['/groups', expense.groupId, 'expenses', expense.id, 'edit'], {
      state: { expense },
    });
  }

  onDelete() {
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
      if (confirmed) {
        void this.router.navigate(['/groups', expense.groupId]);
      }
    });
  }

  closeDialog(): void {
    const expense = this.expense();
    if (expense?.groupId) {
      void this.router.navigate(['/groups', expense.groupId]);
    } else {
      void this.router.navigate(['/groups']);
    }
  }
}
