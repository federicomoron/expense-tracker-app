import { I18nService } from './i18n.service';

export function i18nInitializer(i18nService: I18nService): () => void {
  return () => {
    const lang = localStorage.getItem('lang');
    if (lang) {
      i18nService.setLanguage(lang);
    }
  };
}
