import { CommonModule } from '@angular/common';
import { Component, effect, inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';

import { I18nService } from '@services/i18n.service';
import { SharedMaterialModule } from '@shared/shared-material.module';

@Component({
  selector: 'app-calendar-dialog',
  standalone: true,
  imports: [CommonModule, TranslateModule, SharedMaterialModule],
  templateUrl: './calendar-dialog.component.html',
  styleUrls: ['./calendar-dialog.component.scss'],
})
export class CalendarDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<CalendarDialogComponent>);
  private readonly i18n = inject(I18nService);

  public selectedDate: Date = new Date();
  public showCalendar = true;

  constructor() {
    effect(() => {
      this.i18n.langChange();
      this.showCalendar = false;
      setTimeout(() => (this.showCalendar = true), 0);
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  confirm(): void {
    this.dialogRef.close(this.selectedDate);
  }

  isDateValid(d: Date | null): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return d !== null && d <= today;
  }
}
