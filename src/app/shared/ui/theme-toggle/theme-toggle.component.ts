import { Component, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { applyTheme, ThemeOption } from '@services/theme.service';

@Component({
  standalone: true,
  selector: 'theme-toggle',
  templateUrl: './theme-toggle.component.html',
  styleUrls: ['./theme-toggle.component.scss'],
  imports: [TranslateModule],
})
export class ThemeToggleComponent {
  public readonly options: ThemeOption[] = ['light', 'dark'];
  public readonly theme = signal<ThemeOption>(this.getInitialTheme());

  setTheme(option: ThemeOption): void {
    this.theme.set(option);
    localStorage.setItem('theme', option);
    applyTheme(option);
  }

  private getInitialTheme(): ThemeOption {
    return (localStorage.getItem('theme') as ThemeOption) ?? 'light';
  }
}
