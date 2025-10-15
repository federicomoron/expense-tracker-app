import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_ENDPOINTS } from '@constants/api-endpoints';
import { RegisterPayload, RegisterResponse } from '@models/user.model';
import { EnvironmentService } from '@services/environment.service';
import { HttpService } from '@services/http.service';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpService);
  private readonly env = inject(EnvironmentService);

  private readonly apiUrl = this.env.apiUrl;

  register(data: RegisterPayload): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse, RegisterPayload>(
      `${this.apiUrl}${API_ENDPOINTS.REGISTER}`,
      data,
    );
  }
}
