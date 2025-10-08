import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { I18nService } from '@services/i18n.service';
import { MonthNamePipe } from '@shared/pipes/month-name.pipe';
import { SharedMaterialModule } from '@shared/shared-material.module';

@Component({
  selector: 'app-calendar-dialog',
  standalone: true,
  imports: [CommonModule, TranslateModule, SharedMaterialModule, MonthNamePipe],
  templateUrl: './calendar-dialog.component.html',
  styleUrls: ['./calendar-dialog.component.scss'],
})
export class CalendarDialogComponent {
  selectedDate = signal(new Date());
  selectedYear = signal(new Date().getFullYear());

  private readonly dialogRef = inject(MatDialogRef<CalendarDialogComponent>);
  private readonly i18n = inject(I18nService);
  private readonly translate = inject(TranslateService);

  private readonly today = new Date();
  readonly months = Array.from({ length: 12 }, (_, i) => i);
  mode: 'day' | 'month' = 'day';

  constructor() {
    effect(() => {
      this.i18n.langChange();
    });
  }

  get showDayCalendar(): boolean {
    return this.mode === 'day';
  }

  get showMonthPicker(): boolean {
    return this.mode === 'month';
  }

  close(): void {
    this.dialogRef.close();
  }

  onDateSelected(date: Date | null): void {
    if (date) this.dialogRef.close(date);
  }

  onMonthSelected(monthIndex: number): void {
    const year = this.selectedYear();
    const selected = new Date(year, monthIndex, 1);
    this.selectedDate.set(selected);
    this.dialogRef.close(selected);
  }

  changeYear(delta: number): void {
    this.selectedYear.set(this.selectedYear() + delta);
  }

  isMonthEnabled(monthIndex: number): boolean {
    const year = this.selectedYear();
    if (year > this.today.getFullYear()) return false;
    if (year === this.today.getFullYear() && monthIndex > this.today.getMonth()) return false;
    return true;
  }

  getMonthLabel(monthIndex: number): string {
    return this.translate.instant(`month.${monthIndex}`);
  }
}
