import { Component, inject, OnInit, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { DialogService } from '@services/dialog.service';
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
  public readonly members = signal<{ name: string; email: string; invitedUserId?: number }[]>([]);
  public readonly isLoading = signal(true);

  public readonly dialogRef = inject(MatDialogRef<GroupActionsModalComponent>);
  public readonly data = inject(MAT_DIALOG_DATA) as { groupId: number; groupName: string };

  private readonly groupService = inject(GroupService);
  private readonly snackbar = inject(SnackbarService);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);
  private readonly dialogService = inject(DialogService);

  ngOnInit(): void {
    this.loadGroupMembers();
  }

  openAddMemberDialog(): void {
    const dialogRef = this.dialogService.openFullScreen(AddMemberDialogComponent, {
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
          console.error('Error deleting group', err);
          this.snackbar.show(this.translate.instant('groupActions.errorDeleting'));
        },
      });
    });
  }

  private loadGroupMembers(): void {
    this.isLoading.set(true);

    this.groupService.getGroupDetail(this.data.groupId).subscribe({
      next: (detail) => {
        const confirmed = detail.members.map((member) => ({
          name: member.name,
          email: '',
          invitedUserId: member.userId,
        }));

        this.members.set([...confirmed]);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading confirmed members', err);
        this.members.set([]);
        this.isLoading.set(false);
      },
    });
  }

  trackByMember(index: number, member: any) {
    return member.invitedUserId ?? member.email;
  }

  // ---------- Placeholder for "Leave Group" ----------
  /*
  leaveGroup(): void {
    const confirmDialog = this.dialogService.openFixed(ConfirmDialogComponent, '400px', {
      title: this.translate.instant('groupActions.leaveGroup'),
      message: this.translate.instant('groupActions.leaveGroupMessage'),
      confirmText: this.translate.instant('common.confirm'),
      cancelText: this.translate.instant('common.cancel'),
    });

    confirmDialog.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;

      this.groupService.leaveGroup(this.data.groupId).subscribe({
        next: () => {
          this.snackbar.show(this.translate.instant('groupActions.leftGroup'));
          this.dialogRef.close();
          void this.router.navigate(['/groups']);
        },
        error: (err) => {
          console.error('Error leaving group', err);
          this.snackbar.show(this.translate.instant('groupActions.errorLeaving'));
        },
      });
    });
  }
  */
}
