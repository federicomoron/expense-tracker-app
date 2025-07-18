import { Routes } from '@angular/router';

import { authGuard } from '@core/guards/auth.guard';

import { AppLayoutComponent } from './layouts/app-layout.component';
import { FullscreenLayoutComponent } from './layouts/fullscreen-layout.component';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('@features/auth/auth.routes').then((m) => m.default),
  },
  {
    path: '',
    component: AppLayoutComponent,
    canActivateChild: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'groups' },
      {
        path: 'groups/new',
        loadComponent: () =>
          import('@features/groups/group-form/group-form.component').then(
            (m) => m.GroupFormComponent,
          ),
      },
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
    path: 'groups/:groupId/expenses',
    component: FullscreenLayoutComponent,
    canActivate: [authGuard],
    loadChildren: () => import('@features/expenses/expenses.routes').then((m) => m.default),
  },
  {
    path: '**',
    redirectTo: 'groups',
  },
];
