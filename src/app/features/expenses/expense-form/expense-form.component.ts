import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { SnackbarService } from '@app/core/services/snackbar.service';
import { EXPENSE_CATEGORIES } from '@app/shared/data/expense-categories';
import { getCategoryIcon } from '@app/shared/helpers/get-category-icon';
import { CategorySelectorComponent } from '@features/expenses/components/category-selector/category-selector.component';
import { CurrencySelectorComponent } from '@features/expenses/components/currency-selector/currency-selector.component';
import { SplitSelectorComponent } from '@features/expenses/components/split-selector/split-selector.component';
import { FooterComponent } from '@features/footer/footer.component';
import { ExpenseRequest, ExpenseUser } from '@models/expenses.model';
import { GroupDetail, GroupMember } from '@models/group-detail.model';
import { AuthService } from '@services/auth.service';
import { ExpenseService } from '@services/expenses.service';
import { GroupService } from '@services/group.service';
import { SharedUiModule } from '@shared/shared-ui.module';

@Component({
  selector: 'app-expense-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    SharedUiModule,
    CommonModule,
    SplitSelectorComponent,
    FooterComponent,
    TranslateModule,
  ],
  templateUrl: './expense-form.component.html',
  styleUrls: ['./expense-form.component.scss'],
})
export class ExpenseFormComponent implements OnInit {
  private expenseService = inject(ExpenseService);
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private groupService = inject(GroupService);
  private snackbar = inject(SnackbarService);
  private translate = inject(TranslateService);

  @ViewChild(SplitSelectorComponent)
  splitSelectorComponent!: SplitSelectorComponent;
  @ViewChild(FooterComponent)
  footerComponent!: FooterComponent;

  groupId!: number;
  group: GroupDetail | null = null;
  expenseId: number | null = null;
  isEditMode = false;

  selectedPayer: { userId: number; name: string } | null = null;

  expenseForm: FormGroup = this.fb.group({
    description: ['', Validators.required],
    total: [null, [Validators.required, Validators.min(0.01)]],
    currency: ['ARS', Validators.required],
    createdAt: [new Date(), Validators.required],
    category: [''],
  });

  get members(): GroupMember[] {
    return this.group?.members ?? [];
  }

  selectedCategory: string = '';
  selectedCategoryIcon: string = '';
  selectedCategoryLabel: string = '';
  isSubmitting = false;

  ngOnInit() {
    this.expenseForm.get('description')?.valueChanges.subscribe((desc: string) => {
      if (!this.selectedCategory) {
        this.selectedCategoryIcon = getCategoryIcon(desc);
      }
    });

    const expenseIdParam = this.route.snapshot.paramMap.get('expenseId');
    this.expenseId = expenseIdParam ? +expenseIdParam : null;
    this.isEditMode = !!this.expenseId;

    const expenseFromState = history.state?.expense;
    if (expenseFromState) {
      this.expenseId = expenseFromState.id;
      this.isEditMode = true;

      this.expenseForm.patchValue({
        description: expenseFromState.description,
        total: expenseFromState.total,
        currency: expenseFromState.currency,
        createdAt: new Date(expenseFromState.createdAt),
      });

      this.selectedCategory = expenseFromState.category || '';
      if (this.selectedCategory) {
        this.updateCategoryIcon(this.selectedCategory);
      }
    }

    const groupId = this.findGroupIdInRoute(this.route);
    if (groupId === null) {
      console.warn('⚠️ groupId inválido o no encontrado en la ruta');
      return;
    }
    this.groupId = groupId;

    if (!this.groupId) {
      console.warn('⚠️ groupId inválido o no encontrado en la ruta');
      return;
    }

    this.groupService.getGroupDetail(this.groupId).subscribe({
      next: (group) => {
        this.group = group;
        setTimeout(() => {
          const currentUserId = this.authService.currentUser()?.id;
          if (currentUserId) {
            this.splitSelectorComponent?.setPayer(currentUserId);

            const payerSignal = this.splitSelectorComponent?.getSelectedPayerSignal();
            if (payerSignal) {
              this.selectedPayer = payerSignal();
            }
          }
        }, 0);
      },
      error: (err) => {
        console.error('[ExpenseForm] Error loading group:', err);
        this.snackbar.show(this.translate.instant('expenseForm.loadGroupError'));
      },
    });
  }

  private findGroupIdInRoute(route: ActivatedRoute): number | null {
    let currentRoute: ActivatedRoute | null = route;
    while (currentRoute) {
      const groupIdParam =
        currentRoute.snapshot.paramMap.get('groupId') ?? currentRoute.snapshot.paramMap.get('id');
      if (groupIdParam) {
        const id = Number(groupIdParam);
        if (!isNaN(id)) return id;
      }
      currentRoute = currentRoute.parent;
    }
    return null;
  }

  submitExpense() {
    if (!this.groupId || this.expenseForm.invalid || !this.group) return;

    const currentUser = this.authService.currentUser();
    if (!currentUser) {
      console.error(this.translate.instant('expenseForm.userNotLoggedIn'));
      return;
    }

    const { description, currency, createdAt } = this.expenseForm.value;

    let isoDate: string | undefined;
    if (typeof createdAt === 'string') {
      const [year, month, day] = createdAt.split('-').map(Number);
      const localDate = new Date(year, month - 1, day, 12, 0, 0);
      isoDate = localDate.toISOString();
    } else if (createdAt instanceof Date) {
      isoDate = createdAt.toISOString();
    } else {
      isoDate = undefined;
    }

    const total = Number(this.expenseForm.value.total);
    const groupMembers = this.group.members.map((m) => m.userId);
    const splits = this.buildSplits(groupMembers, total);

    const selectedPayerSignal = this.splitSelectorComponent?.getSelectedPayerSignal?.();
    const selectedPayer = selectedPayerSignal?.();

    if (!selectedPayer) {
      console.warn(this.translate.instant('expenseForm.noPayerSelected'));
      return;
    }
    const expense: ExpenseRequest = {
      groupId: this.groupId,
      description,
      total,
      currency,
      createdAt: isoDate,
      paidBy: [{ userId: selectedPayer.userId, amount: total }],
      splits,
    };

    this.isSubmitting = true;
    const obs$ = this.isEditMode
      ? this.expenseService.updateExpense(this.expenseId!, expense)
      : this.expenseService.createExpense(expense);

    obs$.subscribe({
      next: () => {
        void this.router.navigate(['/groups', this.groupId]);
      },
      error: (error) => {
        const validationErrors = error?.error?.error?.details?.errors;
        if (validationErrors) {
          console.error('Validation errors:', validationErrors);
        } else {
          console.error(this.translate.instant('expenseForm.createError'), error);
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

    const popStateListener = () => dialogRef.close();
    window.addEventListener('popstate', popStateListener);

    dialogRef.componentInstance.selected.subscribe((currency: string) => {
      window.removeEventListener('popstate', popStateListener);
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

    const popStateListener = () => dialogRef.close();
    window.addEventListener('popstate', popStateListener);

    dialogRef.afterClosed().subscribe((selectedCategory: string) => {
      window.removeEventListener('popstate', popStateListener);
      if (selectedCategory) {
        this.selectedCategory = selectedCategory;
        this.selectedCategoryLabel =
          EXPENSE_CATEGORIES.find((c) => c.key === selectedCategory)?.label || '';
        this.updateCategoryIcon(selectedCategory);
        this.expenseForm.patchValue({ category: selectedCategory });
      }
    });
  }

  updateCategoryIcon(category: string): void {
    const found = EXPENSE_CATEGORIES.find((c) => c.key === category);
    this.selectedCategoryIcon = found?.icon || '/assets/default.svg';
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
      console.warn(this.translate.instant('expenseForm.invalidGroupIdOnGoBack'));
      void this.router.navigate(['/groups']);
      return;
    }
    void this.router.navigate(['/groups', this.groupId]);
  }

  get expenseCreatedAtForFooter(): Date {
    const val = this.expenseForm.value.createdAt;
    if (val instanceof Date) return val;
    if (typeof val === 'string') return new Date(val);
    return new Date();
  }

  setExpenseDate(createdAt: Date) {
    this.expenseForm.get('createdAt')?.setValue(createdAt);
  }

  onPayerChanged(payer: { userId: number; name: string }) {
    this.selectedPayer = payer;
  }
}
