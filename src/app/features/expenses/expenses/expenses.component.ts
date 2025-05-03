import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

import { Expense } from '@app/core/models/expenses.model';
import { SharedUiModule } from '@app/shared/shared-ui.module';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [CommonModule, SharedUiModule],
  templateUrl: './expenses.component.html',
})
export class ExpensesComponent {
  // @Input() groupId!: number;

  // expenses = signal<Expense[]>([]);

  // loading = signal(true);

  @Input() expenses: Expense[] = [];

  // private readonly expenseService = inject(ExpenseService);

  // ngOnInit(): void {
  //   this.expenseService.getExpensesByGroupId(this.groupId).subscribe({
  //     next: (res) => {
  //       const parsed = res.map((r) => r.data);
  //       this.expenses.set(parsed);
  //       this.loading.set(false);
  //     },
  //     error: () => {
  //       this.expenses.set([]);
  //       this.loading.set(false);
  //     },
  //   });
  // }
}
