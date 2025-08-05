import { registerLocaleData } from '@angular/common';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import localeEs from '@angular/common/locales/es';
import {
  APP_INITIALIZER,
  ApplicationConfig,
  importProvidersFrom,
  isDevMode,
  LOCALE_ID,
  provideZoneChangeDetection,
} from '@angular/core';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { authTokenInterceptor } from '@core/interceptors/auth-token.interceptor';
import { unauthorizedInterceptor } from '@core/interceptors/unauthorized.interceptor';

import { routes } from './app.routes';
import { i18nInitializer } from './core/services/i18n-init';
import { I18nService } from './core/services/i18n.service';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, '/assets/i18n/', '.json');
}

registerLocaleData(localeEs);

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authTokenInterceptor, unauthorizedInterceptor])),
    importProvidersFrom(
      BrowserAnimationsModule,
      TranslateModule.forRoot({
        defaultLanguage: 'en',
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient],
        },
      }),
    ),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
    {
      provide: APP_INITIALIZER,
      useFactory: (i18nService: I18nService) => i18nInitializer(i18nService),
      deps: [I18nService],
      multi: true,
    },
    {
      provide: LOCALE_ID,
      useFactory: (i18nService: I18nService) => i18nService.getCurrentLocale(),
      deps: [I18nService],
    },
    {
      provide: MAT_DATE_LOCALE,
      useFactory: (i18nService: I18nService) => i18nService.getCurrentLocale(),
      deps: [I18nService],
    },
  ],
};
