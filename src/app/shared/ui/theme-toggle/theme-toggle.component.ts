import { Component, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

type ThemeOption = 'light' | 'dark' | 'system';

@Component({
  standalone: true,
  selector: 'theme-toggle',
  templateUrl: './theme-toggle.component.html',
  styleUrls: ['./theme-toggle.component.scss'],
  imports: [TranslateModule],
})
export class ThemeToggleComponent {
  options: ThemeOption[] = ['light', 'dark', 'system'];
  theme = signal<ThemeOption>(this.getInitialTheme());

  setTheme(option: ThemeOption) {
    this.theme.set(option);
    localStorage.setItem('theme', option);
    this.applyTheme(option);
  }

  private getInitialTheme(): ThemeOption {
    return (localStorage.getItem('theme') as ThemeOption) ?? 'system';
  }

  private applyTheme(theme: ThemeOption) {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const classList = document.documentElement.classList;

    classList.remove('dark-theme');

    if (theme === 'dark' || (theme === 'system' && prefersDark)) {
      classList.add('dark-theme');
    }
  }
}
