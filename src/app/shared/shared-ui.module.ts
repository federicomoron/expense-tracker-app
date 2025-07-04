import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';

import { ExpDateButtonComponent } from './components/exp-date-button/exp-date-button.component';

@NgModule({
  imports: [
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    ExpDateButtonComponent,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  exports: [
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatSnackBarModule,
    MatSelectModule,
    MatSidenavModule,
    MatListModule,
    MatProgressSpinnerModule,
    ExpDateButtonComponent,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
})
export class SharedUiModule {}
