import { AbstractControl, ValidationErrors } from '@angular/forms';

export function nonEmpty(control: AbstractControl): ValidationErrors | null {
  const value: string = control.value;
  if (value !== null && value !== undefined && value.toString().trim().length === 0) {
    return { nonEmpty: true };
  }
  return null;
}

export function validEmail(control: AbstractControl): ValidationErrors | null {
  const value: string = control.value;
  const emailRegex: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (value && !emailRegex.test(value)) {
    return { emailInvalid: true };
  }
  return null;
}

export function strongPassword(control: AbstractControl): ValidationErrors | null {
  const value: string = control.value;
  if (!value) return null;

  const hasUpperCase: boolean = /[A-Z]/.test(value);
  const hasLowerCase: boolean = /[a-z]/.test(value);
  const hasNumber: boolean = /\d/.test(value);
  const minLength: boolean = value.length >= 6;

  if (!hasUpperCase || !hasLowerCase || !hasNumber || !minLength) {
    return { weakPassword: true };
  }

  return null;
}
