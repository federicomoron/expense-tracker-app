import { Routes } from '@angular/router';

import { NAVIGATION_ROUTES } from '@constants/routes';
import { authGuard } from '@core/guards/auth.guard';
import { groupGuard } from '@core/guards/group.guard';
import { loginGuard } from '@core/guards/login.guard';
import { AppLayoutComponent } from '@layouts/app-layout/app-layout.component';
import { FullscreenLayoutComponent } from '@layouts/fulllscreen-layout/fullscreen-layout.component';

export const routes: Routes = [
  // Layout without footer
  {
    path: 'groups/new',
    component: FullscreenLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('@features/groups/group-form/group-form.component').then(
            (m) => m.GroupFormComponent,
          ),
      },
    ],
  },
  {
    path: 'groups/:id/totals',
    component: FullscreenLayoutComponent,
    canActivate: [authGuard, groupGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('@features/groups/group-totals/group-totals.component').then(
            (m) => m.GroupTotalsComponent,
          ),
      },
    ],
  },
  {
    path: 'groups/:groupId/expenses',
    component: FullscreenLayoutComponent,
    canActivateChild: [authGuard, groupGuard],
    children: [
      {
        path: 'new',
        loadComponent: () =>
          import('@features/expenses/expense-form/expense-form.component').then(
            (m) => m.ExpenseFormComponent,
          ),
      },
      {
        path: ':expenseId',
        loadComponent: () =>
          import('@features/expenses/expense-detail/expense-detail.component').then(
            (m) => m.ExpenseDetailComponent,
          ),
      },
      {
        path: ':expenseId/edit',
        loadComponent: () =>
          import('@features/expenses/expense-form/expense-form.component').then(
            (m) => m.ExpenseFormComponent,
          ),
      },
    ],
  },
  // Layout with header + footer
  {
    path: '',
    component: AppLayoutComponent,
    canActivateChild: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'groups' },
      {
        path: 'groups',
        loadChildren: () => import('@features/groups/groups.routes').then((m) => m.default),
      },
      {
        path: 'account',
        loadComponent: () =>
          import('@features/account/account.component').then((m) => m.AccountComponent),
      },
    ],
  },
  {
    path: '',
    children: [
      {
        path: 'login',
        canActivate: [loginGuard],
        loadComponent: () =>
          import('@features/auth/login/login.component').then((m) => m.LoginComponent),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('@features/auth/register/register.component').then((m) => m.RegisterComponent),
      },
    ],
  },

  // Catch all
  { path: '**', redirectTo: NAVIGATION_ROUTES.GROUPS },
];
