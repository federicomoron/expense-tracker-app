import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { mergeMap, of, throwError } from 'rxjs';

import { API_ENDPOINTS } from '@constants/api-endpoints';
import { NAVIGATION_ROUTES } from '@constants/routes';
import { STORAGE_KEYS } from '@constants/storage-keys';
import { LoginResponse, User } from '@models/auth.model';
import { EnvironmentService } from '@services/environment.service';
import { HttpService } from '@services/http.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _isLoggedIn = signal(false);
  private readonly _currentUser = signal<User | null>(null);
  private readonly _isSessionRestored = signal(false);

  private http = inject(HttpService);
  private router = inject(Router);
  private env = inject(EnvironmentService);

  readonly isLoggedIn = this._isLoggedIn.asReadonly();
  readonly currentUser = this._currentUser.asReadonly();
  readonly isSessionRestored = this._isSessionRestored.asReadonly();

  login(email: string, password: string) {
    const loginRequest = { email, password };
    const apiUrl = this.getApiUrl();

    return this.http
      .post<LoginResponse, typeof loginRequest>(`${apiUrl}${API_ENDPOINTS.LOGIN}`, loginRequest)
      .pipe(
        mergeMap((res) => {
          const user = res.data?.user;
          const token = res.data?.token;

          if (!res.success || !user || !token) {
            return throwError(() => new Error('Invalid response from server'));
          }

          this._isLoggedIn.set(true);
          this._currentUser.set(user);
          localStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'true');
          localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
          localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);

          return of(res);
        }),
      );
  }

  logout(redirect = true) {
    this._isLoggedIn.set(false);
    this._currentUser.set(null);
    this.clearSession();

    if (redirect) void this.router.navigate([NAVIGATION_ROUTES.LOGIN]);
  }

  restoreSession(): void {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    const userJson = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);

    if (token && userJson && this.isTokenValid(token)) {
      try {
        const user = JSON.parse(userJson);
        this._isLoggedIn.set(true);
        this._currentUser.set(user);
      } catch {
        this.clearSession();
      }
    } else {
      this.clearSession();
    }

    this._isSessionRestored.set(true);
  }

  private getApiUrl(): string {
    return this.env.apiUrl || 'http://localhost:4200/api';
  }

  private isTokenValid(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      return payload.exp && payload.exp > now;
    } catch {
      return false;
    }
  }

  private clearSession() {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.IS_LOGGED_IN);
  }
}
