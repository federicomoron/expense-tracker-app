import { Component, computed, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { ApiStatusService } from '@app/core/services/api-status.service';
import { SnackbarService } from '@app/core/services/snackbar.service';
import { FooterComponent } from '@app/features/footer/footer.component';

@Component({
  standalone: true,
  selector: 'app-layout',
  imports: [RouterOutlet, FooterComponent],
  templateUrl: './app-layout.component.html',
  styleUrls: ['./app-layout.component.scss'],
})
export class AppLayoutComponent {
  private apiStatus = inject(ApiStatusService);
  private snackbar = inject(SnackbarService);
  private translate = inject(TranslateService);
  private router = inject(Router);

  readonly shouldRemovePaddingTop = computed(() => {
    const url = this.router.url;
    const match = url.match(/^\/groups\/\d+$/);
    return !!match;
  });

  constructor() {
    if (!this.apiStatus.isReachable()) {
      this.snackbar.show(this.translate.instant('api.notReachable'));
    }
  }
}
