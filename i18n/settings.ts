export const fallbackLng = 'en' as const

/**
 * Supported locales: English (en) and Spanish (es).
 * This tuple is the single source of truth — proxy (i18n redirect), i18next, and
 * accept-language must use the derived `supportedLanguageList` below.
 */
export const languages = [fallbackLng, 'es'] as const

/**
 * Mutable `string[]` for libraries that expect a plain array (e.g. `accept-language`).
 * Always keep in sync with `languages` (same codes, same order).
 */
export const supportedLanguageList: string[] = [...languages]

export const defaultNS = 'translation' as const

export const cookieName = 'i18next' as const

export const headerName = 'x-i18next-current-language' as const

export type Language = (typeof languages)[number]

export function isLocale(code: string | undefined): code is Language {
  return (
    code !== undefined &&
    (languages as readonly string[]).includes(code)
  )
}
