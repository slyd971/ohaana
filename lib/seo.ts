import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/site'
import { DEMO_MODE } from '@/lib/demo-mode'

// Source unique des balises SEO. Convention d'URL (next-intl, localePrefix "as-needed") : fr = « /chemin », en = « /en/chemin », es = « /es/chemin ».

export type SeoLocale = 'fr' | 'en' | 'es'
export const SEO_LOCALES: SeoLocale[] = ['fr', 'en', 'es']
export const toSeoLocale = (v: string): SeoLocale => (v === 'en' || v === 'es' ? v : 'fr')

const OG_LOCALE: Record<SeoLocale, string> = { fr: 'fr_FR', en: 'en_US', es: 'es_ES' }
export const DEFAULT_OG_IMAGE = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=630&fit=crop&q=85'

/** Chemin localisé, sans domaine. « / » devient « /en » pour l'anglais. */
export function localizedPath(path: string, locale: SeoLocale): string {
  const clean = path === '/' ? '' : path.startsWith('/') ? path : `/${path}`
  if (locale === 'fr') return clean || '/'
  return `/${locale}${clean}`
}

export const absolute = (path: string, locale: SeoLocale) => `${SITE_URL}${localizedPath(path, locale)}`

/** hreflang complet fr / en / es + x-default (le français). */
export function languageAlternates(path: string): Record<string, string> {
  return {
    fr: absolute(path, 'fr'),
    en: absolute(path, 'en'),
    es: absolute(path, 'es'),
    'x-default': absolute(path, 'fr'),
  }
}

/** Robots d'une page : jamais indexée en démo, ni si `noindex`. */
export function robotsFor(noindex?: boolean): NonNullable<Metadata['robots']> {
  return DEMO_MODE || noindex ? { index: false, follow: false } : { index: true, follow: true }
}

export interface SeoInput {
  title: string
  description: string
  /** Chemin sans langue, ex. « /about » ou « /guadeloupe/chef-prive ». */
  path: string
  locale: SeoLocale
  image?: { url: string; alt?: string; width?: number; height?: number }
  noindex?: boolean
  /** Titre sans le suffixe « | Ohaana ». */
  absoluteTitle?: boolean
  type?: 'website' | 'article'
}

export function buildMetadata(i: SeoInput): Metadata {
  const url = absolute(i.path, i.locale)
  const image = i.image ?? { url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: 'Ohaana' }
  const description = i.description.length > 160 ? `${i.description.slice(0, 157)}…` : i.description
  return {
    title: i.absoluteTitle ? { absolute: i.title } : i.title,
    description,
    alternates: { canonical: url, languages: languageAlternates(i.path) },
    robots: robotsFor(i.noindex),
    openGraph: {
      title: i.title,
      description,
      url,
      siteName: 'Ohaana',
      type: i.type ?? 'website',
      locale: OG_LOCALE[i.locale],
      alternateLocale: SEO_LOCALES.filter((l) => l !== i.locale).map((l) => OG_LOCALE[l]),
      images: [image],
    },
    twitter: { card: 'summary_large_image', title: i.title, description, images: [image.url] },
  }
}

/** Pages privées : jamais indexées, jamais suivies. */
export const PRIVATE_METADATA: Metadata = { robots: { index: false, follow: false } }

// ─── JSON-LD ─────────────────────────────────────────────────────────────────

/** Sérialisation sûre pour une balise <script> : « < » est échappé pour qu'un texte saisi ne puisse pas fermer la balise. */
export const jsonLdString = (data: unknown) => JSON.stringify(data).replace(/</g, '\\u003c')

export function breadcrumbJsonLd(items: { name: string; path: string }[], locale: SeoLocale) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, idx) => ({ '@type': 'ListItem', position: idx + 1, name: it.name, item: absolute(it.path, locale) })),
  }
}

export function faqJsonLd(items: { q: string; a: string }[]) {
  return {
    '@type': 'FAQPage',
    mainEntity: items.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  }
}

/** Liens officiels de l'organisation (sameAs), séparés par des virgules, dans NEXT_PUBLIC_SOCIAL_URLS. Vide tant qu'aucun compte n'existe. */
export function socialProfiles(): string[] {
  return (process.env.NEXT_PUBLIC_SOCIAL_URLS ?? '')
    .split(',')
    .map((u) => u.trim())
    .filter((u) => /^https:\/\//.test(u))
}
