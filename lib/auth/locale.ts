/** Path prefix of a locale with next-intl's "as-needed" strategy (fr is the unprefixed default). */
export function localePrefix(locale: string): string {
  return locale === 'en' || locale === 'es' ? `/${locale}` : ''
}
