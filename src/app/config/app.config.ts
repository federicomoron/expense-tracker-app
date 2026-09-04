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
import { MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { apiErrorInterceptor } from '@core/interceptors/api-error.interceptor';
import { authTokenInterceptor } from '@core/interceptors/auth-token.interceptor';
import { routes } from '@routes/app.routes';
import { ApiStatusService } from '@services/api-status.service';
import { AuthService } from '@services/auth.service';
import { connectivityInitializer } from '@services/connectivity-init';
import { i18nInitializer } from '@services/i18n-init';
import { I18nService } from '@services/i18n.service';
import { PendingExpensesService } from '@services/pending-expenses.service';
import { PendingPaymentsService } from '@services/pending-payments.service';

export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http, '/assets/i18n/', '.json');
}

export function initAuthFactory(authService: AuthService): () => Promise<void> {
  return () => {
    authService.restoreSession();
    return Promise.resolve();
  };
}

registerLocaleData(localeEs);

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authTokenInterceptor, apiErrorInterceptor])),
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
      useFactory: i18nInitializer,
      deps: [I18nService],
      multi: true,
    },
    {
      provide: APP_INITIALIZER,
      useFactory: initAuthFactory,
      deps: [AuthService],
      multi: true,
    },
    {
      provide: APP_INITIALIZER,
      useFactory: connectivityInitializer,
      deps: [ApiStatusService, PendingExpensesService, PendingPaymentsService],
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
    {
      provide: MAT_DIALOG_DEFAULT_OPTIONS,
      useValue: { autoFocus: false },
    },
  ],
};
