import { Injectable } from '@angular/core';

import { environment } from '@environments/environment';

@Injectable({ providedIn: 'root' })
export class EnvironmentService {
  get(key: string): string | undefined {
    const viteValue = (import.meta as any).env?.[`VITE_${key}`];
    if (viteValue) return viteValue;

    if (key === 'API_URL') return environment.apiUrl;

    return (environment as any)[key.toLowerCase()];
  }

  get apiUrl(): string {
    return this.get('API_URL') || '';
  }

  get isProduction(): boolean {
    return environment.production;
  }
}
