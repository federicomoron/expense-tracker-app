import { Component, Inject, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { SnackbarService } from '@core/services/snackbar.service';
import { GroupService } from '@services/group.service';
import { SharedMaterialModule } from '@shared/shared-material.module';

@Component({
  selector: 'app-add-member-dialog',
  standalone: true,
  imports: [SharedMaterialModule, FormsModule, TranslateModule],
  templateUrl: './add-member-dialog.component.html',
  styleUrls: ['./add-member-dialog.component.scss'],
})
export class AddMemberDialogComponent {
  email = '';
  private groupService = inject(GroupService);
  private dialogRef = inject(MatDialogRef<AddMemberDialogComponent>);
  private snackbar = inject(SnackbarService);
  private translate = inject(TranslateService);

  constructor(@Inject(MAT_DIALOG_DATA) public data: { groupId: number }) {}

  addMember() {
    if (!this.email) return;

    this.groupService.addMember(this.data.groupId, this.email).subscribe({
      next: (res) => {
        if (res.success) {
          this.snackbar.show(this.translate.instant('groupActions.invitationSent'));
          this.dialogRef.close({ added: true });
        } else {
          this.snackbar.show(
            res.message || this.translate.instant('groupActions.errorSendingInvitation'),
          );
        }
      },
      error: (err: any) => {
        console.error('Error enviando invitación', err);
        const message =
          err?.error?.error?.message ||
          this.translate.instant('groupActions.errorSendingInvitation');
        this.snackbar.show(message);
      },
    });
  }

  close() {
    this.dialogRef.close();
  }
}
