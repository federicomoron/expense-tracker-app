import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { GroupService } from '@services/group.service';
import { SnackbarService } from '@services/snackbar.service';
import { SharedMaterialModule } from '@shared/shared-material.module';

@Component({
  selector: 'app-add-member-dialog',
  standalone: true,
  imports: [SharedMaterialModule, FormsModule, TranslateModule],
  templateUrl: './add-member-dialog.component.html',
  styleUrls: ['./add-member-dialog.component.scss'],
})
export class AddMemberDialogComponent {
  public readonly dialogRef = inject(MatDialogRef<AddMemberDialogComponent>);
  public readonly data = inject(MAT_DIALOG_DATA) as { groupId: number };

  private readonly groupService = inject(GroupService);
  private readonly snackbar = inject(SnackbarService);
  private readonly translate = inject(TranslateService);

  email = '';

  addMember(): void {
    if (!this.email) return;

    this.groupService.addMember(this.data.groupId, this.email).subscribe({
      next: (res) => {
        if (res.success) {
          this.snackbar.show(this.translate.instant('groupActions.invitationSent'));
          this.dialogRef.close({ added: true });
        } else {
          this.snackbar.show(
            res.message ?? this.translate.instant('groupActions.errorSendingInvitation'),
          );
        }
      },
      error: (err: any) => {
        console.error('Error sending invitation', err);
        const message =
          err?.error?.error?.message ??
          this.translate.instant('groupActions.errorSendingInvitation');
        this.snackbar.show(message);
      },
    });
  }

  close(): void {
    this.dialogRef.close();
  }
}
