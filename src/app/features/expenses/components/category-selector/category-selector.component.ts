import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { SharedUiModule } from '@app/shared/shared-ui.module';
import { CurrencySelectorComponent } from '../currency-selector/currency-selector.component';

@Component({
  standalone: true,
  selector: 'app-category-selector',
  imports: [SharedUiModule, CommonModule],
  templateUrl: './category-selector.component.html',
  styleUrls: ['./category-selector.component.scss'],
})
export class CategorySelectorComponent {
  private dialogRef = inject(MatDialogRef<CurrencySelectorComponent>);

  categories = signal(['Food', 'Water', 'Rent']);

  selectedCategory = signal('');

  chooseCategory(category: string): void {
    this.dialogRef.close(category);
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
