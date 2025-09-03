import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { PaidByOption, PaidByOptionId } from '@app/core/models/paid-by-option.model';
import { SnackbarService } from '@app/core/services/snackbar.service';
import { EXPENSE_CATEGORIES } from '@app/shared/data/expense-categories';
import {
  detectQuickOptionFromParticipants,
  findGroupIdInRoute,
  resolvePayerNameFromExpense,
} from '@app/shared/helpers/expense.utils';
import { CategorySelectorComponent } from '@features/expenses/components/category-selector/category-selector.component';
import { CurrencySelectorComponent } from '@features/expenses/components/currency-selector/currency-selector.component';
import { SplitSelectorComponent } from '@features/expenses/components/split-selector/split-selector.component';
import { FooterComponent } from '@features/footer/footer.component';
import { ExpenseExtended, ExpenseRequest, ExpenseUser } from '@models/expenses.model';
import { GroupDetail } from '@models/group-detail.model';
import { AuthService } from '@services/auth.service';
import { ExpenseService } from '@services/expenses.service';
import { GroupService } from '@services/group.service';
import { SharedUiModule } from '@shared/shared-ui.module';
import { nonEmpty } from '@shared/utils/form-validators';

import { PaidByDialogComponent } from '../components/paid-by-dialog/paid-by-dialog.component';
import { PaidByQuickDialogComponent } from '../components/paid-by-quick-dialog/paid-by-quick-dialog.component';

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

  @ViewChild(SplitSelectorComponent) splitSelectorComponent!: SplitSelectorComponent;
  @ViewChild(FooterComponent) footerComponent!: FooterComponent;

  expenseToEdit = signal<ExpenseExtended | null>(null);
  selectedPaidByOption: PaidByOption | null = null;
  selectedOptionIdForSplit: PaidByOptionId | null = null;

  groupId!: number;
  group: GroupDetail | null = null;
  expenseId: number | null = null;
  isEditMode = false;
  selectedPayer: { userId: number; name: string } | null = null;

  expenseForm: FormGroup = this.fb.group({
    description: ['', [Validators.required, Validators.minLength(2), nonEmpty]],
    total: [null, [Validators.required, Validators.min(0.01), Validators.max(10000000)]],
    currency: ['ARS', Validators.required],
    createdAt: [new Date(), Validators.required],
    category: [''],
  });

  selectedCategory = '';
  selectedCategoryIcon = '';
  selectedCategoryLabel = '';
  isSubmitting = false;

  ngOnInit() {
    this.expenseId = this.route.snapshot.paramMap.get('expenseId')
      ? +this.route.snapshot.paramMap.get('expenseId')!
      : null;
    this.isEditMode = !!this.expenseId;

    // Detect groupId using the imported function
    const groupId = findGroupIdInRoute(this.route);
    if (!groupId) return;
    this.groupId = groupId;

    // Load group details
    this.groupService.getGroupDetail(this.groupId).subscribe({
      next: (group) => {
        this.group = group;

        let expenseFromState = history.state?.expense as ExpenseExtended | undefined;

        // If editing, try to get the expense from state or group expenses
        if (!expenseFromState && this.isEditMode) {
          expenseFromState = group.expenses?.find((e) => e.id === this.expenseId);
        }

        if (!expenseFromState) {
          this.isEditMode = false;

          // Default quick option for a new expense
          this.selectedPaidByOption = {
            id: 'you_paid_equal',
            label: this.translate.instant('paidByQuickDialog.youPaidEqual'),
          };
          this.selectedOptionIdForSplit = 'you_paid_equal';

          setTimeout(() => {
            this.splitSelectorComponent?.selectedOption.set(this.selectedPaidByOption);
            const currentUserId = this.authService.currentUser()?.id;
            if (currentUserId) {
              this.splitSelectorComponent?.setPayer(currentUserId);
              const payerSignal = this.splitSelectorComponent?.getSelectedPayerSignal();
              if (payerSignal) this.selectedPayer = payerSignal();
            }
          });
        } else {
          // Editing an existing expense
          if (!expenseFromState.optionId) {
            const currentUserId = this.authService.currentUser()?.id;
            expenseFromState.optionId = detectQuickOptionFromParticipants(
              expenseFromState,
              currentUserId,
            );
          }

          this.initializeSelectedOption(expenseFromState);
          this.expenseToEdit.set(expenseFromState);
          this.expenseId = expenseFromState.id;
          this.isEditMode = true;

          this.expenseForm.patchValue({
            description: expenseFromState.description,
            total: expenseFromState.total,
            currency: expenseFromState.currency,
            createdAt: new Date(expenseFromState.createdAt),
            category: expenseFromState.category || '',
          });

          if (expenseFromState.category) {
            this.updateCategoryIcon(expenseFromState.category);
          }

          const currentUserId = this.authService.currentUser()?.id;
          const payerName = resolvePayerNameFromExpense(
            expenseFromState,
            group.members,
            currentUserId,
          );

          if (expenseFromState.optionId) {
            const optionId = expenseFromState.optionId as PaidByOptionId;
            const newLabel = this.mapOptionIdToLabel(optionId, payerName);
            this.selectedPaidByOption = { id: optionId, label: newLabel };
            setTimeout(() => {
              this.splitSelectorComponent?.selectedOption.set(this.selectedPaidByOption);
              this.selectedOptionIdForSplit = optionId;
            });
          }

          setTimeout(() => {
            const currentUserId = this.authService.currentUser()?.id;
            if (currentUserId) {
              this.splitSelectorComponent?.setPayer(currentUserId);
              const payerSignal = this.splitSelectorComponent?.getSelectedPayerSignal();
              if (payerSignal) this.selectedPayer = payerSignal();
            }
          }, 0);
        }
      },
      error: (err) => {
        this.snackbar.show(this.translate.instant('expenseForm.loadGroupError'));
      },
    });
  }

  private initializeSelectedOption(expense: ExpenseExtended) {
    const validOptions: PaidByOptionId[] = [
      'you_paid_equal',
      'you_are_owed',
      'other_paid_equal',
      'other_is_owed',
    ];
    if (expense.optionId && validOptions.includes(expense.optionId)) {
      this.selectedPaidByOption = {
        id: expense.optionId,
        label: this.mapOptionIdToLabel(expense.optionId),
      };
      this.splitSelectorComponent?.selectedOption.set(this.selectedPaidByOption);
      this.selectedOptionIdForSplit = expense.optionId;
    } else {
      this.selectedPaidByOption = null;
      this.selectedOptionIdForSplit = null;
    }
  }

  mapOptionIdToLabel(optionId: PaidByOptionId, payerName?: string): string {
    switch (optionId) {
      case 'you_paid_equal':
        return this.translate.instant('paidByQuickDialog.youPaidEqual');
      case 'you_are_owed':
        return this.translate.instant('paidByQuickDialog.youAreOwed');
      case 'other_paid_equal':
        return this.translate.instant('paidByQuickDialog.otherPaidEqual', {
          name: payerName ?? '',
        });
      case 'other_is_owed':
        return this.translate.instant('paidByQuickDialog.otherIsOwed', { name: payerName ?? '' });
      default:
        return this.translate.instant('expenseForm.defaultLabel');
    }
  }

  submitExpense() {
    if (!this.groupId || !this.group) return;

    this.expenseForm.markAllAsTouched();

    if (this.expenseForm.invalid) return;

    const currentUser = this.authService.currentUser();
    if (!currentUser) return console.error(this.translate.instant('expenseForm.userNotLoggedIn'));

    const { description, currency, createdAt } = this.expenseForm.value;
    const total = Number(this.expenseForm.value.total);

    if (total <= 0) {
      console.error(this.translate.instant('expenseForm.invalidAmount'));
      return;
    }

    const groupMembers = this.group.members.map((m) => m.userId);
    const selectedOption = this.splitSelectorComponent?.selectedOption?.();
    if (!selectedOption?.id) {
      console.error(this.translate.instant('expenseForm.noPayerSelected'));
      return;
    }

    const otherMember = this.group.members.find((m) => m.userId !== currentUser.id);

    let paidBy: ExpenseUser[] = [{ userId: currentUser.id, amount: total }];
    let splits: ExpenseUser[] = this.buildSplits(groupMembers, total);

    if (groupMembers.length === 2 && otherMember) {
      const half = Math.round((total / 2) * 100) / 100;
      switch (selectedOption.id) {
        case 'you_paid_equal':
          splits = [
            { userId: currentUser.id, amount: half },
            { userId: otherMember.userId, amount: total - half },
          ];
          break;
        case 'you_are_owed':
          splits = [
            { userId: currentUser.id, amount: 0 },
            { userId: otherMember.userId, amount: total },
          ];
          break;
        case 'other_paid_equal':
          splits = [
            { userId: currentUser.id, amount: half },
            { userId: otherMember.userId, amount: total - half },
          ];
          paidBy = [{ userId: otherMember.userId, amount: total }];
          break;
        case 'other_is_owed':
          splits = [
            { userId: currentUser.id, amount: total },
            { userId: otherMember.userId, amount: 0 },
          ];
          paidBy = [{ userId: otherMember.userId, amount: total }];
          break;
      }
    }

    splits = splits.map((s) => ({
      userId: s.userId,
      amount: Math.max(0, Math.round(s.amount * 100) / 100),
    }));

    const createdAtIso =
      createdAt instanceof Date ? createdAt.toISOString() : new Date(createdAt).toISOString();
    const expenseRequest: ExpenseRequest = {
      groupId: this.groupId,
      description,
      total,
      currency,
      createdAt: createdAtIso,
      paidBy,
      splits,
      optionId: selectedOption.id,
    };

    this.isSubmitting = true;
    const obs$ = this.isEditMode
      ? this.expenseService.updateExpense(this.expenseId!, expenseRequest)
      : this.expenseService.createExpense(expenseRequest);

    obs$.subscribe({
      next: () => void this.router.navigate(['/groups', this.groupId]),
      error: (error) => {
        console.error(
          error?.error?.error?.details?.errors ?? this.translate.instant('expenseForm.createError'),
          error,
        );
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
    // Listen for browser navigation to close dialog
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
    // Listen for browser navigation to close dialog
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
    // Update the icon for the selected category
    this.selectedCategoryIcon =
      EXPENSE_CATEGORIES.find((c) => c.key === category)?.icon || '/assets/default.svg';
  }

  private buildSplits(userIds: number[], total: number): ExpenseUser[] {
    // Split the total amount equally among all users, rounding the last user's amount
    const baseAmount = Math.floor((total / userIds.length) * 100) / 100;
    let accumulated = 0;
    return userIds.map((id, index) => {
      const amount =
        index === userIds.length - 1 ? Math.round((total - accumulated) * 100) / 100 : baseAmount;
      accumulated += amount;
      return { userId: id, amount };
    });
  }

  goBack() {
    // Navigate back to the group view
    void this.router.navigate(['/groups', isNaN(this.groupId) ? [] : this.groupId]);
  }

  get expenseCreatedAtForFooter(): Date {
    const val = this.expenseForm.value.createdAt;
    return val instanceof Date ? val : new Date(val);
  }

  setExpenseDate(createdAt: Date) {
    this.expenseForm.get('createdAt')?.setValue(createdAt);
  }

  openPaidByModal(): void {
    if (!this.group) return;
    const useQuick = this.group.members.length <= 2;

    if (useQuick) {
      const dialogRef = this.dialog.open(PaidByQuickDialogComponent, {
        width: '300px',
        data: { members: this.group.members },
      });
      dialogRef
        .afterClosed()
        .subscribe((result: { selectedOption?: PaidByOption; moreOptions?: boolean }) => {
          if (!result) return;
          if (result.moreOptions) this.openFullPaidByDialog();
          else if (result.selectedOption) this.selectedPaidByOption = result.selectedOption;
        });
    } else this.openFullPaidByDialog();
  }

  openFullPaidByDialog(): void {
    if (!this.group) return;
    const dialogRef = this.dialog.open(PaidByDialogComponent, {
      width: '300px',
      data: { members: this.group.members },
    });
    dialogRef.afterClosed().subscribe((selectedMember) => {
      if (!selectedMember) return;
      this.selectedPayer = selectedMember;
      this.splitSelectorComponent?.setPayer(selectedMember.userId);
    });
  }
}
