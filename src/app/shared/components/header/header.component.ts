import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { SharedMaterialModule } from '@config/shared/shared-material.module';
import { HeaderAction } from '@models/header-action.model';

import { SpinnerComponent } from '../spinner/spinner.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [SharedMaterialModule, TranslateModule, SpinnerComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  @Input() title = '';
  @Input() showBack = false;
  @Output() back = new EventEmitter<void>();

  @Input() actions?: HeaderAction[];
}
