import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { AuthService } from '@services/auth.service';
import { GroupService } from '@services/group.service';

export const groupGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const groupService = inject(GroupService);
  const authService = inject(AuthService);
  const router = inject(Router);

  const userEmail = authService.currentUser()?.email;
  const idParam = route.paramMap.get('id');
  const groupId = idParam ? Number(idParam) : NaN;

  if (!userEmail || isNaN(groupId)) {
    void router.navigate(['/group']);
    return of(false);
  }

  return groupService.fetchGroups().pipe(
    map(() => {
      const groups = groupService.groups();
      const belongsToGroup = groups.some((g) => g.id === groupId);

      if (!belongsToGroup) {
        void router.navigate(['/group']);
      }

      return belongsToGroup;
    }),
    catchError(() => {
      void router.navigate(['/group']);
      return of(false);
    }),
  );
};
