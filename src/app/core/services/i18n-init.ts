import { I18nService } from '@services/i18n.service';

export function i18nInitializer(i18nService: I18nService): () => Promise<unknown> {
  return () => i18nService.ensureLoaded();
}
