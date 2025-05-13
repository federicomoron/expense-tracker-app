import { CommonModule } from '@angular/common';
import { Component, inject, Input, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SharedUiModule } from '@app/shared/shared-ui.module';
import { PaidByDialogComponent } from '../paid-by-dialog/paid-by-dialog.component';
import { SplitTypeDialogComponent } from '../split-type-dialog/split-type-dialog.component';

@Component({
  standalone: true,
  selector: 'app-split-selector',
  imports: [CommonModule, SharedUiModule],
  templateUrl: './split-selector.component.html',
  styleUrls: ['./split-selector.component.scss'],
})
export class SplitSelectorComponent {
  @Input() groupMembers: { userId: number; name: string }[] = [];

  selectedPayer = signal<{ userId: number; name: string } | null>(null);
  selectedSplitType = signal<string | null>(null);

  private dialog = inject(MatDialog);

  openPaidByDialog() {
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
}
