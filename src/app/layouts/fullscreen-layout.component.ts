import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  standalone: true,
  selector: 'fullscreen-layout',
  imports: [RouterOutlet],
  template: `
    <div class="fullscreen-wrapper">
      <router-outlet></router-outlet>
    </div>
  `,
  styleUrls: ['./fullscreen-layout.component.scss'],
})
export class FullscreenLayoutComponent {}
