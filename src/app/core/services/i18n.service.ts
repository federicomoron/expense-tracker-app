import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class I18nService {
  private langChange = new Subject<string>();
  langChange$ = this.langChange.asObservable();

  constructor(private translate: TranslateService) {
    this.translate.addLangs(['en', 'es']);
    this.translate.setDefaultLang('en');

    const savedLang = localStorage.getItem('lang');
    if (savedLang) {
      this.setLanguage(savedLang);
    }
  }

  get currentLang(): string {
    return this.translate.currentLang || this.translate.getDefaultLang();
  }

  setLanguage(lang: string) {
    this.translate.use(lang);
    localStorage.setItem('lang', lang);
    this.langChange.next(lang);
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
}
