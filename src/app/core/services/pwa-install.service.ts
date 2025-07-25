import { Injectable, WritableSignal, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PwaInstallService {
  private deferredPrompt: any = null;

  private _canInstall: WritableSignal<boolean> = signal(false);
  readonly canInstall = this._canInstall.asReadonly();

  constructor() {
    if (this.isIos()) return;

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

  isIos(): boolean {
    const ua = window.navigator.userAgent.toLowerCase();
    const result = /iphone|ipad|ipod/.test(ua);
    return result;
  }

  isStandalone(): boolean {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    );
  }
}
