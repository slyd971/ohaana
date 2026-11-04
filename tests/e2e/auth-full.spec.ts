import { test, expect } from '@playwright/test'

// Full journey against a real Supabase project with a catch-all mailbox.
// Enable with:  E2E_FULL=1 E2E_TEST_EMAIL=... E2E_TEST_PASSWORD=...  npx playwright test auth-full
// The account must already exist and be confirmed (create it once through /register + the email link).
test.skip(!process.env.E2E_FULL, 'needs a real Supabase project and a confirmed test account')

test('sign in with email + password, see the user menu, sign out', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('Adresse email').fill(process.env.E2E_TEST_EMAIL ?? '')
  await page.getByLabel('Mot de passe').fill(process.env.E2E_TEST_PASSWORD ?? '')
  await page.getByRole('button', { name: 'Se connecter', exact: true }).click()

  await expect(page).not.toHaveURL(/\/login/)
  await page.goto('/')
  await page.getByRole('button', { name: 'Mon compte' }).click()
  await page.getByRole('menuitem', { name: 'Se déconnecter' }).click()
  await expect(page.getByRole('link', { name: /Se connecter/ })).toBeVisible()
})

test('wrong password shows a generic error', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('Adresse email').fill('nobody@example.com')
  await page.getByLabel('Mot de passe').fill('WrongPassword1')
  await page.getByRole('button', { name: 'Se connecter', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('Email ou mot de passe incorrect.')
})
