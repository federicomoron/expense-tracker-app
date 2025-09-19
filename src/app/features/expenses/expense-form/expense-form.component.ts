import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { PaidByOption, PaidByOptionId } from '@app/core/models/paid-by-option.model';
import { DialogService } from '@app/core/services/dialog.service';
import { SnackbarService } from '@app/core/services/snackbar.service';
import { CategorySelectorComponent } from '@features/expenses/components/category-selector/category-selector.component';
import { CurrencySelectorComponent } from '@features/expenses/components/currency-selector/currency-selector.component';
import { SplitSelectorComponent } from '@features/expenses/components/split-selector/split-selector.component';
import { ExpenseExtended, ExpenseRequest, ExpenseUser } from '@models/expenses.model';
import { GroupDetail } from '@models/group-detail.model';
import { AuthService } from '@services/auth.service';
import { ExpenseService } from '@services/expenses.service';
import { GroupService } from '@services/group.service';
import { FooterComponent } from '@shared/components/footer/footer.component';
import { EXPENSE_CATEGORIES } from '@shared/data/expense-categories';
import {
  detectQuickOptionFromParticipants,
  findGroupIdInRoute,
} from '@shared/helpers/expense.utils';
import { SharedMaterialModule } from '@shared/shared-material.module';
import { nonEmpty } from '@shared/utils/form-validators';

import { PaidByDialogComponent } from '../components/paid-by-dialog/paid-by-dialog.component';
import { PaidByQuickDialogComponent } from '../components/paid-by-quick-dialog/paid-by-quick-dialog.component';

@Component({
  selector: 'app-expense-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    SharedMaterialModule,
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
  private groupService = inject(GroupService);
  private snackbar = inject(SnackbarService);
  private translate = inject(TranslateService);
  private cdr = inject(ChangeDetectorRef);
  private dialogService = inject(DialogService);

  @ViewChild(SplitSelectorComponent) splitSelectorComponent!: SplitSelectorComponent;
  @ViewChild(FooterComponent) footerComponent!: FooterComponent;

  expenseToEdit = signal<ExpenseExtended | null>(null);
  selectedCategory = signal<string | null>(null);
  selectedCategoryLabel = signal<string | null>(null);
  selectedCategoryIcon = signal<string | null>(null);

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

  isSubmitting = false;

  ngOnInit() {
    this.expenseId = this.route.snapshot.paramMap.get('expenseId')
      ? +this.route.snapshot.paramMap.get('expenseId')!
      : null;
    this.isEditMode = !!this.expenseId;

    const groupId = findGroupIdInRoute(this.route);
    if (!groupId) return;
    this.groupId = groupId;

    this.groupService.getGroupDetail(this.groupId).subscribe({
      next: (group) => {
        this.group = group;

        let expenseFromState = history.state?.expense as ExpenseExtended | undefined;

        // if we are editing, look for the expense in the state or in the group's expenses
        if (!expenseFromState && this.isEditMode) {
          expenseFromState = group.expenses?.find((e) => e.id === this.expenseId);
        }

        if (!expenseFromState) {
          // new expense
          this.isEditMode = false;
          this.selectedPaidByOption = {
            id: 'you_paid_equal',
            label: this.translate.instant('paidByQuickDialog.youPaidEqual'),
          };
          this.selectedOptionIdForSplit = 'you_paid_equal';

          // set default payer as current user
          const currentUserId = this.authService.currentUser()?.id;
          if (currentUserId) {
            const member = this.group?.members.find((m) => m.userId === currentUserId);
            this.selectedPayer = member
              ? { userId: member.userId, name: member.name }
              : { userId: currentUserId, name: '' };
          }

          setTimeout(() => {
            if (this.splitSelectorComponent) {
              this.splitSelectorComponent.selectedOption.set(this.selectedPaidByOption);
              if (this.selectedPayer) {
                this.splitSelectorComponent.setPayer(this.selectedPayer.userId);
              }
            }
          }, 60);
        } else {
          // editing existing expense
          this.isEditMode = true;
          this.expenseToEdit.set(expenseFromState);
          this.expenseId = expenseFromState.id;

          // patch form
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

          // detect payer and quick option
          const currentUserId = this.authService.currentUser()?.id;
          let optionId = expenseFromState.optionId as PaidByOptionId | undefined;
          if (!optionId) {
            optionId = detectQuickOptionFromParticipants(expenseFromState, currentUserId);
          }

          // determine real payer
          let payerId: number | undefined;
          if (expenseFromState.paidBy && expenseFromState.paidBy.length > 0) {
            payerId = expenseFromState.paidBy[0].userId;
          } else if (expenseFromState.participants && expenseFromState.participants.length > 0) {
            const payer = expenseFromState.participants.find((p) => Number(p.amount) > 0);
            payerId = payer?.userId;
          }

          // search payer name
          let payerName = '';
          if (payerId) {
            const member = group.members.find((m) => m.userId === payerId);
            payerName = member?.name ?? '';
          }

          // build PaidByOption
          const newLabel = this.mapOptionIdToLabel(optionId!, payerName);
          this.selectedPaidByOption = { id: optionId!, label: newLabel };
          this.selectedOptionIdForSplit = optionId!;

          // set selected payer
          if (payerId) {
            const member = group.members.find((m) => m.userId === payerId);
            this.selectedPayer = member ? { userId: member.userId, name: member.name } : null;
          }

          // synchronize SplitSelectorComponent after rendering
          setTimeout(() => {
            if (this.splitSelectorComponent) {
              // clear payer before setting it to avoid setter overwriting
              this.splitSelectorComponent.selectedPayer.set(null);
              if (this.selectedPayer) {
                this.splitSelectorComponent.setPayer(this.selectedPayer.userId);
              }
              this.splitSelectorComponent.selectedOption.set(this.selectedPaidByOption);
              // force change detection to update view
              this.cdr.detectChanges();
            }
          }, 60);
        }

        // update category automatically based on description
        this.expenseForm.get('description')?.valueChanges.subscribe((desc: string) => {
          const lowerDesc = desc?.toLowerCase() || '';
          const matchedCategory = EXPENSE_CATEGORIES.find(
            (c) =>
              c.label.toLowerCase() === lowerDesc ||
              c.key.toLowerCase() === lowerDesc ||
              c.keywords?.some((k) => lowerDesc.includes(k)),
          );

          if (matchedCategory) {
            this.selectedCategory.set(matchedCategory.key);
            this.selectedCategoryLabel.set(matchedCategory.label);
            this.selectedCategoryIcon.set(matchedCategory.icon);
          } else {
            this.selectedCategory.set(null);
            this.selectedCategoryLabel.set(null);
            this.selectedCategoryIcon.set('/assets/category-default.svg');
          }

          this.expenseForm.patchValue(
            { category: matchedCategory?.key || null },
            { emitEvent: false },
          );
        });
      },
      error: () => {
        this.snackbar.show(this.translate.instant('expenseForm.loadGroupError'));
      },
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (this.isEditMode && this.expenseToEdit() && this.splitSelectorComponent) {
        const expense = this.expenseToEdit();
        let payerId: number | undefined;
        if (expense?.paidBy && expense.paidBy.length > 0) {
          payerId = expense.paidBy[0].userId;
        } else if (expense?.participants && expense.participants.length > 0) {
          const payer = expense.participants.find((p) => Number(p.amount) > 0);
          payerId = payer?.userId;
        }
        if (payerId) {
          this.splitSelectorComponent.setPayer(payerId);
        }
        if (this.selectedPaidByOption) {
          this.splitSelectorComponent.selectedOption.set(this.selectedPaidByOption);
        }
      }
    }, 0);
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
    const selectedPayer = this.splitSelectorComponent?.selectedPayer()?.userId ?? currentUser.id;

    if (!selectedOption?.id) {
      console.error(this.translate.instant('expenseForm.noPayerSelected'));
      return;
    }

    let paidBy: ExpenseUser[] = [{ userId: currentUser.id, amount: total }];
    let splits: ExpenseUser[] = [];

    // special case: group of 2 people
    if (groupMembers.length === 2) {
      const otherMember = this.group.members.find((m) => m.userId !== currentUser.id);
      if (!otherMember) return;

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
    } else {
      // general case: 3 or more people (or group of 1 → only you)
      splits = groupMembers.map((userId) => ({
        userId,
        amount: Math.floor((total / groupMembers.length) * 100) / 100,
      }));

      const sumSplits = splits.reduce((acc, s) => acc + s.amount, 0);
      splits[splits.length - 1].amount += Math.round((total - sumSplits) * 100) / 100;

      paidBy = [{ userId: selectedPayer, amount: total }];
    }

    // normalize splits
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
    const dialogRef = this.dialogService.openFullScreen(CurrencySelectorComponent);
    dialogRef.componentInstance.selected.subscribe((currency: string) => {
      this.expenseForm.get('currency')?.setValue(currency);
      dialogRef.close();
    });
  }

  openCategorySelector(): void {
    const dialogRef = this.dialogService.openFullScreen(CategorySelectorComponent);
    dialogRef.afterClosed().subscribe((category) => {
      if (category) {
        this.selectedCategory.set(category.key);
        this.selectedCategoryLabel.set(category.label);
        this.selectedCategoryIcon.set(category.icon);
        this.expenseForm.patchValue({ category: category.key });
      }
    });
  }

  updateCategoryIcon(category: string): void {
    const icon =
      EXPENSE_CATEGORIES.find((c) => c.key === category)?.icon || '/assets/category-default.svg';
    this.selectedCategoryIcon.set(icon);
  }

  private buildSplits(userIds: number[], total: number): ExpenseUser[] {
    // split the total amount equally among all users, rounding the last user's amount
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
    // navigate back to the group view
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
      const dialogRef = this.dialogService.openFixed(PaidByQuickDialogComponent, '300px', {
        members: this.group.members,
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
    const dialogRef = this.dialogService.openFixed(PaidByDialogComponent, '300px', {
      members: this.group.members,
    });

    dialogRef.afterClosed().subscribe((selectedMember) => {
      if (!selectedMember) return;
      this.selectedPayer = selectedMember;
      this.splitSelectorComponent?.setPayer(selectedMember.userId);
    });
  }

  onPayerChanged(result: { userId: number; name: string } | PaidByOption) {
    if ('userId' in result) {
      this.selectedPayer = result;

      this.selectedPaidByOption = {
        id: 'other_paid_equal',
        label: this.mapOptionIdToLabel('other_paid_equal', result.name),
      };
      this.selectedOptionIdForSplit = 'other_paid_equal';

      this.splitSelectorComponent.selectedOption.set(this.selectedPaidByOption);
    } else {
      // case 2 members and quick option selected
      this.selectedPaidByOption = result;
      this.selectedOptionIdForSplit = result.id;
    }
  }
}
