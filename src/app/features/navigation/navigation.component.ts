import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, Signal, computed, inject } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AuthService } from '@app/core/services/auth.service';
import { SharedUiModule } from '@app/shared/shared-ui.module';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [RouterModule, SharedUiModule],
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss'],
})
export class NavigationComponent {
  constructor(public authService: AuthService) {}

  logout() {
    this.authService.logout();
  }

  private breakpointObserver = inject(BreakpointObserver);

  isSmallScreen: Signal<boolean> = computed(() =>
    this.breakpointObserver.isMatched(Breakpoints.Handset),
  );
}
