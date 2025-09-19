import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { I18nService } from '@app/core/services/i18n.service';
import { PwaInstallService } from '@app/core/services/pwa-install.service';
import { AuthService } from '@services/auth.service';
import { PwaInstallButtonComponent } from '@shared/components/pwa-install-button/pwa-install-button.component';
import { SharedMaterialModule } from '@shared/shared-material.module';
import { ThemeToggleComponent } from '@shared/ui/theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [
    CommonModule,
    SharedMaterialModule,
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
