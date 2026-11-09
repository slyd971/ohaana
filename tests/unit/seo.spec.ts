import { test, expect } from '@playwright/test'
import { absolute, breadcrumbJsonLd, buildMetadata, faqJsonLd, jsonLdString, languageAlternates, localizedPath } from '@/lib/seo'
import { CATEGORIES, ISLANDS } from '@/lib/seo/editorial'
import { buildLanding, MIN_SERVICES_TO_INDEX } from '@/lib/seo/landing'
import { indexableTargets, landingTarget, targetPath } from '@/lib/seo/catalogue'
import type { ServiceView } from '@/lib/data/types'

const words = (s: string) => s.trim().split(/\s+/).length
const LOCALES = ['fr', 'en', 'es'] as const

const svc = (id: string, island: string, category_slug: string, over: Partial<ServiceView> = {}) =>
  ({ id, island, category_slug, price_cents: 8000, updated_at: '2026-10-01T10:00:00Z', ...over }) as unknown as ServiceView

test.describe('URLs and alternates', () => {
  test('locale prefix follows next-intl as-needed', () => {
    expect(localizedPath('/', 'fr')).toBe('/')
    expect(localizedPath('/', 'en')).toBe('/en')
    expect(localizedPath('/about', 'es')).toBe('/es/about')
    expect(absolute('/guadeloupe/chef-prive', 'en')).toMatch(/\/en\/guadeloupe\/chef-prive$/)
  })

  test('hreflang covers fr/en/es plus x-default (french)', () => {
    const l = languageAlternates('/about')
    expect(Object.keys(l).sort()).toEqual(['en', 'es', 'fr', 'x-default'])
    expect(l['x-default']).toBe(l.fr)
  })

  test('buildMetadata is self-canonical with alternates, og and twitter', () => {
    const m = buildMetadata({ title: 'T', description: 'D', path: '/about', locale: 'en' })
    expect(m.alternates?.canonical).toMatch(/\/en\/about$/)
    expect(Object.keys(m.alternates?.languages ?? {})).toHaveLength(4)
    expect(m.openGraph).toBeTruthy()
    expect(m.twitter).toBeTruthy()
  })

  test('noindex pages ask for noindex,nofollow, and long descriptions are trimmed', () => {
    const m = buildMetadata({ title: 'T', description: 'x'.repeat(400), path: '/s', locale: 'fr', noindex: true })
    expect(m.robots).toEqual({ index: false, follow: false })
    expect((m.description ?? '').length).toBeLessThanOrEqual(160)
  })
})

test.describe('JSON-LD', () => {
  test('script-closing text cannot escape the tag', () => {
    expect(jsonLdString({ a: '</script><script>alert(1)</script>' })).not.toContain('</script>')
  })
  test('breadcrumb positions are sequential, FAQ has questions', () => {
    const b = breadcrumbJsonLd([{ name: 'A', path: '/' }, { name: 'B', path: '/guadeloupe' }], 'fr')
    expect(b.itemListElement.map((i) => i.position)).toEqual([1, 2])
    expect(faqJsonLd([{ q: 'Q', a: 'A' }]).mainEntity).toHaveLength(1)
  })
})

test.describe('programmatic landing content', () => {
  for (const locale of LOCALES) {
    test(`[${locale}] every island/category page has 150-300 words, a unique H1 and 4 FAQ`, () => {
      const h1s = new Set<string>()
      for (const island of ISLANDS) {
        for (const category of CATEGORIES) {
          const c = buildLanding({ locale, island, category, count: 4, minPrice: '80 €' })
          const n = words(c.paragraphs.join(' '))
          expect(n, `${island.slug}/${category.slug}`).toBeGreaterThanOrEqual(150)
          expect(n, `${island.slug}/${category.slug}`).toBeLessThanOrEqual(300)
          expect(c.faq).toHaveLength(4)
          h1s.add(c.h1)
        }
      }
      expect(h1s.size).toBe(ISLANDS.length * CATEGORIES.length)
    })

    test(`[${locale}] island pages have enough text and no invented figures when empty`, () => {
      for (const island of ISLANDS) {
        const c = buildLanding({ locale, island, count: 5, minPrice: '60 €', categoryNames: ['A', 'B'] })
        expect(words(c.paragraphs.join(' '))).toBeGreaterThanOrEqual(120)
        const empty = buildLanding({ locale, island, count: 0 })
        expect(empty.paragraphs.join(' ')).not.toMatch(/\d+ (service|servicio)/i)
      }
    })
  }

  test('prices come from the data only', () => {
    const island = ISLANDS[0]
    const category = CATEGORIES[0]
    expect(buildLanding({ locale: 'fr', island, category, count: 3, minPrice: '95 €' }).description).toContain('95 €')
    expect(buildLanding({ locale: 'fr', island, category, count: 3, minPrice: null }).description).not.toMatch(/€/)
  })
})

test.describe('indexation threshold', () => {
  const [gp, mq] = [ISLANDS[0], ISLANDS[1]]
  const chef = CATEGORIES[0]
  const catalogue = [
    svc('1', gp.db, chef.dbSlug), svc('2', gp.db, chef.dbSlug), svc('3', gp.db, chef.dbSlug, { updated_at: '2026-11-01T00:00:00Z' }),
    svc('4', mq.db, chef.dbSlug), svc('5', mq.db, 'massage'),
  ]

  test(`needs at least ${MIN_SERVICES_TO_INDEX} services`, () => {
    expect(landingTarget(catalogue, gp, chef).indexable).toBe(true)
    expect(landingTarget(catalogue, mq, chef).indexable).toBe(false)
  })

  test('the sitemap list contains only indexable pages with their real modification date', () => {
    const t = indexableTargets(catalogue)
    expect(t.map(targetPath)).toEqual(['/guadeloupe', '/guadeloupe/chef-prive'])
    expect(t[1].updatedAt).toBe('2026-11-01T00:00:00Z')
  })
})
