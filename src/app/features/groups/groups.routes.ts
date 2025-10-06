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
];
export default routes;
