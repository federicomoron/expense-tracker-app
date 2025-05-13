import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_ENDPOINTS } from '@app/core/constants/api-endpoints';
import { ExpenseRequest, ExpenseResponse } from '@app/core/models/expenses.model';
import { HttpService } from '@app/core/services/http.service';
import { environment } from '@environments/environment';

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

  // getExpensesByGroupId(groupId: number): Observable<ExpenseResponse[]> {
  //   return this.http.get<ExpenseResponse[]>(
  //     `${this.apiUrl}${API_ENDPOINTS.GET_EXPENSES_BY_GROUP(groupId)}`
  //   );
  // }
}
