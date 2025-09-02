import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { PaidByOption } from '@app/core/models/paid-by-option.model';
import { SharedUiModule } from '@shared/shared-ui.module';

@Component({
  standalone: true,
  selector: 'app-paid-by-quick-dialog',
  imports: [CommonModule, SharedUiModule, TranslateModule],
  templateUrl: './paid-by-quick-dialog.component.html',
  styleUrls: ['./paid-by-quick-dialog.component.scss'],
})
export class PaidByQuickDialogComponent {
  private dialogRef = inject(MatDialogRef<PaidByQuickDialogComponent>);
  private translate = inject(TranslateService);
  private data = inject(MAT_DIALOG_DATA) as {
    members: { userId: number; name: string }[];
    selectedOption?: PaidByOption | null;
  };

  _selectedOption = signal<PaidByOption | null>(null);
  options = signal<PaidByOption[]>([]);

  constructor() {
    const otherMember = this.data.members.find((m) => m.userId !== 0);

    // Define default quick options
    const defaultOptions: PaidByOption[] = [
      { id: 'you_paid_equal', label: this.translate.instant('paidByQuickDialog.youPaidEqual') },
      { id: 'you_are_owed', label: this.translate.instant('paidByQuickDialog.youAreOwed') },
      {
        id: 'other_paid_equal',
        label: this.translate.instant('paidByQuickDialog.otherPaidEqual', {
          name: otherMember?.name,
        }),
      },
      {
        id: 'other_is_owed',
        label: this.translate.instant('paidByQuickDialog.otherIsOwed', {
          name: otherMember?.name,
        }),
      },
    ];

    this.options.set(defaultOptions);

    // Set initial selection
    const selectedId = this.data.selectedOption?.id;
    const selected = defaultOptions.find((o) => o.id === selectedId);
    this._selectedOption.set(selected ?? defaultOptions[0]);
  }

  selectOption(option: PaidByOption): void {
    this._selectedOption.set(option);
    this.dialogRef.close(option);
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  // openMoreOptions(): void {
  //   this.dialogRef.close({
  //     selectedOption: this._selectedOption(),
  //     moreOptions: true,
  //   });
  // }
}
