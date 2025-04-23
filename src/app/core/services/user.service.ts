import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_ENDPOINTS } from '@app/core/constants/api-endpoints';
import { HttpService } from '@app/core/services/http.service';
import { environment } from '@environments/environment';

export interface User {
  email: string;
  name: string;
}
export interface RegisterResponse {
  success: boolean;
  data: User;
}

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpService);
  private API_URL = environment.apiUrl;

  register(data: RegisterPayload): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse, RegisterPayload>(
      `${this.API_URL}${API_ENDPOINTS.REGISTER}`,
      data
    );
  }
}
