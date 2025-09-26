import { Component, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';

import { ApiErrorService } from '@services/api-error.service';
import { GroupService } from '@services/group.service';
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
  private readonly apiErrorService = inject(ApiErrorService);

  addMember(): void {
    if (!this.email() || this.isSubmitting()) return;

    this.isSubmitting.set(true);

    this.groupService.addMember(this.data.groupId, this.email()).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        if (res.success) {
          this.dialogRef.close({ added: true });
        } else {
          this.apiErrorService.handleError(res, true);
        }
      },
      error: (err) => {
        console.error('Error sending invitation', err);
        this.isSubmitting.set(false);
        this.apiErrorService.handleError(err);
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
