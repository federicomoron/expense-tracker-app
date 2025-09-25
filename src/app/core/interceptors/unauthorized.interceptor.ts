import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { NAVIGATION_ROUTES } from '@constants/routes';
import { STORAGE_KEYS } from '@constants/storage-keys';
import { environment } from '@environments/environment';

export const unauthorizedInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: any) => {
      if (error instanceof HttpErrorResponse) {
        if (!environment.production) {
          console.warn('HTTP error intercepted:', error.status);
        }

        if (error.status === 401) {
          localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
          void router.navigate([NAVIGATION_ROUTES.LOGIN]);
        }

        return throwError(() => error);
      }

      return throwError(() => error);
    }),
  );
};
