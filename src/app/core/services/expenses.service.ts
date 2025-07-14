import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

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

  getExpenseById(expenseId: number): Observable<ExpenseResponse> {
    console.warn('⚠️ getExpenseById is mocked – replace when backend is ready');
    return of({
      success: true,
      data: {
        id: expenseId,
        description: 'Mock expense',
        total: 50,
        currency: 'USD',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        participants: [],
        category: 'Food',
        iconUrl: '/assets/food.svg',
      },
    });
  }
}
