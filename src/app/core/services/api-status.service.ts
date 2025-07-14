import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ApiStatusService {
  private readonly _isReachable = signal(true);

  setReachable(status: boolean): void {
    this._isReachable.set(status);
  }

  isApiReachable(): boolean {
    return this._isReachable();
  }

  readonly isReachable = this._isReachable.asReadonly();
}
