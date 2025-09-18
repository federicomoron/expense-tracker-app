import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { SharedUiModule } from '@app/shared/shared-ui.module';
import { GroupService } from '@services/group.service';
import { SnackbarService } from '@services/snackbar.service';
import { ConfirmDialogComponent } from '@shared/ui/theme-toggle/dialogs/confirm-dialog.component';

@Component({
  selector: 'app-group-actions-modal',
  standalone: true,
  imports: [SharedUiModule, TranslateModule],
  templateUrl: './group-actions-modal.component.html',
  styleUrls: ['./group-actions-modal.component.scss'],
})
export class GroupActionsModalComponent {
  public dialogRef = inject(MatDialogRef<GroupActionsModalComponent>);
  public data = inject(MAT_DIALOG_DATA) as { groupId: number; groupName: string };
  private groupService = inject(GroupService);
  private snackbar = inject(SnackbarService);
  private router = inject(Router);
  private translate = inject(TranslateService);
  private dialog = inject(MatDialog);

  close(): void {
    this.dialogRef.close();
  }

  confirmDeleteGroup(): void {
    const confirmDialog = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: this.translate.instant('confirmDeleteGroup.title'),
        message: this.translate.instant('confirmDeleteGroup.message'),
        confirmText: this.translate.instant('common.confirm'),
        cancelText: this.translate.instant('common.cancel'),
      },
    });

    confirmDialog.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;

      this.groupService.deleteGroup(this.data.groupId).subscribe({
        next: () => {
          this.snackbar.show(this.translate.instant('groupActions.groupDeleted'));
          this.dialogRef.close();
          void this.router.navigate(['/groups']);
        },
        error: (err) => {
          console.error('Error eliminando el grupo', err);
          this.snackbar.show(this.translate.instant('groupActions.errorDeleting'));
        },
      });
    });
  }
}
