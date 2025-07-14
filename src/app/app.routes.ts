import { Routes } from '@angular/router';

import { authGuard } from '@core/guards/auth.guard';

import { AppLayoutComponent } from './layouts/app-layout.component';
import { FullscreenLayoutComponent } from './layouts/fullscreen-layout.component';

export const routes: Routes = [
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
    path: '',
    component: AppLayoutComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'groups' },
      {
        path: 'groups',
        canActivate: [authGuard],
        loadChildren: () => import('@features/groups/groups.routes').then((m) => m.default),
      },
      {
        path: 'account',
        canActivate: [authGuard],
        loadComponent: () =>
          import('@features/account/account.component').then((m) => m.AccountComponent),
      },
      {
        path: '',
        loadChildren: () => import('@features/auth/auth.routes').then((m) => m.default),
      },
    ],
  },
  {
    path: 'groups/:groupId/expenses',
    component: FullscreenLayoutComponent,
    loadChildren: () => import('@features/expenses/expenses.routes').then((m) => m.default),
  },
  {
    path: '**',
    redirectTo: 'groups',
  },
];
