import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'monthName',
  standalone: true,
})
export class MonthNamePipe implements PipeTransform {
  constructor(private translate: TranslateService) {}

  transform(monthIndex: number, mode: 'short' | 'full' = 'short'): string {
    if (monthIndex === null || monthIndex < 0 || monthIndex > 11) return '';

    const key = monthIndex.toString();
    const path = mode === 'full' ? `monthFull.${key}` : `month.${key}`;

    const translated = this.translate.instant(path);
    return translated || this.getFallback(monthIndex, mode);
  }

  private getFallback(index: number, mode: 'short' | 'full'): string {
    const short = [
      'JAN',
      'FEB',
      'MAR',
      'APR',
      'MAY',
      'JUN',
      'JUL',
      'AUG',
      'SEP',
      'OCT',
      'NOV',
      'DEC',
    ];
    const full = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    return mode === 'full' ? full[index] : short[index];
  }
}
