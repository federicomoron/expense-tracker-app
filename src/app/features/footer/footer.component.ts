import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';

import { SharedUiModule } from '@shared/shared-ui.module';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [SharedUiModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent {
  @Input() calendarOnly = false;
  @Output() calendarClick = new EventEmitter<void>();

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

  onCalendarClick() {
    this.calendarClick.emit();
  }
}
