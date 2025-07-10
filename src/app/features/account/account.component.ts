import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';

import { AuthService } from '@services/auth.service';
import { SharedUiModule } from '@shared/shared-ui.module';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, SharedUiModule],
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
})
export class AccountComponent {
  auth = inject(AuthService);

  logout() {
    this.auth.logout();
  }
}
