import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { PaidByOption } from '@core/models/paid-by-option.model';
import { AuthService } from '@services/auth.service';
import { SharedMaterialModule } from '@shared/shared-material.module';

@Component({
  standalone: true,
  selector: 'app-paid-by-quick-dialog',
  imports: [CommonModule, SharedMaterialModule, TranslateModule],
  templateUrl: './paid-by-quick-dialog.component.html',
  styleUrls: ['./paid-by-quick-dialog.component.scss'],
})
export class PaidByQuickDialogComponent {
  _selectedOption = signal<PaidByOption | null>(null);
  options = signal<PaidByOption[]>([]);

  private readonly dialogRef = inject(MatDialogRef<PaidByQuickDialogComponent>);
  private readonly translate = inject(TranslateService);
  private readonly authService = inject(AuthService);
  private readonly data = inject(MAT_DIALOG_DATA) as {
    members: { userId: number; name: string }[];
    selectedOption?: PaidByOption | null;
  };

  constructor() {
    this.initializeOptions();
  }

  selectOption(option: PaidByOption): void {
    this._selectedOption.set(option);
    this.dialogRef.close(option);
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  private initializeOptions(): void {
    const currentUserId = this.authService.currentUser()?.id;
    const otherMember = this.data.members.find((m) => m.userId !== currentUserId);

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
        label: this.translate.instant('paidByQuickDialog.otherIsOwed', { name: otherMember?.name }),
      },
    ];

    this.options.set(defaultOptions);

    const selectedId = this.data.selectedOption?.id;
    const selected = defaultOptions.find((o) => o.id === selectedId);
    this._selectedOption.set(selected ?? defaultOptions[0]);
  }

  // openMoreOptions(): void {
  //   this.dialogRef.close({
  //     selectedOption: this._selectedOption(),
  //     moreOptions: true,
  //   });
  // }
}
