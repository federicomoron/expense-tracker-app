import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { NavigationComponent } from '@app/features/navigation/navigation.component';

@Component({
  standalone: true,
  selector: 'app-layout',
  imports: [RouterOutlet, NavigationComponent],
  template: `
    <app-navigation>
      <router-outlet />
    </app-navigation>
  `,
})
export class AppLayoutComponent {}
