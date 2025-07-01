import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

import { Expense } from '@models/expenses.model';
import { getCategoryIcon } from '@shared/helpers/get-category-icon';
import { SharedUiModule } from '@shared/shared-ui.module';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [CommonModule, SharedUiModule],
  templateUrl: './expenses.component.html',
  styleUrls: ['./expenses.component.scss'],
})
export class ExpensesComponent {
  @Input() expenses: Expense[] = [];
  @Input() loading = false;

  getCategoryIcon = getCategoryIcon;

  get groupedExpenses() {
    const map = new Map<string, Expense[]>();

    for (const exp of this.expenses) {
      const month = new Date(exp.createdAt).toLocaleString('default', {
        month: 'long',
      });
      if (!map.has(month)) {
        map.set(month, []);
      }
      map.get(month)!.push(exp);
    }

    return Array.from(map.entries());
  }
}
