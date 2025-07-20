import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';

import { SharedUiModule } from '@shared/shared-ui.module';

@Component({
  standalone: true,
  selector: 'app-split-type-dialog',
  imports: [CommonModule, SharedUiModule, TranslateModule],
  templateUrl: './split-type-dialog.component.html',
  styleUrls: ['./split-type-dialog.component.scss'],
})
export class SplitTypeDialogComponent {
  private dialogRef = inject(MatDialogRef<SplitTypeDialogComponent>);
  options = signal(['Equally', 'Unequally']);
  selectedOption = signal<string | null>(null);

  choose(option: string): void {
    this.selectedOption.set(option);
    this.dialogRef.close(option);
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
