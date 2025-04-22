import { HttpInterceptorFn } from '@angular/common/http';

export const authTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('authToken');

  return next(
    token
      ? req.clone({
          setHeaders: { Authorization: `Bearer ${token}` },
        })
      : req,
  );
};
