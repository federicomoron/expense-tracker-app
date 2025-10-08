import { Routes } from '@angular/router';

import { loginGuard } from '@core/guards/login.guard';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'login',
        canActivate: [loginGuard],
        loadComponent: () => import('./login/login.component').then((m) => m.LoginComponent),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./register/register.component').then((m) => m.RegisterComponent),
      },
    ],
  },
] satisfies Routes;

export default routes;
