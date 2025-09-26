import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig, MatSnackBarRef } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class SnackbarService {
  private currentMessage: string | null = null;
  private currentSnack: MatSnackBarRef<any> | null = null;

  constructor(private snackBar: MatSnackBar) {}

  show(message: string, duration: number = 3000): void {
    if (this.currentMessage === message) return;

    this.currentMessage = message;
    this.currentSnack?.dismiss();

    const config: MatSnackBarConfig = {
      duration,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['app-snackbar'],
    };

    this.currentSnack = this.snackBar.open(message, 'OK', config);

    this.currentSnack.afterDismissed().subscribe(() => {
      this.currentSnack = null;
      this.currentMessage = null;
    });
  }
}
