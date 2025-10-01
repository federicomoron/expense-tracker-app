import { Routes } from '@angular/router';

import { groupGuard } from '@core/guards/group.guard';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./groups.component').then((m) => m.GroupsComponent),
  },
  {
    path: ':id',
    canActivate: [groupGuard],
    loadComponent: () =>
      import('./group-detail/group-detail.component').then((m) => m.GroupDetailComponent),
  },
  {
    path: ':id/totals',
    canActivate: [groupGuard],
    loadComponent: () =>
      import('./group-totals/group-totals.component').then((m) => m.GroupTotalsComponent),
  },
];

export default routes;
