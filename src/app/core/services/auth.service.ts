import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';

import { API_ENDPOINTS } from '@constants/api-endpoints';
import { STORAGE_KEYS } from '@constants/storage-keys';
import { environment } from '@environments/environment';
import { HttpService } from '@services/http.service';

import { LoginResponse, User } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _isLoggedIn = signal(false);
  private readonly _currentUser = signal<User | null>(null);
  private readonly apiUrl = environment.apiUrl;
  private http = inject(HttpService);

  private readonly _isSessionRestored = signal(false);
  isSessionRestored = this._isSessionRestored.asReadonly();

  isLoggedIn = this._isLoggedIn.asReadonly();
  currentUser = this._currentUser.asReadonly();

  constructor(private router: Router) {}

  login(email: string, password: string) {
    const loginRequest = { email, password };
    return this.http
      .post<
        LoginResponse,
        typeof loginRequest
      >(`${this.apiUrl}${API_ENDPOINTS.LOGIN}`, loginRequest)
      .pipe(
        tap((res) => {
          const user = res.data?.user;
          const token = res.data?.token;

          if (!res.success || !user || !token) {
            throw new Error('Invalid response from server');
          }

          this._isLoggedIn.set(true);
          this._currentUser.set(user);

          localStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'true');
          localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
          localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
        }),
      );
  }

  logout(redirect = true) {
    this._isLoggedIn.set(false);
    this._currentUser.set(null);

    localStorage.removeItem(STORAGE_KEYS.IS_LOGGED_IN);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);

    if (redirect) void this.router.navigate(['/login']);
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
}
