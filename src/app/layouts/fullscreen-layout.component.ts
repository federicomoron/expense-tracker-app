import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  standalone: true,
  selector: 'fullscreen-layout',
  imports: [RouterOutlet],
  template: ` <router-outlet /> `,
})
export class FullscreenLayoutComponent {}
