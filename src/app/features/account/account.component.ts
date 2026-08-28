import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { AuthService } from '@services/auth.service';
import { I18nService } from '@services/i18n.service';
import { PwaInstallService } from '@services/pwa-install.service';
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
  readonly auth = inject(AuthService);
  private readonly pwa = inject(PwaInstallService);
  private readonly i18n = inject(I18nService);

  get currentLang(): string {
    return this.i18n.currentLang;
  }

  logout(): void {
    this.auth.logout();
  }

  toggleLang(): void {
    const newLang = this.i18n.currentLang === 'en' ? 'es' : 'en';
    void this.i18n.setLanguage(newLang);
    localStorage.setItem('app_lang', newLang);
  }

  installPWA(): void {
    this.pwa.install();
  }
}
