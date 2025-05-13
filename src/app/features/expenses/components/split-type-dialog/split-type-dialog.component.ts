import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { SharedUiModule } from '@app/shared/shared-ui.module';

@Component({
  standalone: true,
  selector: 'app-split-type-dialog',
  imports: [CommonModule, SharedUiModule],
  templateUrl: './split-type-dialog.component.html',
  styleUrls: ['./split-type-dialog.component.scss'],
})
export class SplitTypeDialogComponent {
  private dialogRef = inject(MatDialogRef<SplitTypeDialogComponent>);
  options = signal(['Equally', 'Unequally']);

  choose(option: string): void {
    this.dialogRef.close(option);
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
