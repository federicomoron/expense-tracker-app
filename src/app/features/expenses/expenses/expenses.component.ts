import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { GroupMember } from '@config/core/models/group-detail.model';
import { ExpenseFormComponent } from '@features/expenses/expense-form/expense-form.component';
import { Expense, ExpenseExtended, ExpenseUser } from '@models/expenses.model';
import { AuthService } from '@services/auth.service';
import { DialogService } from '@services/dialog.service';
import { ExpenseService } from '@services/expenses.service';
import { EXPENSE_CATEGORIES } from '@shared/data/expense-categories';
import { CURRENCY_SYMBOLS } from '@shared/helpers/currency-symbols';
import {
  detectQuickOptionFromParticipants,
  getPaidBy,
  resolvePayerNameFromExpense,
} from '@shared/helpers/expense.utils';
import { CurrencySymbolPipe } from '@shared/pipes/currency-symbol.pipe';
import { SharedMaterialModule } from '@shared/shared-material.module';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [CommonModule, SharedMaterialModule, TranslateModule, CurrencySymbolPipe],
  templateUrl: './expenses.component.html',
  styleUrls: ['./expenses.component.scss'],
})
export class ExpensesComponent {
  Math = Math;

  private readonly authService = inject(AuthService);
  private readonly translate = inject(TranslateService);
  private readonly snackbar = inject(MatSnackBar);
  private readonly expenseService = inject(ExpenseService);
  private readonly router = inject(Router);
  private readonly dialogService = inject(DialogService);

  @Input() expenses: Expense[] = [];
  @Input() loading = false;
  @Input() groupMembers: ReadonlyArray<{ userId: number; name: string }> = [];
  @Input() groupId: number | undefined;
  @Output() expenseDeleted = new EventEmitter<number>();

  totalAmount = 0;

  ngOnInit() {
    this.calculateTotal();
  }

  get currentUser() {
    return this.authService.currentUser();
  }

  get groupedExpenses() {
    const map = new Map<string, Expense[]>();

    for (const exp of this.expenses) {
      const date = new Date(exp.createdAt);
      const month = date.toLocaleString('default', { month: 'long' });
      const year = date.getFullYear();
      const key = `${this.capitalizeFirstLetter(month)} ${year}`;

      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(exp);
    }

    return Array.from(map.entries());
  }

  openExpenseDetail(expense: Expense) {
    void this.router.navigate(['/groups', this.groupId, 'expenses', expense.id]);
  }

  openExpenseForm(expense: Expense) {
    const currentUserId = this.currentUser?.id;
    const optionId =
      (expense as any).optionId ?? detectQuickOptionFromParticipants(expense, currentUserId);

    const expenseWithOptionId: ExpenseExtended = {
      ...expense,
      optionId,
      paidBy: (expense as any).paidBy,
      splits: (expense as any).splits,
    };

    const dialogRef = this.dialogService.openFullScreen(ExpenseFormComponent, {
      expense: expenseWithOptionId,
    });

    dialogRef.afterClosed().subscribe(() => {});
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
      error: () => {
        this.snackbar.open(this.translate.instant('expenses.deleteError'), 'OK', {
          duration: 3000,
        });
      },
    });
  }

  calculateTotal() {
    this.totalAmount = this.expenses.reduce((sum, e) => sum + Number(e.total), 0);
  }

  /** Returns a human-readable string describing who paid */
  getPaidByText(exp: Expense): string {
    const paidBy: ExpenseUser[] = getPaidBy(exp);
    if (!paidBy.length) return '';

    const user = this.currentUser;
    const symbol = CURRENCY_SYMBOLS[exp.currency.toUpperCase()] || exp.currency;

    if (paidBy.length === 1) {
      const onlyPayer = paidBy[0];

      const name = resolvePayerNameFromExpense(
        { ...exp, paidBy: [onlyPayer] } as ExpenseExtended,
        [...this.groupMembers] as GroupMember[],
        user?.id,
      );

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

    const names = paidBy
      .map((p: ExpenseUser) =>
        resolvePayerNameFromExpense(
          { ...exp, participants: [p] } as ExpenseExtended,
          [...this.groupMembers] as GroupMember[],
          user?.id,
        ),
      )
      .join(', ');

    const total = paidBy.reduce((sum: number, p: ExpenseUser) => sum + Number(p.amount), 0);

    return this.translate.instant('expenses.paidByMultiple', {
      names,
      total: total.toFixed(2),
      currency: symbol,
    });
  }

  getUserLent(exp: Expense, _optionId?: string): number {
    const user = this.currentUser;
    if (!user) return 0;

    const paidBy: ExpenseUser[] =
      (exp as ExpenseExtended).paidBy ||
      exp.participants?.filter((p) => Number(p.amount) > 0) ||
      [];
    const splits: ExpenseUser[] = this.getSplits(exp);
    const totalNum = Number(exp.total);
    const userPaid = Number(paidBy.find((p) => p.userId === user.id)?.amount || 0);

    if (splits.length === 2) {
      const currentUserSplit = splits.find((s) => s.userId === user.id);
      const otherSplit = splits.find((s) => s.userId !== user.id);

      if (currentUserSplit && otherSplit) {
        if (currentUserSplit.amount === totalNum && otherSplit.amount === 0) return totalNum;
        if (
          currentUserSplit.amount === totalNum &&
          otherSplit.amount === 0 &&
          paidBy[0].userId !== user.id
        )
          return -totalNum;
        if (
          currentUserSplit.amount === 0 &&
          otherSplit.amount === totalNum &&
          paidBy.some((p) => p.userId === otherSplit.userId)
        )
          return -totalNum;
      }
    }

    const validUserIds = this.groupMembers.map((m) => m.userId);
    const uniqueParticipants = new Map<number, number>();
    for (const p of exp.participants ?? []) {
      if (!validUserIds.includes(p.userId)) continue;
      uniqueParticipants.set(p.userId, (uniqueParticipants.get(p.userId) || 0) + Number(p.amount));
    }

    const numPeople = uniqueParticipants.size || 1;
    const userShare = totalNum / numPeople;
    return userPaid - userShare;
  }

  getLendLabel(exp: Expense, optionId?: string): string {
    const lent = this.getUserLent(exp, optionId);
    if (lent > 0) return this.translate.instant('expenses.youLent');
    if (lent < 0) return this.translate.instant('expenses.youBorrowed');
    return '';
  }

  getUserPaid(exp: Expense): number {
    const user = this.currentUser;
    if (!user) return 0;
    const paidBy: ExpenseUser[] =
      (exp as ExpenseExtended).paidBy ||
      exp.participants?.filter((p) => Number(p.amount) > 0) ||
      [];
    return paidBy.find((p) => p.userId === user.id)?.amount || 0;
  }

  getCategoryIconFromDescription(description: string): string {
    if (!description) return '/assets/category-default.svg';
    const desc = description.toLowerCase();

    let category =
      EXPENSE_CATEGORIES.find((c) => c.label.toLowerCase() === desc) ||
      EXPENSE_CATEGORIES.find((c) => c.label.toLowerCase().includes(desc));

    if (!category) {
      category = EXPENSE_CATEGORIES.find((c) =>
        c.keywords?.some((k) => desc.includes(k.toLowerCase())),
      );
    }

    return category?.icon || '/assets/category-default.svg';
  }

  private capitalizeFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  private getSplits(exp: Expense): ExpenseUser[] {
    const rawSplits = (exp as any).splits || exp.participants || [];
    const userMap = new Map<number, number>();

    for (const s of rawSplits) {
      userMap.set(s.userId, (userMap.get(s.userId) || 0) + Number(s.amount));
    }

    return Array.from(userMap.entries()).map(([userId, amount]) => ({
      userId,
      amount: Math.max(0, Math.round(amount * 100) / 100),
    }));
  }
}
