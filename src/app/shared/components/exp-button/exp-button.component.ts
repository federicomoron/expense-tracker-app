import { Component, Input } from '@angular/core';

import { SharedMaterialModule } from '@shared/shared-material.module';

@Component({
  selector: 'app-exp-button',
  standalone: true,
  imports: [SharedMaterialModule],
  templateUrl: './exp-button.component.html',
  styleUrls: ['./exp-button.component.scss'],
})
export class ExpButtonComponent {
  @Input() type: 'button' | 'submit' = 'button';
  @Input() color: 'primary' | 'accent' | 'warn' = 'primary';
  @Input() disabled = false;
  @Input() fullWidth = true;
}
