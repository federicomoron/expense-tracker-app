import { Component, Input } from '@angular/core';

import { SharedUiModule } from '@app/shared/shared-ui.module';

@Component({
  selector: 'app-exp-button-spinner',
  standalone: true,
  imports: [SharedUiModule],
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
