import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { ExpenseRequest } from '@app/core/models/expenses.model';
import { AuthService } from '@app/core/services/auth.service';
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
  private expenseService = inject(ExpenseService);
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  groupId!: number;

  expenseForm: FormGroup = this.fb.group({
    description: ['', Validators.required],
    total: [null, [Validators.required, Validators.min(0.01)]],
    currency: ['USD', Validators.required],
  });

  constructor() {
    const groupIdParam = this.route.snapshot.paramMap.get('groupId');
    this.groupId = groupIdParam ? +groupIdParam : NaN;

    if (isNaN(this.groupId)) {
      console.error('❌ Invalid groupId');
    }
  }

  submitExpense() {
    if (!this.groupId) {
      console.error('❌ groupId is undefined');
      return;
    }

    if (this.expenseForm.invalid) return;

    const currentUser = this.authService.currentUser();
    if (!currentUser) {
      console.error('User not logged in');
      return;
    }

    const { description, total, currency } = this.expenseForm.value;
    const groupMembers = [currentUser.id, 637, 636];
    const splitAmount = Number((total / groupMembers.length).toFixed(2));
    const splits = groupMembers.map((userId) => ({ userId, amount: splitAmount }));

    const expense: ExpenseRequest = {
      groupId: this.groupId,
      description,
      total,
      currency,
      paidBy: [{ userId: currentUser.id, amount: total }],
      splits,
    };

    this.expenseService.createExpense(expense).subscribe({
      next: (response) => {
        this.router.navigate(['/group', this.groupId, 'expenses']);
      },
      error: (error) => {
        console.error('❌ Error creating expense:', error);
      },
    });
  }
}
