import { inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { CanActivateFn, Router } from '@angular/router';
import { filter, firstValueFrom, map } from 'rxjs';

import { NAVIGATION_ROUTES } from '@constants/routes';
import { AuthService } from '@services/auth.service';

export const loginGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const isRestored$ = toObservable(auth.isSessionRestored).pipe(
    filter((restored) => restored),
    map(() => {
      if (auth.isLoggedIn()) {
        void router.navigate([NAVIGATION_ROUTES.GROUPS]);
        return false;
      }
      return true;
    }),
  );

  return await firstValueFrom(isRestored$);
};
