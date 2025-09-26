import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { AuthService } from '@services/auth.service';
import { UiMessageService } from '@services/ui-message.service';
import { ExpButtonSpinnerComponent } from '@shared/components/exp-button-spinner/exp-button-spinner.component';
import { SharedMaterialModule } from '@shared/shared-material.module';
import { nonEmpty, validEmail } from '@shared/utils/form-validators';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    SharedMaterialModule,
    RouterModule,
    ExpButtonSpinnerComponent,
    TranslateModule,
    ReactiveFormsModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  public readonly showPassword = signal(false);
  public readonly isLoading = signal(false);

  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly uiMessage = inject(UiMessageService);
  private readonly translate = inject(TranslateService);

  public form = this.fb.nonNullable.group({
    email: ['', [Validators.required, nonEmpty, validEmail]],
    password: ['', [Validators.required, nonEmpty]],
  });

  get inputPasswordType(): string {
    return this.showPassword() ? 'text' : 'password';
  }

  get title(): string {
    return this.translate.instant('login.title');
  }

  get emailLabel(): string {
    return this.translate.instant('login.emailLabel');
  }

  get passwordLabel(): string {
    return this.translate.instant('login.passwordLabel');
  }

  get togglePasswordVisibilityLabel(): string {
    return this.showPassword()
      ? this.translate.instant('login.hidePassword')
      : this.translate.instant('login.showPassword');
  }

  get button(): string {
    return this.translate.instant('login.loginButton');
  }

  get noAccount(): string {
    return this.translate.instant('login.noAccount');
  }

  get registerHere(): string {
    return this.translate.instant('login.registerHere');
  }

  togglePasswordVisibility(): void {
    this.showPassword.update((v) => !v);
  }

  getError(controlName: string): string | null {
    const control = this.form.get(controlName);
    if (!control || !control.touched || !control.invalid) return null;

    const controlError = control.errors;
    if (controlError?.['required'] || controlError?.['nonEmpty']) {
      return this.translate.instant('validation.nonEmpty');
    }
    if (controlError?.['email'] || controlError?.['emailInvalid']) {
      return this.translate.instant('validation.emailInvalid');
    }
    return this.translate.instant('validation.invalidField');
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    const { email, password } = this.form.getRawValue();

    this.authService.login(email, password).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res?.success) {
          void this.router.navigate(['/groups']);
        } else {
          this.uiMessage.showError(this.translate.instant('login.invalidCredentials'));
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        if (err.status === 0) {
          this.uiMessage.showError(this.translate.instant('login.apiUnreachable'));
        } else if (err.status === 401 || err.status === 400) {
          this.uiMessage.showError(this.translate.instant('login.invalidCredentials'));
        } else {
          this.uiMessage.showError(this.translate.instant('login.unexpectedError'));
        }
      },
    });
  }

  onGoogleLogin(): void {
    this.authService.login('google_user@example.com', 'fakepassword').subscribe((res) => {
      if (res && res.success) {
        void this.router.navigate(['/groups']);
      } else {
        alert(this.translate.instant('login.googleError'));
      }
    });
  }
}
