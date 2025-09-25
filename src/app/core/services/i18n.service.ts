import { Injectable, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class I18nService {
  readonly langChange = signal<string>(this.getSavedLang() || 'en');

  constructor(private translate: TranslateService) {
    this.init();
  }

  get currentLang(): string {
    return this.translate.currentLang || this.translate.getDefaultLang();
  }

  setLanguage(lang: string) {
    this.translate.use(lang);
    localStorage.setItem('lang', lang);
    this.langChange.set(lang);
  }

  getCurrentLocale(): string {
    switch (this.currentLang) {
      case 'es':
        return 'es-ES';
      case 'en':
      default:
        return 'en-US';
    }
  }

  private init(): void {
    this.translate.addLangs(['en', 'es']);
    this.translate.setDefaultLang('en');

    const savedLang = this.getSavedLang();
    if (savedLang) {
      this.setLanguage(savedLang);
    }
  }

  private getSavedLang(): string | null {
    return localStorage.getItem('lang');
  }
}
