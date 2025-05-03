import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-exp-button',
  standalone: true,
  imports: [MatButtonModule],
  templateUrl: './exp-button.component.html',
  styleUrls: ['./exp-button.component.scss'],
})
export class ExpButtonComponent {
  @Input() type: 'button' | 'submit' = 'button';
  @Input() color: 'primary' | 'accent' | 'warn' = 'primary';
  @Input() disabled = false;
  @Input() fullWidth = true;
}
