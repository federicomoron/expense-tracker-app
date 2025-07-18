import { CommonModule } from '@angular/common';
import { Component, inject, Input, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { PaidByDialogComponent } from '@features/expenses/components/paid-by-dialog/paid-by-dialog.component';
import { SplitTypeDialogComponent } from '@features/expenses/components/split-type-dialog/split-type-dialog.component';
import { AuthService } from '@services/auth.service';
import { SharedUiModule } from '@shared/shared-ui.module';

@Component({
  standalone: true,
  selector: 'app-split-selector',
  imports: [CommonModule, SharedUiModule],
  templateUrl: './split-selector.component.html',
  styleUrls: ['./split-selector.component.scss'],
})
export class SplitSelectorComponent {
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);
  private _groupMembers: { userId: number; name: string }[] = [];

  @Input()
  set groupMembers(members: { userId: number; name: string }[]) {
    this._groupMembers = members;

    if (members.length && !this.selectedPayer()) {
      const currentUserId = this.authService.currentUser()?.id;
      if (currentUserId) {
        const member = members.find((m) => m.userId === currentUserId);
        if (member) {
          this.selectedPayer.set(member);
        } else {
          console.warn(`⚠️ Current userId ${currentUserId} not found in group members`);
        }
      }
    }
  }
  get groupMembers(): { userId: number; name: string }[] {
    return this._groupMembers;
  }

  selectedPayer = signal<{ userId: number; name: string } | null>(null);
  selectedSplitType = signal<string | null>(null);

  openPaidByDialog() {
    if (!this.groupMembers || this.groupMembers.length === 0) {
      console.warn('⚠️ No group members available');
      return;
    }

    const dialogRef = this.dialog.open(PaidByDialogComponent, {
      width: '100vw',
      height: '100vh',
      maxWidth: '100vw',
      panelClass: 'full-screen-modal',
      data: { members: this.groupMembers },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.selectedPayer.set(result);
      }
    });
  }

  openSplitTypeDialog() {
    const dialogRef = this.dialog.open(SplitTypeDialogComponent, {
      width: '100vw',
      height: '100vh',
      maxWidth: '100vw',
      panelClass: 'full-screen-modal',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.selectedSplitType.set(result);
      }
    });
  }

  setPayer(userId: number) {
    const member = this.groupMembers.find((m) => m.userId === userId);
    if (member) {
      this.selectedPayer.set(member);
    } else {
      console.warn(`⚠️ Member with userId ${userId} not found`);
    }
  }
}
