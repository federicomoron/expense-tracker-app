import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LayoutService {
  private _removeTopPadding = signal(false);

  readonly removeTopPadding = this._removeTopPadding.asReadonly();

  setTopPadding(enabled: boolean) {
    this._removeTopPadding.set(!enabled);
  }

  disableTopPadding() {
    this._removeTopPadding.set(true);
  }

  enableTopPadding() {
    this._removeTopPadding.set(false);
  }
}
