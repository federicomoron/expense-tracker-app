import { Component, effect } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { ApiStatusService } from '@app/core/services/api-status.service';
import { SnackbarService } from '@app/core/services/snackbar.service';
import { FooterComponent } from '@app/features/footer/footer.component';

@Component({
  standalone: true,
  selector: 'app-layout',
  imports: [RouterOutlet, FooterComponent],
  template: `
    <main class="main-content-bg">
      <router-outlet></router-outlet>
    </main>
    <app-footer></app-footer>
  `,
  styleUrls: ['./app-layout.component.scss'],
})
export class AppLayoutComponent {
  constructor(
    private apiStatus: ApiStatusService,
    private snackbar: SnackbarService,
  ) {
    effect(() => {
      if (!this.apiStatus.isReachable()) {
        this.snackbar.show('🚨 The API is not reachable. Some actions may fail.');
      }
    });
  }
}
