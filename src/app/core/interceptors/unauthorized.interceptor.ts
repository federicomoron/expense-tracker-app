import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';

import { NAVIGATION_ROUTES } from '@constants/routes';
import { STORAGE_KEYS } from '@constants/storage-keys';

export const unauthorizedInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    tap({
      error: (error) => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
          void router.navigate([NAVIGATION_ROUTES.LOGIN]);
        }
      },
    }),
  );
};
