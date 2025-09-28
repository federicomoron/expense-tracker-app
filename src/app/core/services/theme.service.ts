export type ThemeOption = 'light' | 'dark';

export function applyTheme(theme?: ThemeOption) {
  const storedTheme = theme ?? (localStorage.getItem('theme') as ThemeOption) ?? 'light';
  const classList = document.documentElement.classList;

  classList.remove('dark-theme');

  if (storedTheme === 'dark') {
    classList.add('dark-theme');
  }

  localStorage.setItem('theme', storedTheme);
}
