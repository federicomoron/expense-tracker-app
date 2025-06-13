import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_ENDPOINTS } from '@constants/api-endpoints';
import { environment } from '@environments/environment';
import { ExpenseRequest, ExpenseResponse } from '@models/expenses.model';
import { HttpService } from '@services/http.service';

@Injectable({ providedIn: 'root' })
export class ExpenseService {
  private readonly apiUrl = environment.apiUrl;
  private http = inject(HttpService);

  createExpense(expense: ExpenseRequest): Observable<ExpenseResponse> {
    return this.http.post<ExpenseResponse, ExpenseRequest>(
      `${this.apiUrl}${API_ENDPOINTS.CREATE_EXPENSE}`,
      expense,
    );
  }
}
