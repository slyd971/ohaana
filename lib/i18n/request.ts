import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'

type Messages = { [key: string]: string | Messages }

/** Les clés manquantes dans une langue retombent sur le français (jamais d'affichage de « booking.pay » brut). */
function withFallback(base: Messages, override: Messages): Messages {
  const out: Messages = { ...base }
  for (const [k, v] of Object.entries(override)) {
    const b = base[k]
    out[k] = typeof v === 'object' && v !== null && typeof b === 'object' && b !== null ? withFallback(b as Messages, v as Messages) : v
  }
  return out
}

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale

  if (!locale || !routing.locales.includes(locale as 'fr' | 'en' | 'es')) {
    locale = routing.defaultLocale
  }

  const fr = (await import('../../messages/fr.json')).default as Messages
  const messages = locale === 'fr' ? fr : withFallback(fr, (await import(`../../messages/${locale}.json`)).default as Messages)

  return { locale, messages }
})
