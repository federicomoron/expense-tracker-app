import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  standalone: true,
  selector: 'fullscreen-layout',
  imports: [RouterOutlet],
  templateUrl: './fullscreen-layout.component.html',
  styleUrls: ['./fullscreen-layout.component.scss'],
})
export class FullscreenLayoutComponent {}
