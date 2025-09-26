import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ApiErrorService, SKIP_ERROR_HANDLER } from '@services/api-error.service';

export const apiErrorInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn,
): Observable<HttpEvent<any>> => {
  const apiError = inject(ApiErrorService);

  if (req.context.get(SKIP_ERROR_HANDLER)) {
    return next(req);
  }

  return next(req).pipe(
    catchError((err: any) => {
      if (err instanceof HttpErrorResponse) {
        apiError.handleError(err);
      }
      return throwError(() => err);
    }),
  );
};
