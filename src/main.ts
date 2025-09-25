import { isDevMode } from '@angular/core';
import { provideNativeDateAdapter } from '@angular/material/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideServiceWorker } from '@angular/service-worker';
import { TranslateService } from '@ngx-translate/core';

import { appConfig } from '@config/app.config';
import { applyTheme } from '@services/theme.service';

import { AppComponent } from './app/app.component';

applyTheme();

void bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    ...appConfig.providers,
    provideNativeDateAdapter(),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:3000',
    }),
  ],
}).then((appRef) => {
  const translate = appRef.injector.get(TranslateService);
  const savedLang = localStorage.getItem('lang') || 'en';
  translate.setDefaultLang('en');
  translate.use(savedLang);

  const splash = document.getElementById('splash-screen');
  if (splash) splash.style.display = 'none';
});
