import { Component, computed, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

import { AuthService } from '@app/core/services/auth.service';
import { ExpButtonComponent } from '@app/shared/components/exp-button/exp-button.component';
import { SharedUiModule } from '@app/shared/shared-ui.module';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [SharedUiModule, RouterModule, ExpButtonComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  email = signal('');
  password = signal('');
  showPassword = signal(false);
  errorMessage = signal('');

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  isFormInvalid = computed(
    () => this.email().trim() === '' || this.password().trim() === ''
  );

  onSubmit(event: Event) {
    event.preventDefault();
    this.errorMessage.set('');

    if (this.isFormInvalid()) {
      this.errorMessage.set('Please fill in all fields.');
      return;
    }

    this.authService.login(this.email(), this.password()).subscribe({
      next: (res) => {
        if (res && res.success) {
          this.router.navigate(['/group']);
        } else {
          this.errorMessage.set('Incorrect email or password.');
        }
      },
      error: (err) => {
        if (err.status === 0) {
          // Network error or unreachable server
          this.errorMessage.set('Unable to connect. Please try again later.');
        } else if (err.status === 401 || err.status === 400) {
          // Invalid credentials
          this.errorMessage.set('Incorrect email or password.');
        } else {
          // Unexpected error
          this.errorMessage.set('An unexpected error occurred.');
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
    this.authService
      .login('google_user@example.com', 'fakepassword')
      .subscribe((res) => {
        if (res && res.success) {
          this.router.navigate(['/group']);
        } else {
          alert('Error with Google login');
        }
      });
  }
}
