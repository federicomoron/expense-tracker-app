import { Injectable, WritableSignal, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PwaInstallService {
  private _canInstall: WritableSignal<boolean> = signal(false);
  readonly canInstall = this._canInstall.asReadonly();

  private deferredPrompt: any = null;

  constructor() {
    this.initPwaEvents();
  }

  install(): void {
    if (!this.deferredPrompt) return;

    this.deferredPrompt.prompt();
    this.deferredPrompt.userChoice.then(() => {
      this._canInstall.set(false);
      this.deferredPrompt = null;
    });
  }

  isIos(): boolean {
    const ua = window.navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod/.test(ua);
  }

  isStandalone(): boolean {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    );
  }

  private initPwaEvents(): void {
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
}
