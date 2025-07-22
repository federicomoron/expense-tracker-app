import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { Expense, ExpenseExtended, ExpenseUser } from '@models/expenses.model';
import { AuthService } from '@services/auth.service';
import { getCategoryIcon } from '@shared/helpers/get-category-icon';
import { SharedUiModule } from '@shared/shared-ui.module';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [CommonModule, SharedUiModule, TranslateModule],
  templateUrl: './expenses.component.html',
  styleUrls: ['./expenses.component.scss'],
})
export class ExpensesComponent {
  Math = Math;
  @Input() expenses: Expense[] = [];
  @Input() loading = false;
  @Input() groupMembers: { userId: number; name: string }[] = [];

  private authService = inject(AuthService);
  private translate = inject(TranslateService);
  getCategoryIcon = getCategoryIcon;

  get groupedExpenses() {
    const map = new Map<string, Expense[]>();

    for (const exp of this.expenses) {
      const date = new Date(exp.createdAt);
      const month = date.toLocaleString('default', {
        month: 'long',
      });
      if (!map.has(month)) {
        map.set(month, []);
      }
      map.get(month)!.push(exp);
    }

    return Array.from(map.entries());
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

    if (paidBy.length === 1) {
      const onlyPayer = paidBy[0];
      const name = this.getUserName(onlyPayer.userId);
      if (user && onlyPayer.userId === user.id) {
        return this.translate.instant('expenses.youPaid', {
          amount: Number(onlyPayer.amount).toFixed(2),
          currency: exp.currency,
        });
      }
      return this.translate.instant('expenses.paidBy', {
        name,
        amount: Number(onlyPayer.amount).toFixed(2),
        currency: exp.currency,
      });
    }

    const names = paidBy.map((p) => this.getUserName(p.userId)).join(', ');
    const total = paidBy.reduce((sum, p) => sum + Number(p.amount), 0);

    return this.translate.instant('expenses.paidByMultiple', {
      names,
      total: total.toFixed(2),
      currency: exp.currency,
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
}
