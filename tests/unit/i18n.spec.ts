import { test, expect } from '@playwright/test'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { formatDurationIn, formatPriceIn, monthName, weekdayInitials, weekdayShort } from '@/lib/i18n/format'

type Json = { [k: string]: string | Json }
const load = (l: string): Json => JSON.parse(readFileSync(join(process.cwd(), 'messages', `${l}.json`), 'utf8'))
const flat = (o: Json, p = ''): Record<string, string> =>
  Object.entries(o).reduce<Record<string, string>>((acc, [k, v]) => {
    if (typeof v === 'string') acc[p + k] = v
    else Object.assign(acc, flat(v, `${p}${k}.`))
    return acc
  }, {})

const fr = flat(load('fr'))
const en = flat(load('en'))
const es = flat(load('es'))

/** Variables ICU d'un message : {name}, {count, plural, …} (premier mot) et balises <b>…</b>. */
const variables = (msg: string) =>
  [...new Set([...msg.matchAll(/\{\s*([A-Za-z0-9_]+)\s*[,}]/g)].map((m) => m[1]))].sort().join(',') +
  '|' + [...new Set([...msg.matchAll(/<\/?([a-z]+)>/g)].map((m) => m[1]))].sort().join(',')

test.describe('message files', () => {
  for (const [name, other] of [['en', en], ['es', es]] as const) {
    test(`[${name}] has exactly the keys of fr.json (run: python translate.py --input messages/fr.json --merge)`, () => {
      const missing = Object.keys(fr).filter((k) => !(k in other))
      const extra = Object.keys(other).filter((k) => !(k in fr))
      expect({ missing: missing.slice(0, 20), missingCount: missing.length, extra: extra.slice(0, 20) }).toEqual({ missing: [], missingCount: 0, extra: [] })
    })

    test(`[${name}] keeps the same variables and tags as French`, () => {
      const bad = Object.keys(fr).filter((k) => k in other && variables(fr[k]) !== variables(other[k]))
      expect(bad).toEqual([])
    })

    test(`[${name}] has no empty value`, () => {
      expect(Object.keys(other).filter((k) => !other[k].trim())).toEqual([])
    })
  }

  test('fr.json has no empty value', () => {
    expect(Object.keys(fr).filter((k) => !fr[k].trim())).toEqual([])
  })
})

/** Les pages du parcours de réservation ne doivent plus définir de traducteur « L(fr, en, es) » ni de noms de mois en dur. */
test.describe('no hard-coded locale tables in the booking journey', () => {
  const files = [
    'app/[locale]/(tourist)/_components/BookingClient.tsx',
    'app/[locale]/(tourist)/_components/SearchClient.tsx',
    'app/[locale]/(tourist)/voyages/page.tsx',
  ]
  for (const f of files) {
    test(f, () => {
      const src = readFileSync(join(process.cwd(), f), 'utf8')
      expect(src).not.toMatch(/MONTHS_FR|DAYS_FR/)
      expect(src).not.toMatch(/toLocaleDateString\('fr-FR'/)
      expect(src).not.toMatch(/window\.(alert|confirm)\(/)
    })
  }
})

test.describe('Intl helpers', () => {
  test('month names follow the language', () => {
    expect(monthName('fr', 10)).toBe('novembre')
    expect(monthName('en', 10)).toBe('November')
    expect(monthName('es', 10)).toBe('noviembre')
  })
  test('weekday initials start on Monday and follow the language', () => {
    expect(weekdayInitials('fr')).toHaveLength(7)
    expect(weekdayInitials('en')[0]).toBe('M')
    expect(weekdayInitials('es')[2].toLowerCase()).toBe('x')
    expect(weekdayShort('en', 0).toLowerCase()).toContain('sun')
  })
  test('prices and durations follow the language', () => {
    expect(formatPriceIn('fr', 12000)).toMatch(/120\s?€/)
    expect(formatPriceIn('en', 12000)).toMatch(/€120/)
    expect(formatDurationIn('fr', 90)).toBe('1h30')
    expect(formatDurationIn('en', 90)).toBe('1h 30min')
    expect(formatDurationIn('es', 45)).toBe('45 min')
  })
})

// Garde-fou : tous les fichiers de messages sont du JSON valide et sans clé dupliquée entre namespaces mal imbriqués.
test('messages directory only contains the three locale files', () => {
  expect(readdirSync(join(process.cwd(), 'messages')).filter((f) => statSync(join(process.cwd(), 'messages', f)).isFile()).sort()).toEqual(['en.json', 'es.json', 'fr.json'])
})
