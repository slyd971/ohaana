import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(cents: number, currency = 'EUR', locale = 'fr-FR'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100)
}

export function formatDuration(minutes: number, locale = 'fr'): string {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (locale === 'fr') return m > 0 ? `${h}h${m.toString().padStart(2, '0')}` : `${h}h`
  return m > 0 ? `${h}h ${m}min` : `${h}h`
}

export function formatRating(rating: number): string {
  return rating.toFixed(1)
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function buildUnsplashUrl(
  keyword: string,
  width = 800,
  height = 600
): string {
  return `https://images.unsplash.com/photo-1548574505-5e239809ee19?w=${width}&h=${height}&fit=crop&q=80&auto=format`
}

export const PLATFORM_FEE_PERCENT = 20

export function computeFees(totalCents: number): {
  platformFee: number
  providerAmount: number
} {
  const platformFee = Math.round(totalCents * (PLATFORM_FEE_PERCENT / 100))
  return { platformFee, providerAmount: totalCents - platformFee }
}
