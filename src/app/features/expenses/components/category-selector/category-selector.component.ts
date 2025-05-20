import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

import { CurrencySelectorComponent } from '@features/expenses/components/currency-selector/currency-selector.component';
import { SharedUiModule } from '@shared/shared-ui.module';

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
