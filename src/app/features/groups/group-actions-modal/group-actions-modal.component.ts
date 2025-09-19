import { Component, inject, OnInit, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { DialogService } from '@app/core/services/dialog.service';
import { GroupService } from '@services/group.service';
import { SnackbarService } from '@services/snackbar.service';
import { SharedMaterialModule } from '@shared/shared-material.module';
import { AddMemberDialogComponent } from '@shared/ui/add-member-dialog/add-member-dialog.component';
import { ConfirmDialogComponent } from '@shared/ui/dialogs/confirm-dialog.component';

@Component({
  selector: 'app-group-actions-modal',
  standalone: true,
  imports: [SharedMaterialModule, TranslateModule],
  templateUrl: './group-actions-modal.component.html',
  styleUrls: ['./group-actions-modal.component.scss'],
})
export class GroupActionsModalComponent implements OnInit {
  public dialogRef = inject(MatDialogRef<GroupActionsModalComponent>);
  public data = inject(MAT_DIALOG_DATA) as { groupId: number; groupName: string };

  private groupService = inject(GroupService);
  private snackbar = inject(SnackbarService);
  private router = inject(Router);
  private translate = inject(TranslateService);
  private dialogService = inject(DialogService);

  members = signal<
    { name: string; email: string; status: 'confirmed' | 'pending'; invitedUserId?: number }[]
  >([]);

  ngOnInit() {
    this.loadGroupMembers();
  }

  loadGroupMembers() {
    // Bringing confirmed members
    this.groupService.getGroupDetail(this.data.groupId).subscribe({
      next: (detail) => {
        const confirmed = detail.members.map((member) => ({
          name: member.name,
          email: '',
          status: 'confirmed' as const,
          invitedUserId: member.userId,
        }));

        // Bringing pending invitations
        this.groupService.getGroupInvitations(this.data.groupId).subscribe({
          next: (invitations) => {
            const pending = invitations
              .filter((inv) => inv.status === 'pending')
              .map((inv) => ({
                name: inv.invited_by?.name ?? inv.invited_email,
                email: inv.invited_email,
                status: 'pending' as const,
                invitedUserId: inv.invitedUserId,
              }));

            // Combining confirmed and pending members
            this.members.set([...confirmed, ...pending]);
          },
          error: (err) => console.error('Error cargando invitaciones', err),
        });
      },
      error: (err) => console.error('Error cargando miembros confirmados', err),
    });
  }

  openAddMemberDialog() {
    const dialogRef = this.dialogService.openFixed(AddMemberDialogComponent, '400px', {
      groupId: this.data.groupId,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.added) this.loadGroupMembers();
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  confirmDeleteGroup(): void {
    const confirmDialog = this.dialogService.openFixed(ConfirmDialogComponent, '400px', {
      title: this.translate.instant('confirmDeleteGroup.title'),
      message: this.translate.instant('confirmDeleteGroup.message'),
      confirmText: this.translate.instant('common.confirm'),
      cancelText: this.translate.instant('common.cancel'),
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
