import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';

import { GroupMember } from '@models/group-detail.model';
import { SharedMaterialModule } from '@shared/shared-material.module';

@Component({
  standalone: true,
  selector: 'app-paid-by-dialog',
  imports: [CommonModule, SharedMaterialModule, TranslateModule],
  templateUrl: './paid-by-dialog.component.html',
  styleUrls: ['./paid-by-dialog.component.scss'],
})
export class PaidByDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<PaidByDialogComponent>);
  private readonly data = inject(MAT_DIALOG_DATA) as { members: GroupMember[] };

  members = signal(this.data.members);
  selected = signal<GroupMember | null>(null);

  choose(member: GroupMember): void {
    this.dialogRef.close(member);
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
