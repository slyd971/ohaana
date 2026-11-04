import { test, expect } from '@playwright/test'

// These tests need NO Supabase round-trip: they cover guards and client-side validation.
// The full sign-up → email confirmation → sign-in journey needs a mailbox: see tests/e2e/auth-full.spec.ts.

test.describe('route guards (signed out)', () => {
  for (const path of ['/admin/dashboard', '/provider/dashboard', '/partner/dashboard', '/concierge/dashboard', '/voyages', '/profile']) {
    test(`${path} redirects to /login with redirectTo`, async ({ page }) => {
      await page.goto(path)
      await expect(page).toHaveURL(/\/login\?redirectTo=/)
      expect(decodeURIComponent(new URL(page.url()).searchParams.get('redirectTo') ?? '')).toBe(path)
    })
  }

  test('locale prefix is kept on redirect', async ({ page }) => {
    await page.goto('/en/admin/dashboard')
    await expect(page).toHaveURL(/\/en\/login\?redirectTo=/)
  })

  test('public pages stay public', async ({ page }) => {
    for (const path of ['/', '/search', '/login', '/register', '/reset-password']) {
      const res = await page.goto(path)
      expect(res?.status(), path).toBe(200)
    }
  })

  test('demo login buttons are hidden outside demo mode', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByText('Accès démo')).toHaveCount(0)
  })
})

test.describe('login form', () => {
  test('shows validation errors without calling the network', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('button', { name: 'Se connecter', exact: true }).click()
    await expect(page.getByText('Ce champ est obligatoire.').first()).toBeVisible()

    await page.getByLabel('Adresse email').fill('not-an-email')
    await page.getByLabel('Mot de passe').fill('x')
    await page.getByRole('button', { name: 'Se connecter', exact: true }).click()
    await expect(page.getByText('Adresse email invalide.')).toBeVisible()
  })

  test('can switch to the magic-link mode', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('button', { name: 'Recevoir un lien de connexion par email' }).click()
    await expect(page.getByRole('button', { name: 'Envoyer le lien de connexion' })).toBeVisible()
    await expect(page.getByLabel('Mot de passe')).toHaveCount(0)
  })

  test('is translated (en)', async ({ page }) => {
    await page.goto('/en/login')
    await expect(page.getByRole('heading', { name: 'Welcome back!' })).toBeVisible()
    await page.getByRole('button', { name: 'Sign In', exact: true }).click()
    await expect(page.getByText('This field is required.').first()).toBeVisible()
  })
})

test.describe('register form', () => {
  test('role → form → validation (terms, weak password)', async ({ page }) => {
    await page.goto('/register')
    await page.getByRole('radio', { name: /Prestataire/ }).click()
    await page.getByRole('button', { name: 'Continuer' }).click()

    await page.getByLabel('Nom complet').fill('Paul Test')
    await page.getByLabel('Adresse email').fill('paul@example.com')
    await page.getByLabel('Mot de passe').fill('abcdefgh')               // no digit
    await page.getByRole('button', { name: 'Créer un compte', exact: true }).click()
    await expect(page.getByText('Ajoutez au moins une lettre et un chiffre.')).toBeVisible()
    await expect(page.getByText('Vous devez accepter les conditions.')).toBeVisible()
  })

  test('?role=admin is dropped by the proxy', async ({ page }) => {
    await page.goto('/register?role=admin')
    await expect(page).not.toHaveURL(/role=admin/)
  })
})

test.describe('password reset', () => {
  test('validates the email', async ({ page }) => {
    await page.goto('/reset-password')
    await page.getByLabel('Adresse email').fill('nope')
    await page.getByRole('button', { name: 'Envoyer le lien' }).click()
    await expect(page.getByText('Adresse email invalide.')).toBeVisible()
  })

  test('update-password without a recovery session shows the expired-link state', async ({ page }) => {
    await page.goto('/update-password')
    await expect(page.getByText(/invalide ou a expiré/)).toBeVisible()
  })
})

test.describe('auth callback hardening', () => {
  test('open redirect via next= is neutralised', async ({ request, baseURL }) => {
    const res = await request.get('/api/auth/callback?next=//evil.example&code=bogus', { maxRedirects: 0 })
    expect(res.status()).toBe(307)
    const location = res.headers()['location'] ?? ''
    // The redirect must stay on the app's own origin (never on evil.example).
    expect(new URL(location, baseURL).host).toBe(new URL(baseURL ?? '').host)
    expect(location).toContain('/login?error=callback')
  })
})
