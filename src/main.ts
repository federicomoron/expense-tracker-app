import { isDevMode } from '@angular/core';
import { provideNativeDateAdapter } from '@angular/material/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideServiceWorker } from '@angular/service-worker';
import { TranslateService } from '@ngx-translate/core';

import { provideTranslocoConfig } from '@app/core/config/transloco.config';

import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;

const themeToApply =
  savedTheme === 'dark' || (savedTheme === 'system' && prefersDark) || (!savedTheme && prefersDark)
    ? 'dark'
    : 'light';

if (themeToApply === 'dark') {
  document.documentElement.classList.add('dark-theme');
}

void bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    ...appConfig.providers,
    provideNativeDateAdapter(),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:3000',
    }),
    provideTranslocoConfig(),
  ],
}).then((appRef) => {
  const translate = appRef.injector.get(TranslateService);
  const savedLang = localStorage.getItem('lang') || 'en';
  translate.setDefaultLang('en');
  translate.use(savedLang);

  const splash = document.getElementById('splash-screen');
  if (splash) splash.style.display = 'none';
});
