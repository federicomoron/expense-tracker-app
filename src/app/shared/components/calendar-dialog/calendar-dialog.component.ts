import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCalendar } from '@angular/material/datepicker';
import { MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';

import { SharedUiModule } from '@app/shared/shared-ui.module';

@Component({
  selector: 'app-calendar-dialog',
  standalone: true,
  imports: [CommonModule, MatCalendar, MatButtonModule, TranslateModule, SharedUiModule],
  templateUrl: './calendar-dialog.component.html',
  styleUrls: ['./calendar-dialog.component.scss'],
})
export class CalendarDialogComponent {
  selectedDate: Date = new Date();

  constructor(private dialogRef: MatDialogRef<CalendarDialogComponent>) {}

  close() {
    this.dialogRef.close();
  }

  confirm() {
    this.dialogRef.close(this.selectedDate);
  }

  isDateValid = (d: Date | null): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return d !== null && d <= today;
  };
}
