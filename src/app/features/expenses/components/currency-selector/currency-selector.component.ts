import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
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
  selectedCurrency = signal<'USD' | 'ARS' | null>(null);

  private readonly dialogRef = inject(MatDialogRef<CurrencySelectorComponent>);

  currencies = ['USD', 'ARS'] as const;

  @Output() selected = new EventEmitter<'USD' | 'ARS'>();

  chooseCurrency(currency: 'USD' | 'ARS'): void {
    this.selectedCurrency.set(currency);
    this.selected.emit(currency);
  }

  currencyDescription(currency: 'USD' | 'ARS'): string {
    return currency === 'USD'
      ? 'United States Dollar'
      : currency === 'ARS'
        ? 'Argentine Peso'
        : 'Unknown Currency';
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
