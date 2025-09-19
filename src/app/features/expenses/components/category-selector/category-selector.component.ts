import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';

import { CurrencySelectorComponent } from '@features/expenses/components/currency-selector/currency-selector.component';
import { EXPENSE_CATEGORIES } from '@shared/data/expense-categories';
import { SharedMaterialModule } from '@shared/shared-material.module';

@Component({
  standalone: true,
  selector: 'app-category-selector',
  imports: [SharedMaterialModule, CommonModule, TranslateModule],
  templateUrl: './category-selector.component.html',
  styleUrls: ['./category-selector.component.scss'],
})
export class CategorySelectorComponent {
  private dialogRef = inject(MatDialogRef<CurrencySelectorComponent>);

  categories = signal(EXPENSE_CATEGORIES);

  selectedCategory = signal('');

  chooseCategory(categoryKey: string): void {
    const category = this.categories().find((c) => c.key === categoryKey);
    if (category) {
      this.dialogRef.close(category);
    }
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
