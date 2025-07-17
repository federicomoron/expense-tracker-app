import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';

import { PwaInstallService } from '@app/core/services/pwa-install.service';
import { PwaInstallButtonComponent } from '@app/shared/components/pwa-install-button.component';
import { ThemeToggleComponent } from '@app/shared/ui/theme-toggle/theme-toggle.component';
import { AuthService } from '@services/auth.service';
import { SharedUiModule } from '@shared/shared-ui.module';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, SharedUiModule, ThemeToggleComponent, PwaInstallButtonComponent],
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
})
export class AccountComponent {
  auth = inject(AuthService);
  pwa = inject(PwaInstallService);

  logout() {
    this.auth.logout();
  }

  installPWA(): void {
    this.pwa.install();
  }
}
