import { Component, effect, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { ApiStatusService } from '@app/core/services/api-status.service';
import { SnackbarService } from '@app/core/services/snackbar.service';
import { FooterComponent } from '@app/features/footer/footer.component';

@Component({
  standalone: true,
  selector: 'app-layout',
  imports: [RouterOutlet, FooterComponent],
  template: `
    <div class="layout-wrapper">
      <main class="main-content-bg">
        <router-outlet></router-outlet>
      </main>
      <app-footer></app-footer>
    </div>
  `,
  styleUrls: ['./app-layout.component.scss'],
})
export class AppLayoutComponent {
  private apiStatus = inject(ApiStatusService);
  private snackbar = inject(SnackbarService);
  private translate = inject(TranslateService);

  constructor() {
    effect(() => {
      if (!this.apiStatus.isReachable()) {
        this.snackbar.show(this.translate.instant('api.notReachable'));
      }
    });
  }
}
