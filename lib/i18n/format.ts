// Dates, nombres, monnaies et durées dans la langue courante, via Intl. Aucun nom de mois ni de jour n'est écrit en dur.

export type Lang = 'fr' | 'en' | 'es'
export const toLang = (v: string): Lang => (v === 'en' || v === 'es' ? v : 'fr')

const INTL: Record<Lang, string> = { fr: 'fr-FR', en: 'en-GB', es: 'es-ES' }
export const intlLocale = (lang: Lang) => INTL[lang]

export function formatPriceIn(lang: Lang, cents: number, currency = 'EUR'): string {
  return new Intl.NumberFormat(INTL[lang], { style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(cents / 100)
}

/** « 90 min », « 2 h », « 1 h 30 » (fr : « 1h30 »), selon la langue. */
export function formatDurationIn(lang: Lang, minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (lang === 'fr') return m > 0 ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`
  return m > 0 ? `${h}h ${m}min` : `${h}h`
}

export function formatDateIn(lang: Lang, date: Date, options: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat(INTL[lang], options).format(date)
}

/** Nom du mois (0 = janvier) : « novembre », « November », « noviembre ». */
export function monthName(lang: Lang, month: number, style: 'long' | 'short' = 'long'): string {
  return new Intl.DateTimeFormat(INTL[lang], { month: style, timeZone: 'UTC' }).format(new Date(Date.UTC(2024, month, 15)))
}

/** Initiales des jours de la semaine, lundi en premier : L M M J V S D / M T W T F S S / L M X J V S D. */
export function weekdayInitials(lang: Lang): string[] {
  const fmt = new Intl.DateTimeFormat(INTL[lang], { weekday: 'narrow', timeZone: 'UTC' })
  // 1er janvier 2024 = lundi
  return Array.from({ length: 7 }, (_, i) => fmt.format(new Date(Date.UTC(2024, 0, 1 + i))))
}

/** Libellés abrégés des jours (Lun, Mon, lun…), dimanche = 0 comme Date#getDay. */
export function weekdayShort(lang: Lang, day: number): string {
  return new Intl.DateTimeFormat(INTL[lang], { weekday: 'short', timeZone: 'UTC' }).format(new Date(Date.UTC(2023, 0, 1 + day)))
}
