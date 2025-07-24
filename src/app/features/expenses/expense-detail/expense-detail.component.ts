import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { Expense } from '@app/core/models/expenses.model';
import { SharedUiModule } from '@app/shared/shared-ui.module';
import { ConfirmDialogComponent } from '@app/shared/ui/theme-toggle/dialogs/confirm-dialog.component';

@Component({
  selector: 'app-expense-detail',
  standalone: true,
  imports: [CommonModule, MatIconModule, SharedUiModule, TranslateModule],
  templateUrl: './expense-detail.component.html',
  styleUrls: ['./expense-detail.component.scss'],
})
export class ExpenseDetailComponent {
  private dialogRef = inject(MatDialogRef<ExpenseDetailComponent>);
  private data = inject(MAT_DIALOG_DATA) as { expense: Expense };
  private dialog = inject(MatDialog);
  private router = inject(Router);
  private translate = inject(TranslateService);

  expense = signal(this.data.expense);

  onEdit() {
    const expense = this.expense();
    this.dialogRef.close();

    this.dialogRef.afterClosed().subscribe(() => {
      if (!expense?.groupId || !expense?.id) {
        console.error('[ExpenseDetail] Falta groupId o id en el expense:', expense);
        return;
      }

      void this.router.navigate(['/groups', expense.groupId, 'expenses', expense.id, 'edit'], {
        state: { expense },
      });
    });
  }

  onDelete() {
    const confirmDialog = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: this.translate.instant('confirmDelete.title'),
        message: this.translate.instant('confirmDelete.message'),
        confirmText: this.translate.instant('common.confirm'),
        cancelText: this.translate.instant('common.cancel'),
      },
    });

    confirmDialog.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.dialogRef.close({ action: 'delete', expense: this.data.expense });
      }
    });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
