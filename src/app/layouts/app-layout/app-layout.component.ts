import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { ApiStatusService } from '@app/core/services/api-status.service';
import { LayoutService } from '@app/core/services/layout.service';
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
  layout = inject(LayoutService);

  readonly shouldRemovePaddingTop = this.layout.removeTopPadding;

  constructor() {
    if (!this.apiStatus.isReachable()) {
      this.snackbar.show(this.translate.instant('api.notReachable'));
    }
  }
}
