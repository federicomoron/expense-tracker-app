import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { GroupMember } from '@app/core/models/group-detail.model';
import { SharedUiModule } from '@app/shared/shared-ui.module';

@Component({
  standalone: true,
  selector: 'app-paid-by-dialog',
  imports: [CommonModule, SharedUiModule],
  templateUrl: './paid-by-dialog.component.html',
  styleUrls: ['./paid-by-dialog.component.scss'],
})
export class PaidByDialogComponent {
  private dialogRef = inject(MatDialogRef<PaidByDialogComponent>);
  private data = inject(MAT_DIALOG_DATA) as { members: GroupMember[] };

  members = signal(this.data.members);
  selected = signal<GroupMember | null>(null);

  choose(member: GroupMember): void {
    this.dialogRef.close(member);
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
