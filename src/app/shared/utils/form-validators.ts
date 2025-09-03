import { AbstractControl, ValidationErrors } from '@angular/forms';

/**
 * Validator to check if a string is not only whitespace.
 * Example: "      " → invalid
 */
export function nonEmpty(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (value !== null && value !== undefined && value.toString().trim().length === 0) {
    return { nonEmpty: true };
  }
  return null;
}

/**
 * Validator to check if the email has a valid structure.
 * Example: "test@gmail.com" → valid
 */
export function validEmail(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return { emailInvalid: true };
  }
  return null;
}

/**
 * Validator to check if the password meets minimum requirements.
 * Must contain at least:
 * - 1 uppercase letter
 * - 1 lowercase letter
 * - 1 number
 * - 6 characters minimum
 */
export function strongPassword(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (!value) return null;

  const hasUpperCase = /[A-Z]/.test(value);
  const hasLowerCase = /[a-z]/.test(value);
  const hasNumber = /\d/.test(value);
  const minLength = value.length >= 6;

  if (!hasUpperCase || !hasLowerCase || !hasNumber || !minLength) {
    return { weakPassword: true };
  }

  return null;
}
