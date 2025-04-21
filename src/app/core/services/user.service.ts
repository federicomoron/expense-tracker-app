import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { API_ENDPOINTS } from '../constants/api-endpoints';

export interface User {
  email: string;
  name: string;
}
export interface RegisterResponse {
  success: boolean;
  data: User;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);
  private API_URL = environment.apiUrl;

  register(data: {
    name: string;
    email: string;
    password: string;
  }): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(
      `${this.API_URL}${API_ENDPOINTS.REGISTER}`,
      data
    );
  }
}
