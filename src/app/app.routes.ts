import { Routes } from '@angular/router';

import { authGuard } from '@core/guards/auth.guard';

import { AppLayoutComponent } from './layouts/app-layout.component';
import { FullscreenLayoutComponent } from './layouts/fullscreen-layout.component';

export const routes: Routes = [
  {
    path: 'group/new',
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
      { path: '', pathMatch: 'full', redirectTo: 'group' },
      {
        path: 'group',
        canActivate: [authGuard],
        loadChildren: () => import('@features/groups/groups.routes').then((m) => m.default),
      },
      {
        path: 'login',
        loadChildren: () => import('@features/auth/login/login.routes').then((m) => m.default),
      },
      {
        path: 'register',
        loadChildren: () =>
          import('@features/auth/register/register.routes').then((m) => m.default),
      },
    ],
  },
  {
    path: 'expenses',
    component: FullscreenLayoutComponent,
    loadChildren: () => import('@features/expenses/expenses.routes').then((m) => m.default),
  },
  {
    path: '**',
    redirectTo: 'group',
  },
];
