import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';

import { ApiStatusService } from './api-status.service';

@Injectable({ providedIn: 'root' })
export class HttpService {
  private http = inject(HttpClient);
  private apiStatus = inject(ApiStatusService);

  private handleError(error: HttpErrorResponse, method: string) {
    console.error(`[HTTP ${method} error]`, error);

    if (error.status === 0) {
      this.apiStatus.setReachable(false);
    } else {
      this.apiStatus.setReachable(true);
    }

    return throwError(() => error);
  }

  get<T>(url: string, options = {}): Observable<T> {
    return this.http.get<T>(url, options).pipe(catchError((err) => this.handleError(err, 'GET')));
  }

  post<T, U>(url: string, body: U, options = {}): Observable<T> {
    return this.http
      .post<T>(url, body, options)
      .pipe(catchError((err) => this.handleError(err, 'POST')));
  }

  put<T, U>(url: string, body: U, options = {}): Observable<T> {
    return this.http
      .put<T>(url, body, options)
      .pipe(catchError((err) => this.handleError(err, 'PUT')));
  }

  delete<T>(url: string, options = {}): Observable<T> {
    return this.http
      .delete<T>(url, options)
      .pipe(catchError((err) => this.handleError(err, 'DELETE')));
  }
}
