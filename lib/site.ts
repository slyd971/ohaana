// Single source of truth for the public site URL.
// Set NEXT_PUBLIC_SITE_URL per environment (no trailing slash).
const RAW = process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'https://www.ohaana.fr'

export const SITE_URL = RAW.replace(/\/+$/, '')

/** Absolute URL for a path, with the locale prefix (fr is the default and unprefixed). */
export function absoluteUrl(path: string, locale: 'fr' | 'en' | 'es' = 'fr'): string {
  const clean = path === '/' ? '' : path.startsWith('/') ? path : `/${path}`
  return locale === 'fr' ? `${SITE_URL}${clean || '/'}` : `${SITE_URL}/${locale}${clean}`
}

/**
 * WhatsApp number in international digits only. TEMPORARY default (+33 6 63 90 78 88) so the
 * buttons display during the demo; override with NEXT_PUBLIC_WHATSAPP_NUMBER (set it to an
 * empty string to hide the buttons).
 */
export const WHATSAPP_NUMBER = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '33663907888').replace(/\D/g, '')
