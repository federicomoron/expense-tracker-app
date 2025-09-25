import { Injectable, inject } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

@Injectable({ providedIn: 'root' })
export class DialogService {
  private readonly dialog = inject(MatDialog);

  openFullScreen<T, D = any>(component: T, data?: D): MatDialogRef<any> {
    const dialogRef = this.dialog.open(component as any, {
      width: '100vw',
      height: '100vh',
      maxWidth: '100vw',
      panelClass: 'full-screen-modal',
      data,
    });

    this.attachPopStateListener(dialogRef);
    return dialogRef;
  }

  openFixed<T, D = any>(component: T, width = '400px', data?: D): MatDialogRef<any> {
    const dialogRef = this.dialog.open(component as any, {
      width,
      data,
    });

    this.attachPopStateListener(dialogRef);
    return dialogRef;
  }

  private attachPopStateListener(dialogRef: MatDialogRef<any>) {
    const popStateListener = () => dialogRef.close();
    window.addEventListener('popstate', popStateListener);

    dialogRef.afterClosed().subscribe(() => {
      window.removeEventListener('popstate', popStateListener);
    });
  }
}
