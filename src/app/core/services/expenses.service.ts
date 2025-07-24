import { HttpHeaders } from '@angular/common/http';
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

  updateExpense(expenseId: number, expense: ExpenseRequest): Observable<ExpenseResponse> {
    return this.http.put<ExpenseResponse, ExpenseRequest>(
      `${this.apiUrl}/expenses/${expenseId}`,
      expense,
    );
  }

  deleteExpense(expenseId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/expenses/${expenseId}`, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    });
  }
}
