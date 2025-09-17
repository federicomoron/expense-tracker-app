import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { PaidByOption, PaidByOptionId } from '@app/core/models/paid-by-option.model';
import { PaidByDialogComponent } from '@features/expenses/components/paid-by-dialog/paid-by-dialog.component';
import { SplitTypeDialogComponent } from '@features/expenses/components/split-type-dialog/split-type-dialog.component';
import { AuthService } from '@services/auth.service';
import { SharedUiModule } from '@shared/shared-ui.module';

import { PaidByQuickDialogComponent } from '../paid-by-quick-dialog/paid-by-quick-dialog.component';

@Component({
  standalone: true,
  selector: 'app-split-selector',
  imports: [CommonModule, SharedUiModule, TranslateModule],
  templateUrl: './split-selector.component.html',
  styleUrls: ['./split-selector.component.scss'],
})
export class SplitSelectorComponent {
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);
  private translate = inject(TranslateService);

  private _groupMembers: { userId: number; name: string }[] = [];

  @Output() payerChanged = new EventEmitter<{ userId: number; name: string } | PaidByOption>();

  @Input()
  set groupMembers(members: { userId: number; name: string }[]) {
    this._groupMembers = members;

    // Update selected option if it depends on "otherMember"
    const currentOption = this.selectedOption();
    if (
      currentOption &&
      (currentOption.id === 'other_paid_equal' || currentOption.id === 'other_is_owed')
    ) {
      this.selectedOption.set({
        id: currentOption.id,
        label: this.getPaidByLabelFromId(currentOption.id),
      });
    }
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

  @Input()
  set selectedOptionId(optionId: PaidByOptionId | null | undefined) {
    if (!optionId) {
      this.selectedOption.set(null);
      return;
    }

    // Always recalc label dynamically based on members
    const label = this.getPaidByLabelFromId(optionId);
    this.selectedOption.set({ id: optionId, label });
  }

  get groupMembers(): { userId: number; name: string }[] {
    return this._groupMembers;
  }

  selectedPayer = signal<{ userId: number; name: string } | null>(null);
  selectedSplitType = signal<string | null>(null);
  selectedOption = signal<PaidByOption | null>(null);

  openPaidByDialog() {
    if (!this.groupMembers || this.groupMembers.length === 0) return;

    const dialogRef =
      this.groupMembers.length === 2
        ? this.dialog.open(PaidByQuickDialogComponent, {
            width: '100vw',
            height: '100vh',
            maxWidth: '100vw',
            panelClass: 'full-screen-modal',
            data: {
              members: this.groupMembers,
              selectedOption: this.selectedOption(),
            },
          })
        : this.dialog.open(PaidByDialogComponent, {
            width: '100vw',
            height: '100vh',
            maxWidth: '100vw',
            panelClass: 'full-screen-modal',
            data: { members: this.groupMembers },
          });

    const popStateListener = () => dialogRef.close();
    window.addEventListener('popstate', popStateListener);

    dialogRef.afterClosed().subscribe((result) => {
      window.removeEventListener('popstate', popStateListener);

      if (result?.id) {
        this.selectedOption.set(result);
        this.payerChanged.emit(result);
      } else if (result) {
        this.selectedPayer.set(result);
        this.payerChanged.emit(result);
      }
    });
  }

  openSplitTypeDialog() {
    const dialogRef = this.dialog.open(SplitTypeDialogComponent, {
      width: '100vw',
      height: '100vh',
      maxWidth: '100vw',
      panelClass: 'full-screen-modal',
    });

    const popStateListener = () => dialogRef.close();
    window.addEventListener('popstate', popStateListener);

    dialogRef.afterClosed().subscribe((result) => {
      window.removeEventListener('popstate', popStateListener);
      if (result) this.selectedSplitType.set(result);
    });
  }

  setPayer(userId: number) {
    // search member by userId, but if not found, still set userId with empty name
    const member = this.groupMembers.find((m) => m.userId === userId);
    if (member) {
      this.selectedPayer.set(member);
    } else {
      // fallback: set userId even if not in the list
      this.selectedPayer.set({ userId, name: '' });
    }
  }

  getSelectedPayerSignal() {
    return this.selectedPayer;
  }

  getPaidByLabel(): string {
    // special case: group of 2 people
    if (this.groupMembers.length === 2) {
      const option = this.selectedOption();
      return option?.label || this.translate.instant('expenseForm.defaultLabel');
    }

    // special case: group of 1 person
    if (this.groupMembers.length === 1) {
      return this.translate.instant('splitSelector.you');
    }

    // special case: 3 or more members
    const payer = this.selectedPayer();
    const currentUserId = this.authService.currentUser()?.id;
    if (payer) {
      return payer.userId === currentUserId
        ? this.translate.instant('splitSelector.you')
        : payer.name;
    }
    return '';
  }

  getSplitTypeLabel(): string {
    // Always show "Equal parts" as default/fallback
    return this.selectedSplitType() || this.translate.instant('splitType.equalParts');
  }

  private getPaidByLabelFromId(optionId: PaidByOptionId, payerName?: string): string {
    const currentUserId = this.authService.currentUser()?.id;
    const otherMember = this.groupMembers.find((m) => m.userId !== currentUserId);

    switch (optionId) {
      case 'you_paid_equal':
        return this.translate.instant('paidByQuickDialog.youPaidEqual');
      case 'you_are_owed':
        return this.translate.instant('paidByQuickDialog.youAreOwed');
      case 'other_paid_equal':
        return this.translate.instant('paidByQuickDialog.otherPaidEqual', {
          name: payerName ?? otherMember?.name ?? '',
        });
      case 'other_is_owed':
        return this.translate.instant('paidByQuickDialog.otherIsOwed', {
          name: payerName ?? otherMember?.name ?? '',
        });
      default:
        return this.translate.instant('expenseForm.defaultLabel');
    }
  }
}
