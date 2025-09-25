import { Pipe, PipeTransform } from '@angular/core';

import { CURRENCY_SYMBOLS } from '@shared/helpers/currency-symbols';

@Pipe({
  name: 'currencySymbol',
  standalone: true,
})
export class CurrencySymbolPipe implements PipeTransform {
  transform(currencyCode: string): string {
    if (!currencyCode) return '';

    const upperCode = currencyCode.toUpperCase() as keyof typeof CURRENCY_SYMBOLS;
    const symbol = CURRENCY_SYMBOLS[upperCode] ?? upperCode;

    return `${symbol} `;
  }
}
