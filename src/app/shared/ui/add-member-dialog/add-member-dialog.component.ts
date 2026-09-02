import { Component, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';

import { HeaderAction } from '@core/models/header-action.model';
import { ApiErrorService } from '@services/api-error.service';
import { GroupService } from '@services/group.service';
import { UiMessageService } from '@services/ui-message.service';
import { HeaderComponent } from '@shared/components/header/header.component';
import { SharedMaterialModule } from '@shared/shared-material.module';

type AddMemberMode = 'email' | 'guest';

@Component({
  selector: 'app-add-member-dialog',
  standalone: true,
  imports: [SharedMaterialModule, TranslateModule, HeaderComponent],
  templateUrl: './add-member-dialog.component.html',
  styleUrls: ['./add-member-dialog.component.scss'],
})
export class AddMemberDialogComponent {
  readonly isSubmitting = signal(false);
  readonly mode = signal<AddMemberMode>('email');
  readonly email = signal('');
  readonly name = signal('');
  readonly claimEmail = signal('');

  public readonly dialogRef = inject(MatDialogRef<AddMemberDialogComponent>);
  public readonly data = inject(MAT_DIALOG_DATA) as { groupId: number };

  private readonly groupService = inject(GroupService);
  private readonly apiErrorService = inject(ApiErrorService);
  private readonly uiMessage = inject(UiMessageService);

  get headerActions(): HeaderAction[] {
    return [
      {
        label: 'groupActions.add',
        icon: 'check',
        onClick: () => this.addMember(),
        showSpinner: this.isSubmitting(),
        spinnerColor: 'white',
      },
    ];
  }

  get isSubmitDisabled(): boolean {
    return this.mode() === 'email' ? !this.email() : !this.name();
  }

  setMode(mode: AddMemberMode): void {
    this.mode.set(mode);
  }

  addMember(): void {
    if (this.isSubmitDisabled || this.isSubmitting()) return;

    this.isSubmitting.set(true);

    const request$ =
      this.mode() === 'email'
        ? this.groupService.addMember(this.data.groupId, this.email())
        : this.groupService.addGuestMember(
            this.data.groupId,
            this.name(),
            this.claimEmail() || undefined,
          );

    request$.subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        if (res.success) {
          this.dialogRef.close({ added: true });
        } else {
          const message = this.apiErrorService.handleError(res);
          this.uiMessage.showError(message);
        }
      },
      error: (err) => {
        console.error('Error adding member', err);
        this.isSubmitting.set(false);
        const message = this.apiErrorService.handleError(err);
        this.uiMessage.showError(message);
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

  updateName(event: Event) {
    const target = event.target as HTMLInputElement;
    this.name.set(target.value);
  }

  updateClaimEmail(event: Event) {
    const target = event.target as HTMLInputElement;
    this.claimEmail.set(target.value);
  }
}
