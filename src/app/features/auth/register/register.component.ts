import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

import { UserService } from '@app/core/services/user.service';
import { SharedUiModule } from '@app/shared/shared-ui.module';

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
  private snackBar = inject(MatSnackBar);
  private userService = inject(UserService);

  form: FormGroup = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.snackBar.open('Please complete all fields correctly.', 'Close', {
        duration: 3000,
      });
      return;
    }

    const data = this.form.value;
    this.userService.register(data).subscribe({
      next: (res) => {
        if (!res.success || !res.data?.email) {
          this.snackBar.open(
            'There was a problem with the registration.',
            'Close',
            {
              duration: 3000,
            }
          );
          return;
        }

        this.snackBar.open(
          'Registration successful! Redirecting to login...',
          'Close',
          {
            duration: 3000,
          }
        );
        setTimeout(() => this.router.navigateByUrl('/login'), 2000);
      },
      error: (err) => {
        if (err.status === 409) {
          this.snackBar.open('The email is already registered.', 'Close', {
            duration: 3000,
          });
        } else {
          this.snackBar.open(
            'Error during registration. Please try again.',
            'Close',
            {
              duration: 3000,
            }
          );
        }
      },
    });
  }
}
