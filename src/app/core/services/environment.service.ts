import { Injectable } from '@angular/core';

import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class EnvironmentService {
  get(key: string): string | undefined {
    const val = (environment as any)[key];
    if (val === undefined) return undefined;
    return String(val);
  }

  get apiUrl(): string {
    return (environment as any).API_URL || '';
  }

  get isProduction(): boolean {
    return !!environment.production;
  }
}
