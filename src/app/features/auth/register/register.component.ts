import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { SnackbarService } from '@app/core/services/snackbar.service';
import { ExpButtonComponent } from '@app/shared/components/exp-button/exp-button.component';
import { NAVIGATION_ROUTES } from '@constants/routes';
import { UserService } from '@services/user.service';
import { SharedUiModule } from '@shared/shared-ui.module';
import { nonEmpty, strongPassword, validEmail } from '@shared/utils/form-validators';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [SharedUiModule, ReactiveFormsModule, TranslateModule, ExpButtonComponent],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  showPassword = signal(false);

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private snackbar = inject(SnackbarService);
  private userService = inject(UserService);
  private translate = inject(TranslateService);

  loading = false;

  form: FormGroup = this.fb.group({
    name: ['', [Validators.required, nonEmpty]],
    email: ['', [Validators.required, nonEmpty, validEmail]],
    password: ['', [Validators.required, nonEmpty, Validators.minLength(6), strongPassword]],
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.snackbar.show(this.translate.instant('register.formInvalid'));
      return;
    }

    this.loading = true;
    const data = this.form.value;

    this.userService.register(data).subscribe({
      next: (res) => {
        this.loading = false;

        if (!res.success || !res.data?.email) {
          this.snackbar.show(this.translate.instant('register.registerError'));
          return;
        }

        this.snackbar.show(this.translate.instant('register.registerSuccess'));
        setTimeout(() => void this.router.navigateByUrl('/login'), 2000);
      },
      error: (err) => {
        this.loading = false;

        if (err.status === 409) {
          this.snackbar.show(this.translate.instant('register.emailExists'));
        } else {
          this.snackbar.show(this.translate.instant('register.genericError'));
        }
      },
    });
  }

  goBack() {
    void this.router.navigate([NAVIGATION_ROUTES.LOGIN]);
  }

  togglePasswordVisibility() {
    this.showPassword.update((value) => !value);
  }

  getError(controlName: string): string | null {
    const control = this.form.get(controlName);
    if (!control || !control.touched) return null;

    if (control.hasError('required')) {
      return this.translate.instant(`register.${controlName}Required`);
    }

    if (control.hasError('nonEmpty')) {
      return this.translate.instant(`register.nonEmpty`);
    }

    if (controlName === 'email' && control.hasError('invalidEmail')) {
      return this.translate.instant('register.emailInvalid');
    }

    if (controlName === 'password') {
      if (control.hasError('minlength')) {
        return this.translate.instant('register.passwordMinLength');
      }
      if (control.hasError('weakPassword')) {
        return this.translate.instant('register.passwordWeak');
      }
    }

    return null;
  }
}
