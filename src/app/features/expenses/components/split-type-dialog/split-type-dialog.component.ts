import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

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
  private translate = inject(TranslateService);

  options = [this.translate.instant('splitType.equalParts')];

  choose(option: string): void {
    this.dialogRef.close(option);
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
