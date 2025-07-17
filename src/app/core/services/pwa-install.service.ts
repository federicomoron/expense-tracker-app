import { Injectable, WritableSignal, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PwaInstallService {
  private deferredPrompt: any = null;

  private _canInstall: WritableSignal<boolean> = signal(false);
  readonly canInstall = this._canInstall.asReadonly();

  constructor() {
    this._canInstall.set(true);

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this._canInstall.set(true);
    });

    window.addEventListener('appinstalled', () => {
      this._canInstall.set(false);
      this.deferredPrompt = null;
    });
  }

  install(): void {
    if (this.deferredPrompt) {
      this.deferredPrompt.prompt();
      this.deferredPrompt.userChoice.then(() => {
        this._canInstall.set(false);
        this.deferredPrompt = null;
      });
    }
  }
}
