import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_ENDPOINTS } from '@constants/api-endpoints';
import { environment } from '@environments/environment';
import { HttpService } from '@services/http.service';

import { RegisterPayload, RegisterResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpService);
  private API_URL = environment.apiUrl;

  register(data: RegisterPayload): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse, RegisterPayload>(
      `${this.API_URL}${API_ENDPOINTS.REGISTER}`,
      data,
    );
  }
}
