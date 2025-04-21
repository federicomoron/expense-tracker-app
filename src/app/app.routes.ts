import { Routes } from '@angular/router';

import { authGuard } from '@app/core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'group',
  },
  {
    path: 'group',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/groups/groups.routes').then((m) => m.groupsRoutes),
  },
  {
    path: 'expenses/new/:groupId',
    loadComponent: () =>
      import('@app/features/expenses/expense-form/expense-form.component').then(
        (m) => m.ExpenseFormComponent,
      ),
  },
  {
    path: 'login',
    loadChildren: () =>
      import('./features/auth/login/login.routes').then((m) => m.loginRoutes),
  },
  {
    path: 'register',
    loadChildren: () =>
      import('./features/auth/register/register.routes').then(
        (m) => m.registerRoutes
      ),
  },
  {
    path: '**',
    redirectTo: '/group',
  },
];
