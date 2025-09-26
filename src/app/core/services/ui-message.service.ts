import { Injectable, inject } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig, MatSnackBarRef } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';

type MessageType = 'success' | 'error' | 'info' | 'warning';

@Injectable({ providedIn: 'root' })
export class UiMessageService {
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);

  private currentMessage: string | null = null;
  private currentSnack: MatSnackBarRef<any> | null = null;

  private readonly classes: Record<MessageType, string> = {
    success: 'snackbar-success',
    error: 'snackbar-error',
    info: 'snackbar-info',
    warning: 'snackbar-warning',
  };

  /**
   * Generic method to display any type of message.
   */
  show(message: string, type: MessageType = 'info', translate = true, config?: MatSnackBarConfig) {
    if (this.currentMessage === message) return;

    this.currentMessage = message;
    this.currentSnack?.dismiss();

    const defaultConfig: MatSnackBarConfig = {
      duration: this.getDuration(type),
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: [this.classes[type]],
      ...config,
    };

    this.currentSnack = this.snackBar.open(
      translate ? this.translate.instant(message) : message,
      this.translate.instant('common.close'),
      defaultConfig,
    );

    this.currentSnack.afterDismissed().subscribe(() => {
      this.currentSnack = null;
      this.currentMessage = null;
    });
  }

  /**
   * Specific helpers for each type of message.
   */
  showSuccess(message: string, translate = true, config?: MatSnackBarConfig) {
    this.show(message, 'success', translate, config);
  }

  showError(message: string, translate = true, config?: MatSnackBarConfig) {
    this.show(message, 'error', translate, config);
  }

  showInfo(message: string, translate = true, config?: MatSnackBarConfig) {
    this.show(message, 'info', translate, config);
  }

  showWarning(message: string, translate = true, config?: MatSnackBarConfig) {
    this.show(message, 'warning', translate, config);
  }

  /**
   * Configurable duration according to type.
   */
  private getDuration(type: MessageType): number {
    switch (type) {
      case 'success':
        return 2500;
      case 'error':
        return 3500;
      case 'warning':
        return 3000;
      default:
        return 2500;
    }
  }
}
