import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('./register.component').then((m) => m.RegisterComponent),
  },
] satisfies Routes;
