import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { PaidByOption, PaidByOptionId } from '@core/models/paid-by-option.model';
import { PaidByDialogComponent } from '@features/expenses/components/paid-by-dialog/paid-by-dialog.component';
import { PaidByQuickDialogComponent } from '@features/expenses/components/paid-by-quick-dialog/paid-by-quick-dialog.component';
import { SplitTypeDialogComponent } from '@features/expenses/components/split-type-dialog/split-type-dialog.component';
import { GroupMember } from '@models/group-detail.model';
import { AuthService } from '@services/auth.service';
import { DialogService } from '@services/dialog.service';
import { getDefaultPaidByLabel, getPaidByLabelFromId } from '@shared/helpers/expense.utils';
import { SharedMaterialModule } from '@shared/shared-material.module';

@Component({
  standalone: true,
  selector: 'app-split-selector',
  imports: [CommonModule, SharedMaterialModule, TranslateModule],
  templateUrl: './split-selector.component.html',
  styleUrls: ['./split-selector.component.scss'],
})
export class SplitSelectorComponent {
  private readonly authService = inject(AuthService);
  private readonly dialogService = inject(DialogService);
  private readonly translate = inject(TranslateService);

  private _groupMembers: GroupMember[] = [];

  @Output() payerChanged = new EventEmitter<{ userId: number; name: string } | PaidByOption>();

  @Input()
  set groupMembers(members: readonly GroupMember[]) {
    this._groupMembers = [...members];

    // Update selected option label if it depends on other member
    const option = this.selectedOption();
    if (option && (option.id === 'other_paid_equal' || option.id === 'other_is_owed')) {
      this.selectedOption.set({
        id: option.id,
        label: this.getPaidByLabelFromId(option.id),
      });
    }
  }

  get groupMembers(): GroupMember[] {
    return this._groupMembers;
  }

  options = signal<PaidByOption[]>([
    {
      id: 'you_paid_equal' as PaidByOptionId,
      label: this.translate.instant('paidByQuickDialog.youPaidEqual'),
    },
    {
      id: 'you_are_owed' as PaidByOptionId,
      label: this.translate.instant('paidByQuickDialog.youAreOwed'),
    },
    {
      id: 'other_paid_equal' as PaidByOptionId,
      label: this.translate.instant('paidByQuickDialog.otherPaidEqual'),
    },
    {
      id: 'other_is_owed' as PaidByOptionId,
      label: this.translate.instant('paidByQuickDialog.otherIsOwed'),
    },
    { id: 'default' as PaidByOptionId, label: this.translate.instant('expenseForm.defaultLabel') },
  ]);

  selectedPayer = signal<{ userId: number; name: string } | null>(null);
  selectedSplitType = signal<string | null>(null);
  selectedOption = signal<PaidByOption | null>(null);

  @Input()
  set selectedOptionId(optionId: PaidByOptionId | null | undefined) {
    if (!optionId) {
      this.selectedOption.set(null);
      return;
    }

    // Set option with dynamic label
    this.selectedOption.set({
      id: optionId,
      label: this.getPaidByLabelFromId(optionId),
    });
  }

  /** Open the PaidBy dialog depending on number of group members */
  openPaidByDialog() {
    if (!this.groupMembers.length) return;

    const dialogRef =
      this.groupMembers.length === 2
        ? this.dialogService.openFullScreen(PaidByQuickDialogComponent, {
            members: this.groupMembers,
            selectedOption: this.selectedOption(),
          })
        : this.dialogService.openFullScreen(PaidByDialogComponent, { members: this.groupMembers });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;

      if ('id' in result) {
        this.selectedOption.set(result);
        this.payerChanged.emit(result);
      } else {
        this.selectedPayer.set(result);
        this.payerChanged.emit(result);
      }
    });
  }

  openSplitTypeDialog() {
    const dialogRef = this.dialogService.openFullScreen(SplitTypeDialogComponent);
    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.selectedSplitType.set(result);
    });
  }

  /** Set payer by userId (fallbacks if not found) */
  setPayer(userId: number) {
    const member = this.groupMembers.find((m) => m.userId === userId);
    this.selectedPayer.set(member ?? { userId, name: '' });
  }

  getSelectedPayerSignal() {
    return this.selectedPayer;
  }

  /** Returns the label for the currently selected PaidBy option */
  getPaidByLabel(): string {
    return getDefaultPaidByLabel(
      this.groupMembers,
      this.selectedOption(),
      this.selectedPayer(),
      this.authService.currentUser()?.id,
      this.translate,
    );
  }

  /** Returns the label for the currently selected split type */
  getSplitTypeLabel(): string {
    return this.selectedSplitType() || this.translate.instant('splitType.equalParts');
  }

  /** Map optionId to dynamic label */
  private getPaidByLabelFromId(optionId: PaidByOptionId, payerName?: string): string {
    return getPaidByLabelFromId(
      optionId,
      this.groupMembers,
      this.authService.currentUser()?.id,
      this.translate,
      payerName,
    );
  }
}
