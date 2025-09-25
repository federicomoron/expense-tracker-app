import { Component, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { GroupService } from '@services/group.service';
import { SnackbarService } from '@services/snackbar.service';
import { SharedMaterialModule } from '@shared/shared-material.module';

@Component({
  selector: 'app-add-member-dialog',
  standalone: true,
  imports: [SharedMaterialModule, TranslateModule],
  templateUrl: './add-member-dialog.component.html',
  styleUrls: ['./add-member-dialog.component.scss'],
})
export class AddMemberDialogComponent {
  readonly isSubmitting = signal(false);
  readonly email = signal('');

  public readonly dialogRef = inject(MatDialogRef<AddMemberDialogComponent>);
  public readonly data = inject(MAT_DIALOG_DATA) as { groupId: number };

  private readonly groupService = inject(GroupService);
  private readonly snackbar = inject(SnackbarService);
  private readonly translate = inject(TranslateService);

  addMember(): void {
    if (!this.email() || this.isSubmitting()) return;

    this.isSubmitting.set(true);

    this.groupService.addMember(this.data.groupId, this.email()).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        if (res.success) {
          this.dialogRef.close({ added: true });
        } else {
          this.snackbar.show(
            res.message ?? this.translate.instant('groupActions.errorSendingInvitation'),
          );
        }
      },
      error: (err) => {
        console.error('Error sending invitation', err);
        this.isSubmitting.set(false);

        const backendMessage = err?.error?.error?.message;
        let message: string;

        switch (backendMessage) {
          case 'No user found with the provided email':
            message = this.translate.instant('groupActions.userNotFound');
            break;
          case 'User is already a member of the group':
            message = this.translate.instant('groupActions.alreadyMember');
            break;
          default:
            message =
              backendMessage ?? this.translate.instant('groupActions.errorSendingInvitation');
            break;
        }

        this.snackbar.show(message);
      },
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  updateEmail(event: Event) {
    const target = event.target as HTMLInputElement;
    this.email.set(target.value);
  }
}
