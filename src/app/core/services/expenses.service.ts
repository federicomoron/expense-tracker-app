import { HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_ENDPOINTS } from '@constants/api-endpoints';
import { ExpenseRequest, ExpenseResponse } from '@models/expenses.model';
import { EnvironmentService } from '@services/environment.service';
import { HttpService } from '@services/http.service';

@Injectable({ providedIn: 'root' })
export class ExpenseService {
  private readonly http = inject(HttpService);
  private readonly env = inject(EnvironmentService);

  private readonly apiUrl = this.env.apiUrl;

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
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    });
  }
}
