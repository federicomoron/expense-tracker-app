import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { STORAGE_KEYS } from '../constants/storage-keys';

export interface User {
  email: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _isLoggedIn = signal(false);
  private readonly _currentUser = signal<User | null>(null);
  private readonly apiUrl = environment.apiUrl;

  isLoggedIn = this._isLoggedIn.asReadonly();
  currentUser = this._currentUser.asReadonly();

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {
    // Load user session from localStorage if available
    const isLoggedIn = localStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN) === 'true';
    const userJson = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);

    if (isLoggedIn && userJson) {
      const user = JSON.parse(userJson);
      this._isLoggedIn.set(true);
      this._currentUser.set(user);
    }
  }

  login(email: string, password: string) {
    return this.http
      .post<{
        success: boolean;
        data: { user: User; token: string };
      }>(`${this.apiUrl}${API_ENDPOINTS.LOGIN}`, { email, password })
      .pipe(
        tap((res) => {
          const user = res.data?.user;
          const token = res.data?.token;

          if (!res.success || !user || !token) {
            throw new Error('Respuesta inválida del servidor');
          }

          // Save login state and user info in memory and localStorage
          this._isLoggedIn.set(true);
          this._currentUser.set(user);

          localStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'true');
          localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
          localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
        }),
      );
  }

  logout() {
    this._isLoggedIn.set(false);
    this._currentUser.set(null);

    // Clear session and redirect to login page
    localStorage.removeItem(STORAGE_KEYS.IS_LOGGED_IN);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    this.router.navigate(['/login']);
  }
}
