import { Pipe, PipeTransform } from '@angular/core';

import { CURRENCY_SYMBOLS } from '../helpers/currency-symbols';

@Pipe({
  name: 'currencySymbol',
  standalone: true,
})
export class CurrencySymbolPipe implements PipeTransform {
  transform(currencyCode: string): string {
    const code = currencyCode.toUpperCase();

    if (code === 'USD') {
      return 'USD';
    }

    return CURRENCY_SYMBOLS[code] || code;
  }
}
