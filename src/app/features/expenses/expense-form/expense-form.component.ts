import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';

import { CategorySelectorComponent } from '@features/expenses/components/category-selector/category-selector.component';
import { CurrencySelectorComponent } from '@features/expenses/components/currency-selector/currency-selector.component';
import { SplitSelectorComponent } from '@features/expenses/components/split-selector/split-selector.component';
import { ExpenseRequest, ExpenseUser } from '@models/expenses.model';
import { GroupDetail } from '@models/group-detail.model';
import { AuthService } from '@services/auth.service';
import { ExpenseService } from '@services/expenses.service';
import { GroupService } from '@services/group.service';
import { SharedUiModule } from '@shared/shared-ui.module';

@Component({
  selector: 'app-expense-form',
  standalone: true,
  imports: [ReactiveFormsModule, SharedUiModule, CommonModule, SplitSelectorComponent],
  templateUrl: './expense-form.component.html',
  styleUrl: './expense-form.component.scss',
})
export class ExpenseFormComponent implements OnInit {
  private expenseService = inject(ExpenseService);
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private groupService = inject(GroupService);

  @ViewChild(SplitSelectorComponent)
  splitSelectorComponent!: SplitSelectorComponent;

  groupId!: number;
  group: GroupDetail | null = null;

  expenseForm: FormGroup = this.fb.group({
    description: ['', Validators.required],
    total: [null, [Validators.required, Validators.min(0.01)]],
    currency: ['USD', Validators.required],
  });

  selectedCategory: string = '';
  selectedCategoryIcon: string = '';
  selectedCategoryLabel: string = '';
  isSubmitting = false;

  ngOnInit() {
    const groupIdParam = this.route.snapshot.paramMap.get('groupId');
    this.groupId = groupIdParam ? +groupIdParam : NaN;

    if (isNaN(this.groupId)) {
      console.error('❌ Invalid groupId');
      return;
    }

    this.groupService.getGroupDetail(this.groupId).subscribe({
      next: (group) => {
        this.group = group;
      },
      error: (err) => {
        console.error('❌ Error loading group:', err);
      },
    });
  }

  submitExpense() {
    if (!this.groupId || this.expenseForm.invalid || !this.group) return;

    const currentUser = this.authService.currentUser();
    if (!currentUser) {
      console.error('User not logged in');
      return;
    }

    const { description, currency } = this.expenseForm.value;
    const total = Number(this.expenseForm.value.total);
    const groupMembers = this.group.members.map((m) => m.userId);
    const splits = this.buildSplits(groupMembers, total);

    const selectedPayer = this.splitSelectorComponent.selectedPayer();

    if (!selectedPayer) {
      console.warn('⚠️ No payer selected – expense not submitted');
      return;
    }

    const expense: ExpenseRequest = {
      groupId: this.groupId,
      description,
      total,
      currency,
      paidBy: [{ userId: selectedPayer.userId, amount: total }],
      splits,
    };

    this.isSubmitting = true;
    this.expenseService.createExpense(expense).subscribe({
      next: () => {
        void this.router.navigate(['/groups', this.groupId, 'expenses']);
      },
      error: (error) => {
        const validationErrors = error?.error?.error?.details?.errors;
        if (validationErrors) {
          console.error('Validation errors:', validationErrors);
        } else {
          console.error('Error al crear el gasto:', error);
        }

        this.isSubmitting = false;
      },
    });
  }

  openCurrencySelector() {
    const dialogRef = this.dialog.open(CurrencySelectorComponent, {
      width: '100vw',
      height: '100vh',
      maxWidth: '100vw',
      panelClass: 'full-screen-modal',
    });
    dialogRef.componentInstance.selected.subscribe((currency: string) => {
      this.expenseForm.get('currency')?.setValue(currency);
      dialogRef.close();
    });
  }

  openCategorySelector(): void {
    const dialogRef = this.dialog.open(CategorySelectorComponent, {
      width: '100vw',
      height: '100vh',
      maxWidth: '100vw',
      panelClass: 'full-screen-modal',
    });
    dialogRef.afterClosed().subscribe((selectedCategory: string) => {
      if (selectedCategory) {
        this.expenseForm.patchValue({ category: selectedCategory });
        this.updateCategoryIcon(selectedCategory);
      }
    });
  }

  updateCategoryIcon(category: string): void {
    switch (category) {
      case 'Food':
        this.selectedCategoryIcon = 'assets/food.svg';
        break;
      case 'water':
        this.selectedCategoryIcon = 'assets/water.svg';
        break;
      case 'Rent':
        this.selectedCategoryIcon = 'assets/home.svg';
        break;
      default:
        this.selectedCategoryIcon = '';
    }
  }

  private buildSplits(userIds: number[], total: number): ExpenseUser[] {
    const baseAmount = Math.floor((total / userIds.length) * 100) / 100;
    const splits: ExpenseUser[] = [];
    let accumulated = 0;
    for (let i = 0; i < userIds.length; i++) {
      if (i === userIds.length - 1) {
        const adjustedAmount = Math.round((total - accumulated) * 100) / 100;
        splits.push({ userId: userIds[i], amount: adjustedAmount });
      } else {
        splits.push({ userId: userIds[i], amount: baseAmount });
        accumulated += baseAmount;
      }
    }
    return splits;
  }

  goBack() {
    if (isNaN(this.groupId)) {
      console.warn('⚠️ Invalid groupId on goBack');
      void this.router.navigate(['/groups']);
      return;
    }
    void this.router.navigate(['/groups', this.groupId]);
  }
}
