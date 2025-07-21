import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';

import { PwaInstallService } from 'src/app/core/services/pwa-install.service';

@Component({
  standalone: true,
  selector: 'app-pwa-install-button',
  template: `
    @if (pwaService.canInstall()) {
      <button mat-flat-button color="primary" (click)="pwaService.install()">
        {{ 'account.install' | translate }}
      </button>
    }
  `,
  imports: [MatButtonModule, TranslateModule],
})
export class PwaInstallButtonComponent {
  readonly pwaService = inject(PwaInstallService);
}
