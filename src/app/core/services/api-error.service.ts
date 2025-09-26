import { HttpContextToken, HttpErrorResponse } from '@angular/common/http';
import {
  inject,
  Injectable,
  Injector,
  runInInjectionContext,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { BackendError, ValidationErrorDetail } from '@models/api-error.model';
import { SnackbarService } from '@services/snackbar.service';

export const SKIP_ERROR_HANDLER = new HttpContextToken<boolean>(() => false);

@Injectable({
  providedIn: 'root',
})
export class ApiErrorService {
  public lastError: WritableSignal<string | null> = signal(null);

  private injector = inject(Injector);

  public lastErrorReadonly: Signal<string | null> = this.lastError;

  /**
   * Handles errors received from the backend and returns a translated version.
   * It can also automatically display the snack bar.
   */
  handleError(error: any, showSnackbar = true): string {
    return runInInjectionContext(this.injector, () => {
      const translate = inject(TranslateService);
      const snackBar = inject(SnackbarService);

      let message = 'error.unknown';

      if (error instanceof HttpErrorResponse) {
        const backendError = this.parseBackendError(error);
        message = this.translateError(backendError, translate);
      } else if (error?.type && error?.message) {
        message = this.translateError(error as BackendError, translate);
      } else if (error instanceof Error) {
        message = error.message || message;
      }

      this.lastError.set(message);

      if (showSnackbar) {
        snackBar.show(message);
      }

      return message;
    });
  }

  clearError(): void {
    this.lastError.set(null);
  }

  /** Convert HttpErrorResponse to BackendError format */
  private parseBackendError(error: HttpErrorResponse): BackendError {
    const type = error.status ? ApiErrorService.mapStatusToType(error.status) : 'UNKNOWN_ERROR';
    const body = error.error || {};
    return {
      type: body?.error?.type || type,
      message: body?.error?.message || error.message || 'error.unknown',
      details: body?.error?.details as { errors: ValidationErrorDetail[] } | undefined,
    };
  }

  /** Translates the message according to the type or message of the backend */
  private translateError(err: BackendError, translate: TranslateService): string {
    const translationKey = `error.${err.type.toLowerCase()}`;
    const translated = translate.instant(translationKey);

    if (translated !== translationKey) return translated;

    if (err.type === 'VALIDATION_ERROR' && err.details?.errors?.length) {
      const firstDetail = err.details.errors[0];
      return translate.instant('error.validation_detail', {
        field: firstDetail.property,
        message: firstDetail.messages.join(', '),
      });
    }

    return err.message || translate.instant('error.unknown');
  }

  /** Map HTTP codes to error types */
  private static mapStatusToType(statusCode: number): string {
    if (statusCode >= 500) return 'INTERNAL_SERVER_ERROR';
    if (statusCode === 422) return 'UNPROCESSABLE_ENTITY';
    if (statusCode === 409) return 'CONFLICT';
    if (statusCode === 404) return 'NOT_FOUND';
    if (statusCode === 401) return 'UNAUTHORIZED';
    if (statusCode === 403) return 'FORBIDDEN';
    if (statusCode === 400) return 'BAD_REQUEST';
    return 'UNKNOWN_ERROR';
  }
}
