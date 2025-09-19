import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Output } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';

import { SharedMaterialModule } from '@shared/shared-material.module';

@Component({
  standalone: true,
  selector: 'app-currency-selector',
  imports: [CommonModule, SharedMaterialModule, TranslateModule],
  templateUrl: './currency-selector.component.html',
  styleUrls: ['./currency-selector.component.scss'],
})
export class CurrencySelectorComponent {
  private dialogRef = inject(MatDialogRef<CurrencySelectorComponent>);
  currencies: ('USD' | 'ARS')[] = ['USD', 'ARS'];

  selectedCurrency: 'USD' | 'ARS' | null = null;

  @Output() selected = new EventEmitter<string>();

  chooseCurrency(currency: 'USD' | 'ARS') {
    this.selectedCurrency = currency;
    this.selected.emit(currency);
  }

  currencyDescription(currency: 'USD' | 'ARS'): string {
    const descriptions = {
      USD: 'United States Dollar',
      ARS: 'Argentine Peso',
    };
    return descriptions[currency] || 'Unknown Currency';
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
