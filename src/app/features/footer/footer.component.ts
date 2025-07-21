import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { MatDatepicker } from '@angular/material/datepicker';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { SharedUiModule } from '@shared/shared-ui.module';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [SharedUiModule, TranslateModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent {
  @Input() calendarOnly = false;
  @Input() date: Date = new Date();
  @Output() dateChange = new EventEmitter<Date>();
  @Output() calendarClick = new EventEmitter<void>();
  @ViewChild('picker') picker!: MatDatepicker<Date>;

  constructor(public router: Router) {}

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
    this.picker.open();
  }

  onDateSelected(date: Date | null) {
    if (date) {
      this.dateChange.emit(date);
    }
  }
}
