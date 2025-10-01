import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

import { SharedMaterialModule } from '@shared/shared-material.module';

@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [CommonModule, SharedMaterialModule],
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.scss'],
})
export class SpinnerComponent {
  @Input() diameter: number = 24;

  @Input() color: 'primary' | 'white' = 'primary';
}
