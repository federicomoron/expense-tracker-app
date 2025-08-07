import { effect, inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

export const loginGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return new Promise<boolean>((resolve) => {
    const stop = effect(() => {
      if (auth.isSessionRestored()) {
        stop.destroy();
        if (auth.isLoggedIn()) {
          void router.navigate(['/groups']);
          resolve(false);
        } else {
          resolve(true);
        }
      }
    });
    setTimeout(() => {
      stop.destroy();
      resolve(false);
    }, 1000);
  });
};
