import { Routes } from '@angular/router';

import { authGuard } from '@core/guards/auth.guard';
import { groupGuard } from '@core/guards/group.guard';

const routes: Routes = [
  {
    path: 'new',
    loadComponent: () =>
      import('./expense-form/expense-form.component').then((m) => m.ExpenseFormComponent),
  },
  {
    path: ':expenseId/edit',
    canActivate: [authGuard, groupGuard],
    loadComponent: () =>
      import('./expense-form/expense-form.component').then((m) => m.ExpenseFormComponent),
  },
  {
    path: ':expenseId',
    canActivate: [authGuard, groupGuard],
    loadComponent: () =>
      import('./expense-detail/expense-detail.component').then((m) => m.ExpenseDetailComponent),
  },
];
export default routes;
