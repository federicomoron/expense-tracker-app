import { Component, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { PwaInstallService } from '@services/pwa-install.service';
import { SharedMaterialModule } from '@shared/shared-material.module';

@Component({
  standalone: true,
  selector: 'app-pwa-install-button',
  templateUrl: './pwa-install-button.component.html',
  styleUrls: ['./pwa-install-button.component.scss'],
  imports: [SharedMaterialModule, TranslateModule],
})
export class PwaInstallButtonComponent {
  readonly pwaService = inject(PwaInstallService);
}
