import { effect, inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';

import { AuthService } from '@services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);

  return new Promise<boolean>((resolve) => {
    let resolved = false;

    effect(() => {
      if (resolved) return;

      if (auth.isSessionRestored()) {
        resolved = true;
        resolve(auth.isLoggedIn());
      }
    });

    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve(false);
      }
    }, 1000);
  });
};
