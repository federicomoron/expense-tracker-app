import { Component, inject, Input } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { ExpenseRequest } from '@app/core/models/expenses.model';
import { ExpenseService } from '@app/core/services/expenses.service';
import { SharedUiModule } from '@app/shared/shared-ui.module';

@Component({
  selector: 'app-expense-form',
  standalone: true,
  imports: [ReactiveFormsModule, SharedUiModule],
  templateUrl: './expense-form.component.html',
  styleUrl: './expense-form.component.scss',
})
export class ExpenseFormComponent {
  @Input() groupId!: number;
  private expenseService = inject(ExpenseService);
  private fb = inject(FormBuilder);

  expenseForm: FormGroup = this.fb.group({
    description: ['', Validators.required],
    total: [null, [Validators.required, Validators.min(0.01)]],
    currency: ['USD', Validators.required],
  });

  submitExpense() {
    if (this.expenseForm.invalid) return;

    const { description, total, currency } = this.expenseForm.value;

    const expense: ExpenseRequest = {
      groupId: Number(this.groupId),
      description,
      total,
      currency,
      paidBy: [{ userId: 6, amount: total }],
      splits: [{ userId: 6, amount: total }],
    };

    this.expenseService.createExpense(expense).subscribe({
      next: (response) =>
        console.log('✅ Expense successfully created:', response),
      error: (error) => console.error('❌ Error creating expense:', error),
    });
  }
}
