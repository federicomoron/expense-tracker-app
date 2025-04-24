import { HttpInterceptorFn } from '@angular/common/http';

import { STORAGE_KEYS } from '@app/core/constants/storage-keys';

export const authTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  return next(req);
};
