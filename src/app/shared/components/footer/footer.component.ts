import { DatePipe } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { DialogService } from '@services/dialog.service';
import { CalendarDialogComponent } from '@shared/components/calendar-dialog/calendar-dialog.component';
import { SharedMaterialModule } from '@shared/shared-material.module';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [SharedMaterialModule, TranslateModule, DatePipe],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent {
  private router = inject(Router);
  private dialogService = inject(DialogService);

  @Input() calendarOnly = false;
  @Input() date: Date = new Date();
  @Output() dateChange = new EventEmitter<Date>();

  get isExpenseForm(): boolean {
    return this.router.url.includes('/expenses/new');
  }

  goTo(path: string): void {
    void this.router.navigateByUrl(path);
  }

  isActive(path: string): boolean {
    return this.router.isActive(path, {
      paths: 'exact',
      queryParams: 'ignored',
      fragment: 'ignored',
      matrixParams: 'ignored',
    });
  }

  openCalendar(): void {
    const dialogRef = this.dialogService.openFullScreen(CalendarDialogComponent);
    dialogRef.afterClosed().subscribe((date: Date | undefined) => {
      if (date) this.dateChange.emit(date);
    });
  }
}
