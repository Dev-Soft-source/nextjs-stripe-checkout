import { useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import { fallbackLng, isLocale, type Language } from '@/i18n/settings';

/**
 * Build the same URL with a different locale prefix (path segment after `/`).
 */
export function asPathForLocale(asPath: string, targetLng: Language): string {
  const [pathOnly, queryString] = asPath.split('?');
  const segments = pathOnly.split('/').filter(Boolean);
  if (segments.length >= 1 && isLocale(segments[0])) {
    segments[0] = targetLng;
    const next = '/' + segments.join('/');
    return queryString ? `${next}?${queryString}` : next;
  }
  if (pathOnly === '' || pathOnly === '/') {
    return `/${targetLng}`;
  }
  return `/${targetLng}${pathOnly}`;
}

export function useLocale() {
  const router = useRouter();

  const lng = useMemo(() => {
    const raw = router.query.lng;
    if (typeof raw === 'string' && isLocale(raw)) {
      return raw;
    }
    return fallbackLng;
  }, [router.query.lng]);

  const prefix = `/${lng}`;

  const pathForLocale = useCallback(
    (targetLng: Language) => asPathForLocale(router.asPath, targetLng),
    [router.asPath]
  );

  return { lng, prefix, pathForLocale };
}
