import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['fr', 'en', 'es'],
  defaultLocale: 'fr',
  localePrefix: 'as-needed', // / = fr (default), /en = English
  localeDetection: false,    // never redirect based on browser language
})
