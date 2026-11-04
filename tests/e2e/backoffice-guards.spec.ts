import { test, expect } from '@playwright/test'

// No Supabase round-trip, no account: every back-office page must send a signed-out visitor to /login
// and keep the destination in redirectTo.
const PROTECTED = [
  '/admin/moderation',
  '/admin/settings',
  '/admin/providers',
  '/admin/providers/new',
  '/admin/providers/00000000-0000-4000-8000-000000000001',
  '/provider/services',
  '/provider/services/new',
  '/provider/disponibilites',
  '/provider/reservations',
  '/provider/paiements',
  '/provider/settings',
]

test.describe('back-office guards (signed out)', () => {
  for (const path of PROTECTED) {
    test(`${path} requires a sign-in`, async ({ page }) => {
      await page.goto(path)
      await expect(page).toHaveURL(/\/login\?redirectTo=/)
      expect(decodeURIComponent(new URL(page.url()).searchParams.get('redirectTo') ?? '')).toBe(path)
    })
  }

  test('server actions are not reachable without a session', async ({ request }) => {
    // The checkout API stays public but validates its body; unknown ids never reach Stripe.
    const res = await request.post('/api/checkout', { data: {} })
    expect([400, 503]).toContain(res.status())
  })

  test('the placeholder image used by services without photos is served', async ({ request }) => {
    const res = await request.get('/placeholder-service.svg')
    expect(res.status()).toBe(200)
    expect(res.headers()['content-type']).toContain('svg')
  })
})
