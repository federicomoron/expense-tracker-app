import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';

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
  categories = signal(EXPENSE_CATEGORIES);
  selectedCategory = signal('');

  private dialogRef = inject(MatDialogRef<CategorySelectorComponent>);

  chooseCategory(categoryKey: string): void {
    this.dialogRef.close(this.categories().find((c) => c.key === categoryKey) ?? undefined);
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
