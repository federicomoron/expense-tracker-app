import { HttpClient } from '@angular/common/http';
import { inject, isDevMode } from '@angular/core';
import {
  provideTransloco,
  Translation,
  translocoConfig,
  TranslocoLoader,
} from '@jsverse/transloco';

class CustomHttpLoader implements TranslocoLoader {
  private http = inject(HttpClient);

  getTranslation(lang: string) {
    return this.http.get<Translation>(`/assets/i18n/${lang}.json`);
  }
}

export function provideTranslocoConfig() {
  return provideTransloco({
    config: translocoConfig({
      availableLangs: ['es', 'en'],
      defaultLang: 'es',
      fallbackLang: 'es',
      reRenderOnLangChange: true,
      prodMode: !isDevMode(),
    }),
    loader: CustomHttpLoader,
  });
}
