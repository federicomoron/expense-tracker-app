import { isDevMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideServiceWorker } from '@angular/service-worker';

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
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:3000',
    }),
  ],
});
