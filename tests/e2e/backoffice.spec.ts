import { test, expect, type Browser, type BrowserContext, type Page } from '@playwright/test'

// Full back-office journey against the REAL Supabase project of .env.local, with two dedicated test accounts:
//   provider creates a service  ->  submission is refused without 3 photos  ->  uploads 3 photos
//   ->  submits  ->  admin refuses with a reason  ->  provider sees it and resubmits
//   ->  admin publishes  ->  an anonymous visitor can open the service  ->  provider archives it (cleanup).
//
// Enable with the variables of .env.e2e.example (E2E_BACKOFFICE=1 + 4 credentials):
//   PW_BASE_URL=http://localhost:3000 npx playwright test backoffice
const creds = {
  adminEmail: process.env.E2E_ADMIN_EMAIL ?? '',
  adminPassword: process.env.E2E_ADMIN_PASSWORD ?? '',
  providerEmail: process.env.E2E_PROVIDER_EMAIL ?? '',
  providerPassword: process.env.E2E_PROVIDER_PASSWORD ?? '',
}
test.skip(
  !process.env.E2E_BACKOFFICE || Object.values(creds).some((v) => !v),
  'needs E2E_BACKOFFICE=1 and the 4 test-account variables (see .env.e2e.example)',
)

// Smallest valid PNG: the browser re-encodes it to JPEG before the upload.
const PNG_1PX = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
)
const photos = [1, 2, 3].map((n) => ({ name: `e2e-${n}.png`, mimeType: 'image/png', buffer: PNG_1PX }))

const TITLE = `E2E service ${Date.now()}`
const REASON = 'E2E : photos à revoir'

async function signIn(page: Page, email: string, password: string) {
  await page.goto('/login')
  await page.getByLabel('Adresse email').fill(email)
  await page.getByLabel('Mot de passe').fill(password)
  await page.getByRole('button', { name: 'Se connecter', exact: true }).click()
  await expect(page).not.toHaveURL(/\/login/)
}

async function newSignedInContext(browser: Browser, email: string, password: string): Promise<{ ctx: BrowserContext; page: Page }> {
  const ctx = await browser.newContext()
  const page = await ctx.newPage()
  await signIn(page, email, password)
  return { ctx, page }
}

test.describe.serial('provider -> admin -> public', () => {
  test.setTimeout(90_000)

  let provider: { ctx: BrowserContext; page: Page }
  let admin: { ctx: BrowserContext; page: Page }
  let serviceId = ''

  test.beforeAll(async ({ browser }) => {
    provider = await newSignedInContext(browser, creds.providerEmail, creds.providerPassword)
    admin = await newSignedInContext(browser, creds.adminEmail, creds.adminPassword)
    provider.page.on('dialog', (d) => void d.accept())
  })

  test.afterAll(async () => {
    await provider?.ctx.close()
    await admin?.ctx.close()
  })

  test('the provider space only shows the provider\'s own services (regression)', async () => {
    const { page } = provider
    await page.goto('/provider/services')
    await expect(page.getByRole('heading', { name: 'Mes services' })).toBeVisible()
    // Seeded demo services belong to other providers and must never be listed here.
    await expect(page.getByText('Menu Créole Prestige')).toHaveCount(0)
  })

  test('provider creates a draft service and lands on its edit screen', async () => {
    const { page } = provider
    await page.goto('/provider/services/new')
    await page.getByLabel('Titre (français)').fill(TITLE)
    await page.getByLabel('Description (français)').fill('Service créé par le test automatique du back-office : menu en trois temps à domicile.')
    await page.getByLabel('Catégorie').selectOption({ label: 'Chef.fe privé.e' })
    await page.getByLabel('Prix (€)').fill('90')
    await page.getByLabel('Durée (minutes)').fill('120')
    await page.getByLabel('Participants minimum').fill('2')
    await page.getByLabel('Participants maximum').fill('6')
    await page.getByRole('button', { name: 'Créer le brouillon' }).click()

    await expect(page).toHaveURL(/\/provider\/services\/[0-9a-f-]{36}$/)
    serviceId = page.url().split('/').pop() ?? ''
    await expect(page.getByRole('heading', { name: 'Modifier le service' })).toBeVisible()
  })

  test('submission is refused until 3 photos are uploaded', async () => {
    const { page } = provider
    await page.goto('/provider/services')
    const card = page.getByRole('article').filter({ hasText: TITLE })
    await card.getByRole('button', { name: 'Soumettre à la relecture' }).click()
    await expect(card.getByText('3 photos minimum')).toBeVisible()
  })

  test('provider uploads 3 photos with a required description', async () => {
    const { page } = provider
    await page.goto(`/provider/services/${serviceId}`)
    // No description yet: the upload is rejected before any file leaves the browser.
    await page.locator('#new-photos').setInputFiles(photos[0])
    await expect(page.getByRole('alert').filter({ hasText: 'Décrivez d’abord la photo' })).toBeVisible()

    await page.getByLabel(/Description des prochaines photos/).fill('Photo du test automatique')
    await page.locator('#new-photos').setInputFiles(photos)
    await expect(page.getByText('3/10 photos')).toBeVisible({ timeout: 30_000 })
  })

  test('provider submits the service and generates availability', async () => {
    const { page } = provider
    await page.goto('/provider/services')
    const card = page.getByRole('article').filter({ hasText: TITLE })
    await card.getByRole('button', { name: 'Soumettre à la relecture' }).click()
    await expect(card.getByText('En relecture')).toBeVisible()

    await page.goto(`/provider/disponibilites?service=${serviceId}`)
    await page.getByRole('button', { name: 'Générer les créneaux' }).click()
    await expect(page.getByText(/créneaux ajoutés/)).toBeVisible()
  })

  test('admin refuses the service with a reason', async () => {
    const { page } = admin
    await page.goto('/admin/moderation')
    const card = page.getByRole('article').filter({ hasText: TITLE })
    await expect(card).toBeVisible()
    await card.getByRole('button', { name: 'Refuser…' }).click()
    await card.getByLabel(/Motif/).fill(REASON)
    await card.getByRole('button', { name: 'Confirmer le refus' }).click()
    await expect(card.getByText(/Fiche refusée/)).toBeVisible()
  })

  test('provider sees the refusal reason and resubmits', async () => {
    const { page } = provider
    await page.goto('/provider/services')
    const card = page.getByRole('article').filter({ hasText: TITLE })
    await expect(card.getByText('Refusé')).toBeVisible()
    await expect(card.getByText(REASON)).toBeVisible()
    await card.getByRole('button', { name: 'Soumettre à la relecture' }).click()
    await expect(card.getByText('En relecture')).toBeVisible()
  })

  test('admin publishes the service', async () => {
    const { page } = admin
    await page.goto('/admin/moderation')
    const card = page.getByRole('article').filter({ hasText: TITLE })
    await card.getByRole('button', { name: 'Publier' }).click()
    await expect(card.getByText('Fiche publiée.')).toBeVisible()
  })

  test('an anonymous visitor can open the published service', async ({ browser }) => {
    const ctx = await browser.newContext()
    const page = await ctx.newPage()
    const res = await page.goto(`/prestataires/${serviceId}`)
    expect(res?.status()).toBe(200)
    await expect(page.getByRole('heading', { name: TITLE }).first()).toBeVisible()
    await ctx.close()
  })

  test('cleanup: the provider archives the test service', async () => {
    const { page } = provider
    await page.goto('/provider/services')
    const card = page.getByRole('article').filter({ hasText: TITLE })
    await card.getByRole('button', { name: 'Archiver' }).click()
    await expect(card.getByText('Archivé')).toBeVisible()
  })
})
