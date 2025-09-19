import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { ApiStatusService } from '@core/services/api-status.service';
import { LayoutService } from '@core/services/layout.service';
import { SnackbarService } from '@core/services/snackbar.service';
import { FooterComponent } from '@shared/components/footer/footer.component';

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
  layout = inject(LayoutService);

  readonly shouldRemovePaddingTop = this.layout.removeTopPadding;

  constructor() {
    if (!this.apiStatus.isReachable()) {
      this.snackbar.show(this.translate.instant('api.notReachable'));
    }
  }
}
