export type ThemeOption = 'light' | 'dark' | 'system';

export function applyTheme(theme?: ThemeOption) {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const storedTheme = theme ?? (localStorage.getItem('theme') as ThemeOption) ?? 'system';
  const classList = document.documentElement.classList;

  classList.remove('dark-theme');

  if (storedTheme === 'dark' || (storedTheme === 'system' && prefersDark)) {
    classList.add('dark-theme');
  }
}
