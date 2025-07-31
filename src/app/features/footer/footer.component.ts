import { DatePipe } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { CalendarDialogComponent } from '@app/shared/components/calendar-dialog/calendar-dialog.component';
import { SharedUiModule } from '@shared/shared-ui.module';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [SharedUiModule, TranslateModule, DatePipe],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent {
  @Input() calendarOnly = false;
  @Input() date: Date = new Date();
  @Output() dateChange = new EventEmitter<Date>();

  private dialog = inject(MatDialog);
  private router = inject(Router);

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

  openCalendar() {
    const dialogRef = this.dialog.open(CalendarDialogComponent, {
      width: '100vw',
      height: '100vh',
      maxWidth: '100vw',
      panelClass: 'full-screen-modal',
    });

    dialogRef.afterClosed().subscribe((date: Date | undefined) => {
      if (date) {
        this.dateChange.emit(date);
      }
    });
  }
}
