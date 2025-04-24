import { Routes } from '@angular/router';

export const groupsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./groups.component').then((m) => m.GroupsComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./group-detail/group-detail.component').then((m) => m.GroupDetailComponent),
  },
];
