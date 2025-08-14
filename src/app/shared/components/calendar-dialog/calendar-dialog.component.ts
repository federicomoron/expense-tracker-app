import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCalendar } from '@angular/material/datepicker';
import { MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import { I18nService } from '@app/core/services/i18n.service';
import { SharedUiModule } from '@app/shared/shared-ui.module';

@Component({
  selector: 'app-calendar-dialog',
  standalone: true,
  imports: [CommonModule, MatCalendar, MatButtonModule, TranslateModule, SharedUiModule],
  templateUrl: './calendar-dialog.component.html',
  styleUrls: ['./calendar-dialog.component.scss'],
})
export class CalendarDialogComponent implements OnDestroy {
  selectedDate: Date = new Date();

  showCalendar = true;

  private langChangeSub: Subscription;

  constructor(
    private dialogRef: MatDialogRef<CalendarDialogComponent>,
    private i18n: I18nService,
  ) {
    this.langChangeSub = this.i18n.langChange$.subscribe(() => {
      this.showCalendar = false;
      setTimeout(() => (this.showCalendar = true), 0);
    });
  }

  ngOnDestroy() {
    this.langChangeSub.unsubscribe();
  }

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
