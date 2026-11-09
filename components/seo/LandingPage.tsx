import { ChevronRight } from 'lucide-react'
import { Link } from '@/lib/i18n/navigation'
import { ServiceCard } from '@/components/service/ServiceCard'
import { JsonLd } from '@/components/seo/JsonLd'
import { absolute, breadcrumbJsonLd, faqJsonLd, type SeoLocale } from '@/lib/seo'
import type { ServiceView } from '@/lib/data/types'
import { CATEGORIES, ISLANDS, type CategoryInfo, type IslandInfo } from '@/lib/seo/editorial'
import { filterServices, targetPath } from '@/lib/seo/catalogue'
import type { LandingContent } from '@/lib/seo/landing'

const UI = {
  fr: { home: 'Accueil', services: 'Les services', none: 'Aucun service n’est encore disponible ici.', all: 'Voir tous les services', others: 'Autres services', elsewhere: 'Le même service ailleurs', faq: 'Questions fréquentes', islands: 'Autres îles' },
  en: { home: 'Home', services: 'Services', none: 'No service is available here yet.', all: 'See all services', others: 'Other services', elsewhere: 'The same service elsewhere', faq: 'Frequently asked questions', islands: 'Other islands' },
  es: { home: 'Inicio', services: 'Servicios', none: 'Todavía no hay servicios disponibles aquí.', all: 'Ver todos los servicios', others: 'Otros servicios', elsewhere: 'El mismo servicio en otros lugares', faq: 'Preguntas frecuentes', islands: 'Otras islas' },
} as const

interface Props {
  locale: SeoLocale
  island: IslandInfo
  category: CategoryInfo | null
  content: LandingContent
  services: ServiceView[]
  /** Tout le catalogue, pour le maillage vers les pages voisines. */
  catalogue: ServiceView[]
}

export function LandingPage({ locale, island, category, content, services, catalogue }: Props) {
  const t = UI[locale]
  const crumbs = [
    { name: t.home, path: '/' },
    { name: island.name[locale], path: `/${island.slug}` },
    ...(category ? [{ name: category.head[locale], path: `/${island.slug}/${category.slug}` }] : []),
  ]

  // Maillage : pages voisines qui ont au moins un service (on ne pousse pas de lien vers une page vide).
  const sameIsland = CATEGORIES.filter((c) => c.slug !== category?.slug && filterServices(catalogue, island, c).length > 0)
  const otherIslands = ISLANDS.filter((i) => i.slug !== island.slug && filterServices(catalogue, i, category).length > 0)

  const pagePath = targetPath({ island, category })
  const nodes: Record<string, unknown>[] = [
    breadcrumbJsonLd(crumbs, locale),
    faqJsonLd(content.faq),
    {
      '@type': 'CollectionPage',
      name: content.h1,
      url: absolute(pagePath, locale),
      inLanguage: locale,
      ...(services.length
        ? {
            mainEntity: {
              '@type': 'ItemList',
              itemListElement: services.map((s, i) => ({ '@type': 'ListItem', position: i + 1, url: absolute(`/prestataires/${s.id}`, locale) })),
            },
          }
        : {}),
    },
  ]

  return (
    <div className="min-h-screen bg-coconut pt-20">
      <JsonLd nodes={nodes} />
      <div className="mx-auto max-w-6xl px-5 py-8 pb-24">
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex flex-wrap items-center gap-1 text-xs text-stone">
            {crumbs.map((c, i) => (
              <li key={c.path} className="flex items-center gap-1">
                {i > 0 && <ChevronRight size={12} aria-hidden />}
                {i < crumbs.length - 1 ? (
                  <Link href={c.path} className="hover:text-charcoal">{c.name}</Link>
                ) : (
                  <span aria-current="page" className="text-charcoal">{c.name}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>

        <h1 className="font-display text-3xl text-charcoal md:text-4xl">{content.h1}</h1>

        <div className="mt-5 max-w-3xl space-y-4 text-[15px] leading-relaxed text-charcoal-soft">
          {content.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
        </div>

        <section aria-labelledby="landing-services" className="mt-10">
          <h2 id="landing-services" className="mb-4 text-xl font-semibold text-charcoal">{t.services}</h2>
          {services.length === 0 ? (
            <p className="text-sm text-stone">{t.none}</p>
          ) : (
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((s) => (
                <li key={s.id}><ServiceCard service={s} /></li>
              ))}
            </ul>
          )}
          <Link href="/search" className="mt-6 inline-block text-sm font-medium text-deep-green underline underline-offset-4">{t.all}</Link>
        </section>

        {(sameIsland.length > 0 || otherIslands.length > 0) && (
          <nav aria-label={t.others} className="mt-12 grid gap-8 md:grid-cols-2">
            {sameIsland.length > 0 && (
              <div>
                <h2 className="mb-3 text-sm font-semibold text-charcoal">{t.others} {island.in[locale]}</h2>
                <ul className="flex flex-wrap gap-2">
                  {sameIsland.map((c) => (
                    <li key={c.slug}>
                      <Link href={`/${island.slug}/${c.slug}`} className="inline-block rounded-full border border-mist bg-surface px-3.5 py-1.5 text-xs text-charcoal hover:border-deep-green">{c.head[locale]}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {otherIslands.length > 0 && (
              <div>
                <h2 className="mb-3 text-sm font-semibold text-charcoal">{category ? t.elsewhere : t.islands}</h2>
                <ul className="flex flex-wrap gap-2">
                  {otherIslands.map((i) => (
                    <li key={i.slug}>
                      <Link href={category ? `/${i.slug}/${category.slug}` : `/${i.slug}`} className="inline-block rounded-full border border-mist bg-surface px-3.5 py-1.5 text-xs text-charcoal hover:border-deep-green">{i.name[locale]}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </nav>
        )}

        <section aria-labelledby="landing-faq" className="mt-12 max-w-3xl">
          <h2 id="landing-faq" className="mb-4 text-xl font-semibold text-charcoal">{t.faq}</h2>
          <div className="divide-y divide-mist rounded-card border border-mist bg-surface">
            {content.faq.map((f) => (
              <details key={f.q} className="group px-4 py-3">
                <summary className="cursor-pointer list-none text-sm font-medium text-charcoal">{f.q}</summary>
                <p className="mt-2 text-sm leading-relaxed text-charcoal-soft">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
