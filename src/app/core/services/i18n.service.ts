import { Injectable, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class I18nService {
  readonly langChange = signal<string>(this.getSavedLang() || 'en');

  constructor(private translate: TranslateService) {
    this.init();
  }

  get currentLang(): string {
    return this.translate.currentLang || this.translate.getDefaultLang();
  }

  setLanguage(lang: string): Promise<unknown> {
    localStorage.setItem('lang', lang);
    this.langChange.set(lang);
    return firstValueFrom(this.translate.use(lang));
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

  ensureLoaded(): Promise<unknown> {
    return firstValueFrom(this.translate.use(this.getSavedLang() || 'en'));
  }

  private init(): void {
    this.translate.addLangs(['en', 'es']);
    this.translate.setDefaultLang('en');
  }

  private getSavedLang(): string | null {
    return localStorage.getItem('lang');
  }
}
