import { Component, effect } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { ApiStatusService } from '@app/core/services/api-status.service';
import { SnackbarService } from '@app/core/services/snackbar.service';
import { NavigationComponent } from '@app/features/navigation/navigation.component';

@Component({
  standalone: true,
  selector: 'app-layout',
  imports: [RouterOutlet, NavigationComponent],
  template: `
    <app-navigation>
      <router-outlet />
    </app-navigation>
  `,
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
