import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { SnackbarService } from '@app/core/services/snackbar.service';
import { ExpButtonComponent } from '@app/shared/components/exp-button/exp-button.component';
import { UserService } from '@services/user.service';
import { SharedUiModule } from '@shared/shared-ui.module';

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
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
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
    void this.router.navigate(['/login']);
  }

  togglePasswordVisibility() {
    this.showPassword.update((value) => !value);
  }
}
