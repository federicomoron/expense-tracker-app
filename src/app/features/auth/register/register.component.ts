import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { SnackbarService } from '@app/core/services/snackbar.service';
import { UserService } from '@services/user.service';
import { SharedUiModule } from '@shared/shared-ui.module';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [SharedUiModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private snackbar = inject(SnackbarService);
  private userService = inject(UserService);

  form: FormGroup = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.snackbar.show('Please complete all fields correctly.');
      return;
    }

    const data = this.form.value;
    this.userService.register(data).subscribe({
      next: (res) => {
        if (!res.success || !res.data?.email) {
          this.snackbar.show('There was a problem with the registration.');
          return;
        }

        this.snackbar.show('Registration successful! Redirecting to login...');
        setTimeout(() => void this.router.navigateByUrl('/login'), 2000);
      },
      error: (err) => {
        if (err.status === 409) {
          this.snackbar.show('The email is already registered.');
        } else {
          this.snackbar.show('Error during registration. Please try again.');
        }
      },
    });
  }
}
