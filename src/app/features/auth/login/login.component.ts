import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { SnackbarService } from '@app/core/services/snackbar.service';
import { AuthService } from '@services/auth.service';
import { ExpButtonComponent } from '@shared/components/exp-button/exp-button.component';
import { SharedUiModule } from '@shared/shared-ui.module';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [SharedUiModule, RouterModule, ExpButtonComponent, TranslateModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  email = signal('');
  password = signal('');
  showPassword = signal(false);
  errorMessage = signal('');
  isLoading = signal(false);

  private authService = inject(AuthService);
  private router = inject(Router);
  private snackbar = inject(SnackbarService);
  private translate = inject(TranslateService);

  isFormInvalid = computed(() => this.email().trim() === '' || this.password().trim() === '');

  onSubmit(event: Event) {
    event.preventDefault();
    this.errorMessage.set('');

    if (this.isFormInvalid()) {
      this.errorMessage.set(this.translate.instant('login.fillAllFields'));
      return;
    }

    this.isLoading.set(true);

    this.authService.login(this.email(), this.password()).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res?.success) {
          void this.router.navigate(['/groups']);
        } else {
          this.snackbar.show(this.translate.instant('login.invalidCredentials'));
        }
      },
      error: (err) => {
        this.isLoading.set(false);

        if (err.status === 0) {
          this.snackbar.show(this.translate.instant('login.apiUnreachable'));
        } else if (err.status === 401 || err.status === 400) {
          this.snackbar.show(this.translate.instant('login.invalidCredentials'));
        } else {
          this.snackbar.show(this.translate.instant('login.unexpectedError'));
        }
      },
    });
  }

  onEmailInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.email.set(input.value);
  }

  onPasswordInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.password.set(input.value);
  }

  togglePasswordVisibility() {
    this.showPassword.update((value) => !value);
  }

  onGoogleLogin() {
    this.authService.login('google_user@example.com', 'fakepassword').subscribe((res) => {
      if (res && res.success) {
        void this.router.navigate(['/groups']);
      } else {
        alert(this.translate.instant('login.googleError'));
      }
    });
  }
}
