import { Component, Input } from '@angular/core';

import { SharedMaterialModule } from '@shared/shared-material.module';

@Component({
  selector: 'app-exp-button-spinner',
  standalone: true,
  imports: [SharedMaterialModule],
  templateUrl: './exp-button-spinner.component.html',
  styleUrls: ['./exp-button-spinner.component.scss'],
})
export class ExpButtonSpinnerComponent {
  @Input() type: 'button' | 'submit' = 'button';
  @Input() color: 'primary' | 'accent' | 'warn' = 'primary';
  @Input() disabled = false;
  @Input() fullWidth = true;
  @Input() isLoading = false;
}
