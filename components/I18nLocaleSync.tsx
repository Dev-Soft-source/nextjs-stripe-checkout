import { useEffect } from 'react';
import { useLocale } from '@/hooks/use-locale';
import i18next from '@/i18n/i18next';

/**
 * Keeps i18next and <html lang> aligned with the `[lng]` route segment.
 */
export function I18nLocaleSync() {
  const { lng } = useLocale();

  useEffect(() => {
    void i18next.changeLanguage(lng);
    document.documentElement.lang = lng;
  }, [lng]);

  return null;
}
