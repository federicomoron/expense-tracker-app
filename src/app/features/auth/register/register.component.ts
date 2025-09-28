import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { NAVIGATION_ROUTES } from '@constants/routes';
import { UiMessageService } from '@services/ui-message.service';
import { UserService } from '@services/user.service';
import { ExpButtonComponent } from '@shared/components/exp-button/exp-button.component';
import { SharedMaterialModule } from '@shared/shared-material.module';
import { nonEmpty, strongPassword, validEmail } from '@shared/utils/form-validators';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [SharedMaterialModule, ReactiveFormsModule, TranslateModule, ExpButtonComponent],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  public readonly showPassword = signal(false);
  public readonly isLoading = signal(false);

  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly uiMessage = inject(UiMessageService);
  private readonly userService = inject(UserService);
  private readonly translate = inject(TranslateService);

  public form = this.fb.nonNullable.group({
    name: ['', [Validators.required, nonEmpty]],
    email: ['', [Validators.required, nonEmpty, validEmail]],
    password: ['', [Validators.required, nonEmpty, Validators.minLength(6), strongPassword]],
  });

  togglePasswordVisibility(): void {
    this.showPassword.update((v) => !v);
  }

  goBack(): void {
    void this.router.navigate([NAVIGATION_ROUTES.LOGIN]);
  }

  getError(controlName: string): string | null {
    const control = this.form.get(controlName);
    if (!control || !control.touched || !control.invalid) return null;

    if (control.hasError('required') || control.hasError('nonEmpty')) {
      return this.translate.instant(`register.${controlName}Required`);
    }

    if (controlName === 'email') {
      if (control.hasError('invalidEmail') || control.hasError('email')) {
        return this.translate.instant('register.emailInvalid');
      }
    }

    if (controlName === 'password') {
      if (control.hasError('minlength')) {
        return this.translate.instant('register.passwordMinLength');
      }
      if (control.hasError('weakPassword')) {
        return this.translate.instant('register.passwordWeak');
      }
    }

    return this.translate.instant('validation.invalidField');
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.uiMessage.showWarning(this.translate.instant('register.formInvalid'));
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    const data = this.form.getRawValue();

    this.userService.register(data).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (!res.success || !res.data?.email) {
          this.uiMessage.showError(this.translate.instant('register.registerError'));
          return;
        }
        this.uiMessage.showSuccess(this.translate.instant('register.registerSuccess'));
        setTimeout(() => void this.router.navigate([NAVIGATION_ROUTES.LOGIN]), 2000);
      },
      error: (err) => {
        this.isLoading.set(false);
        if (err.status === 409) {
          this.uiMessage.showError(this.translate.instant('register.emailExists'));
        } else {
          this.uiMessage.showError(this.translate.instant('register.genericError'));
        }
      },
    });
  }
}
