import { Routes } from '@angular/router';

import { groupGuard } from '@app/core/guards/group.guard';

export const groupsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./groups.component').then((m) => m.GroupsComponent),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./group-form/group-form.component').then((m) => m.GroupFormComponent),
  },
  {
    path: ':id',
    canActivate: [groupGuard],
    loadComponent: () =>
      import('./group-detail/group-detail.component').then((m) => m.GroupDetailComponent),
  },
];
