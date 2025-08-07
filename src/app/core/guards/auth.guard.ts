import { effect, inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';

import { AuthService } from '@services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);

  return new Promise<boolean>((resolve) => {
    const stop = effect(() => {
      if (auth.isSessionRestored()) {
        stop.destroy();
        resolve(auth.isLoggedIn());
      }
    });
    setTimeout(() => {
      stop.destroy();
      resolve(false);
    }, 1000);
  });
};
