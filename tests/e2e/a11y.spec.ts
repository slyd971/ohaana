import { test, expect, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

// Accessibilité (WCAG 2.2 AA) et mise en page mobile des pages publiques clés. Lance l'application locale :
//   PW_BASE_URL=http://localhost:3000 npx playwright test tests/e2e/a11y.spec.ts
// A11Y_SERVICE_PATH=/prestataires/<id> ajoute une fiche service (sinon la première de /search est utilisée).

const PAGES = ['/', '/search', '/concierge', '/login', '/register', '/about', '/terms', '/guadeloupe/chef-prive']

async function servicePath(page: Page): Promise<string | null> {
  if (process.env.A11Y_SERVICE_PATH) return process.env.A11Y_SERVICE_PATH
  await page.goto('/search')
  const href = await page.locator('a[href*="/prestataires/"]').first().getAttribute('href').catch(() => null)
  return href
}

async function scan(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze()
  return results.violations.map((v) => ({
    id: v.id,
    impact: v.impact,
    count: v.nodes.length,
    help: v.help,
    sample: v.nodes.slice(0, 2).map((n) => n.target.join(' ')),
  }))
}

test.describe('axe : aucune violation sérieuse ou critique', () => {
  for (const path of PAGES) {
    test(path, async ({ page }) => {
      await page.goto(path)
      await page.waitForLoadState('networkidle')
      const violations = await scan(page)
      const blocking = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')
      if (violations.length) console.log(path, JSON.stringify(violations, null, 1))
      expect(blocking, JSON.stringify(blocking, null, 1)).toEqual([])
    })
  }

  test('tunnel de réservation', async ({ page }) => {
    const path = await servicePath(page)
    test.skip(!path, 'aucune fiche publiée')
    await page.goto(path!.replace('/prestataires/', '/reserver/'))
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('navigation', { name: /étapes|steps|pasos/i })).toBeVisible()
    const violations = await scan(page)
    const blocking = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')
    if (violations.length) console.log('reserver', JSON.stringify(violations, null, 1))
    expect(blocking, JSON.stringify(blocking, null, 1)).toEqual([])
  })

  test('fiche service', async ({ page }) => {
    const path = await servicePath(page)
    test.skip(!path, 'aucune fiche publiée')
    await page.goto(path!)
    await page.waitForLoadState('networkidle')
    const violations = await scan(page)
    const blocking = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')
    if (violations.length) console.log(path, JSON.stringify(violations, null, 1))
    expect(blocking, JSON.stringify(blocking, null, 1)).toEqual([])
  })
})

test.describe('mobile : pas de défilement horizontal', () => {
  for (const width of [360, 390, 430]) {
    for (const path of PAGES) {
      test(`${width}px ${path}`, async ({ page }) => {
        await page.setViewportSize({ width, height: 800 })
        await page.goto(path)
        await page.waitForLoadState('networkidle')
        const overflow = await page.evaluate(() => {
          const w = document.documentElement.clientWidth
          const wide = [...document.querySelectorAll('body *')]
            .filter((el) => el.getBoundingClientRect().right > w + 1 && getComputedStyle(el).position !== 'fixed')
            .slice(0, 3)
            .map((el) => `${el.tagName.toLowerCase()}.${String(el.className).slice(0, 60)}`)
          return { scroll: document.documentElement.scrollWidth - w, wide }
        })
        expect(overflow.scroll, JSON.stringify(overflow)).toBeLessThanOrEqual(1)
      })
    }
  }
})
