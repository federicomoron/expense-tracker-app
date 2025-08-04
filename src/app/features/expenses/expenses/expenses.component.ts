import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { ExpenseService } from '@app/core/services/expenses.service';
import { CURRENCY_SYMBOLS } from '@app/shared/helpers/currency-symbols';
import { CurrencySymbolPipe } from '@app/shared/pipes/currency-symbol.pipe';
import { Expense, ExpenseExtended, ExpenseUser } from '@models/expenses.model';
import { AuthService } from '@services/auth.service';
import { getCategoryIcon } from '@shared/helpers/get-category-icon';
import { SharedUiModule } from '@shared/shared-ui.module';

import { ExpenseDetailComponent } from '../expense-detail/expense-detail.component';
import { ExpenseFormComponent } from '../expense-form/expense-form.component';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [CommonModule, SharedUiModule, TranslateModule, CurrencySymbolPipe],
  templateUrl: './expenses.component.html',
  styleUrls: ['./expenses.component.scss'],
})
export class ExpensesComponent {
  Math = Math;
  @Input() expenses: Expense[] = [];
  @Input() loading = false;
  @Input() groupMembers: { userId: number; name: string }[] = [];
  @Input() groupId: number | undefined;
  @Output() expenseDeleted = new EventEmitter<number>();

  private authService = inject(AuthService);
  private translate = inject(TranslateService);
  private dialog = inject(MatDialog);
  private snackbar = inject(MatSnackBar);
  private expenseService = inject(ExpenseService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  totalAmount = 0;

  getCategoryIcon = getCategoryIcon;

  ngOnInit() {
    this.calculateTotal();
  }

  get groupedExpenses() {
    const map = new Map<string, Expense[]>();

    for (const exp of this.expenses) {
      const date = new Date(exp.createdAt);
      const month = date.toLocaleString('default', { month: 'long' });
      const year = date.getFullYear();
      const key = `${this.capitalizeFirstLetter(month)} ${year}`;

      if (!map.has(key)) {
        map.set(key, []);
      }

      map.get(key)!.push(exp);
    }

    return Array.from(map.entries());
  }

  private capitalizeFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  get currentUser() {
    return this.authService.currentUser();
  }

  getUserName(userId: number): string {
    const member = this.groupMembers.find((m) => m.userId === userId);
    return member ? member.name || `User ${userId}` : `User ${userId}`;
  }

  getPaidBy(exp: Expense | ExpenseExtended): ExpenseUser[] {
    return (
      (exp as ExpenseExtended).paidBy || exp.participants?.filter((p) => Number(p.amount) > 0) || []
    );
  }

  getSplits(exp: Expense) {
    return (exp as any).splits || exp.participants || [];
  }

  getPaidByText(exp: Expense): string {
    const paidBy = this.getPaidBy(exp);
    if (!paidBy.length) return '';
    const user = this.authService.currentUser();
    const symbol = CURRENCY_SYMBOLS[exp.currency.toUpperCase()] || exp.currency;

    if (paidBy.length === 1) {
      const onlyPayer = paidBy[0];
      const name = this.getUserName(onlyPayer.userId);
      if (user && onlyPayer.userId === user.id) {
        return this.translate.instant('expenses.youPaid', {
          amount: Number(onlyPayer.amount).toFixed(2),
          currency: symbol,
        });
      }
      return this.translate.instant('expenses.paidBy', {
        name,
        amount: Number(onlyPayer.amount).toFixed(2),
        currency: symbol,
      });
    }

    const names = paidBy.map((p) => this.getUserName(p.userId)).join(', ');
    const total = paidBy.reduce((sum, p) => sum + Number(p.amount), 0);

    return this.translate.instant('expenses.paidByMultiple', {
      names,
      total: total.toFixed(2),
      currency: symbol,
    });
  }

  getUserLent(exp: Expense): number {
    const user = this.currentUser;
    if (!user) return 0;

    const paidBy = this.getPaidBy(exp);
    const userPaid = Number(paidBy.find((p: any) => p.userId === user.id)?.amount || 0);
    const validUserIds = this.groupMembers.map((m) => m.userId);
    const uniqueParticipants = new Map<number, number>();

    for (const p of exp.participants ?? []) {
      if (!validUserIds.includes(p.userId)) continue;
      const current = uniqueParticipants.get(p.userId) || 0;
      uniqueParticipants.set(p.userId, current + Number(p.amount));
    }

    const numPeople = uniqueParticipants.size;
    const total = Number(exp.total);
    const userShare = total / numPeople;
    const lent = userPaid - userShare;

    return lent;
  }

  getUserPaid(exp: Expense): number {
    const user = this.currentUser;
    if (!user) return 0;
    const paidBy = this.getPaidBy(exp);
    return paidBy.find((p: any) => p.userId === user.id)?.amount || 0;
  }

  getLendLabel(exp: Expense): string {
    const lent = this.getUserLent(exp);
    if (lent > 0) return this.translate.instant('expenses.youLent');
    if (lent < 0) return this.translate.instant('expenses.youBorrowed');
    return '';
  }

  openExpenseDetail(expense: Expense) {
    const mergedExpense = { ...expense, groupId: this.groupId };

    const dialogRef = this.dialog.open(ExpenseDetailComponent, {
      data: { expense: mergedExpense },
      width: '100vw',
      height: '100vh',
      maxWidth: '100vw',
      panelClass: 'full-screen-modal',
    });

    const popStateListener = () => dialogRef.close();
    window.addEventListener('popstate', popStateListener);

    dialogRef.afterClosed().subscribe((result: any) => {
      window.removeEventListener('popstate', popStateListener);
      if (!result) return;

      if (result.action === 'edit') {
        if (result.expense?.id && result.expense?.groupId) {
          void this.router.navigate(['../expenses', result.expense.id, 'edit'], {
            relativeTo: this.route,
            state: { expense: result.expense },
          });
        } else {
          console.warn('No se pudo redirigir: falta expense.id o groupId');
        }
      }

      if (result.action === 'delete') {
        this.deleteExpense(result.expense);
      }
    });
  }

  openExpenseForm(expense: Expense) {
    const dialogRef = this.dialog.open(ExpenseFormComponent, {
      data: { expense },
      width: '100vw',
      height: '100vh',
      maxWidth: '100vw',
      panelClass: 'full-screen-modal',
    });

    const popStateListener = () => dialogRef.close();
    window.addEventListener('popstate', popStateListener);

    dialogRef.afterClosed().subscribe(() => {
      window.removeEventListener('popstate', popStateListener);
    });
  }

  deleteExpense(expense: Expense) {
    this.expenseService.deleteExpense(expense.id!).subscribe({
      next: () => {
        this.snackbar.open(this.translate.instant('expenses.deletedSuccess'), 'OK', {
          duration: 2000,
        });

        this.expenses = this.expenses.filter((e) => e.id !== expense.id);
        this.expenseDeleted.emit(expense.id!);
        this.calculateTotal();
      },
      error: (error) => {
        console.error('Error deleting expense:', error);
        this.snackbar.open(this.translate.instant('expenses.deleteError'), 'OK', {
          duration: 3000,
        });
      },
    });
  }

  calculateTotal() {
    this.totalAmount = this.expenses.reduce((sum, e) => sum + Number(e.total), 0);
  }
}
