import { Routes } from '@angular/router';
import { ExpensesComponent } from './expenses/expenses.component';

export const expensesRoutes: Routes = [
  {
    path: '',
    component: ExpensesComponent,
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./expense-form/expense-form.component').then((m) => m.ExpenseFormComponent),
  },
];

