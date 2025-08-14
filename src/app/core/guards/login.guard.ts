import { inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { CanActivateFn, Router } from '@angular/router';
import { filter, firstValueFrom, map } from 'rxjs';

import { AuthService } from '../services/auth.service';

export const loginGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return await firstValueFrom(
    toObservable(auth.isSessionRestored).pipe(
      filter((restored) => restored),
      map(() => {
        if (auth.isLoggedIn()) {
          void router.navigate(['/groups']);
          return false;
        }
        return true;
      }),
    ),
  );
};
