import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

import { PwaInstallService } from 'src/app/core/services/pwa-install.service';

@Component({
  standalone: true,
  selector: 'app-pwa-install-button',
  template: `
    @if (pwaService.canInstall()) {
      <button mat-flat-button color="primary" (click)="pwaService.install()">Install App</button>
    }
  `,
  imports: [MatButtonModule],
})
export class PwaInstallButtonComponent {
  readonly pwaService = inject(PwaInstallService);
}
