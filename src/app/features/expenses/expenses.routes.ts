import { Routes } from '@angular/router';

import { authGuard } from '@app/core/guards/auth.guard';
import { groupGuard } from '@app/core/guards/group.guard';

const routes: Routes = [
  {
    path: 'new',
    loadComponent: () =>
      import('./expense-form/expense-form.component').then((m) => m.ExpenseFormComponent),
  },
  {
    path: ':expenseId/edit',
    loadComponent: () =>
      import('./expense-form/expense-form.component').then((m) => m.ExpenseFormComponent),
    canActivate: [authGuard, groupGuard],
  },
];

export default routes;
