import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { ApiStatusService } from '@services/api-status.service';
import { LayoutService } from '@services/layout.service';
import { SnackbarService } from '@services/snackbar.service';
import { FooterComponent } from '@shared/components/footer/footer.component';

@Component({
  standalone: true,
  selector: 'app-layout',
  imports: [RouterOutlet, FooterComponent],
  templateUrl: './app-layout.component.html',
  styleUrls: ['./app-layout.component.scss'],
})
export class AppLayoutComponent {
  private readonly apiStatus = inject(ApiStatusService);
  private readonly snackbar = inject(SnackbarService);
  private readonly translate = inject(TranslateService);

  public readonly layout = inject(LayoutService);

  public readonly shouldRemovePaddingTop = this.layout.removeTopPadding;

  constructor() {
    this.init();
  }

  private init(): void {
    if (!this.apiStatus.isReachable()) {
      this.snackbar.show(this.translate.instant('api.notReachable'));
    }
  }
}
