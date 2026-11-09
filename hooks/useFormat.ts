'use client'

import { useMemo } from 'react'
import { useLocale } from 'next-intl'
import {
  formatDateIn, formatDurationIn, formatPriceIn, intlLocale, monthName, toLang, weekdayInitials, weekdayShort,
} from '@/lib/i18n/format'

/** Formatage lié à la langue de la page : prix, durée, dates, noms de mois et de jours. */
export function useFormat() {
  const lang = toLang(useLocale())
  return useMemo(
    () => ({
      lang,
      intl: intlLocale(lang),
      price: (cents: number) => formatPriceIn(lang, cents),
      duration: (minutes: number) => formatDurationIn(lang, minutes),
      date: (d: Date, options: Intl.DateTimeFormatOptions) => formatDateIn(lang, d, options),
      month: (m: number, style: 'long' | 'short' = 'long') => monthName(lang, m, style),
      weekdayInitials: () => weekdayInitials(lang),
      weekdayShort: (day: number) => weekdayShort(lang, day),
    }),
    [lang],
  )
}
