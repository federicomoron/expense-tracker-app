import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiStatusService } from '@services/api-status.service';

@Injectable({ providedIn: 'root' })
export class HttpService {
  private http = inject(HttpClient);
  private apiStatus = inject(ApiStatusService);

  get<T>(url: string, options = {}): Observable<T> {
    return this.http.get<T>(url, options);
  }

  post<T, U>(url: string, body: U, options = {}): Observable<T> {
    return this.http.post<T>(url, body, options);
  }

  put<T, U>(url: string, body: U, options = {}): Observable<T> {
    return this.http.put<T>(url, body, options);
  }

  delete<T>(url: string, options = {}): Observable<T> {
    return this.http.delete<T>(url, options);
  }
}
