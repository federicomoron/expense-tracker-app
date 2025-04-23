import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class HttpService {
  private http = inject(HttpClient);

  get<T>(url: string, options = {}): Observable<T> {
    return this.http.get<T>(url, options).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('[HTTP GET error]', error);
        return throwError(() => error);
      })
    );
  }

  post<T, U>(url: string, body: U, options = {}): Observable<T> {
    return this.http.post<T>(url, body, options).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('[HTTP POST error]', error);
        return throwError(() => error);
      })
    );
  }
}
