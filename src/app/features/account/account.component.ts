import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { I18nService } from '@app/core/services/i18n.service';
import { PwaInstallService } from '@app/core/services/pwa-install.service';
import { PwaInstallButtonComponent } from '@app/shared/components/pwa-install-button/pwa-install-button.component';
import { ThemeToggleComponent } from '@app/shared/ui/theme-toggle/theme-toggle/theme-toggle.component';
import { AuthService } from '@services/auth.service';
import { SharedUiModule } from '@shared/shared-ui.module';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [
    CommonModule,
    SharedUiModule,
    ThemeToggleComponent,
    PwaInstallButtonComponent,
    TranslateModule,
  ],
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
})
export class AccountComponent {
  auth = inject(AuthService);
  pwa = inject(PwaInstallService);
  i18n = inject(I18nService);

  logout() {
    this.auth.logout();
  }

  toggleLang() {
    const newLang = this.i18n.currentLang === 'en' ? 'es' : 'en';
    this.i18n.setLanguage(newLang);
    localStorage.setItem('app_lang', newLang);
  }

  get currentLang() {
    return this.i18n.currentLang;
  }

  installPWA(): void {
    this.pwa.install();
  }
}
