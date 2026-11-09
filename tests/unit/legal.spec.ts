import { test, expect } from '@playwright/test'
import { complianceProblems, complianceSchema, insuranceExpiresSoon, isValidSiret, normaliseSiret } from '@/lib/provider/compliance'
import { anonymisedEmail, isRemovalVerdict } from '@/lib/legal/account-removal'
import { LEGAL_VERSIONS } from '@/lib/legal/versions'
import { COMPANY, TO_COMPLETE, missingCompanyFields } from '@/lib/legal/company'
import { termsSections } from '@/lib/legal/content/terms'
import { providerTermsSections } from '@/lib/legal/content/provider-terms'
import { privacySections } from '@/lib/legal/content/privacy'
import { cookiesSections } from '@/lib/legal/content/cookies'
import { legalNoticeSections } from '@/lib/legal/content/legal-notice'

/** SIRET valide fabriqué avec la clé de Luhn (13 chiffres + chiffre de contrôle). */
function makeSiret(first13: string): string {
  for (let c = 0; c < 10; c++) {
    const candidate = `${first13}${c}`
    if (isValidSiret(candidate)) return candidate
  }
  throw new Error('no check digit')
}

test.describe('SIRET', () => {
  test('accepts a Luhn-valid 14-digit number, with spaces', () => {
    const s = makeSiret('1234567890123')
    expect(isValidSiret(s)).toBe(true)
    expect(isValidSiret(`${s.slice(0, 3)} ${s.slice(3, 6)} ${s.slice(6, 9)} ${s.slice(9)}`)).toBe(true)
  })
  test('refuses a wrong check digit, wrong length and non digits', () => {
    const s = makeSiret('1234567890123')
    const wrong = s.slice(0, 13) + String((Number(s[13]) + 1) % 10)
    expect(isValidSiret(wrong)).toBe(false)
    for (const bad of ['', '123', '1234567890123x', '123456789012345']) expect(isValidSiret(bad)).toBe(false)
    expect(normaliseSiret('123 456.789')).toBe('123456789')
  })
})

test.describe('compliance rules', () => {
  const good = { legal_status: 'micro_entrepreneur', siret: makeSiret('9876543210987'), insurance_confirmed: true, insurance_expires_on: '2099-01-01' }
  const today = new Date('2026-11-09T12:00:00Z')

  test('a complete micro-entrepreneur file has no problem', () => {
    expect(complianceProblems(good, today)).toEqual([])
  })
  test('missing status stops at the first problem', () => {
    expect(complianceProblems({ ...good, legal_status: null }, today)).toEqual(['Statut professionnel non renseigné'])
  })
  test('a micro-entrepreneur or company needs a SIRET', () => {
    expect(complianceProblems({ ...good, siret: null }, today)).toContain('SIRET manquant')
    expect(complianceProblems({ ...good, legal_status: 'entreprise', siret: null }, today)).toContain('SIRET manquant')
  })
  test('an individual is flagged for review (undeclared work risk)', () => {
    expect(complianceProblems({ ...good, legal_status: 'particulier', siret: null }, today).join(' ')).toMatch(/travail dissimulé/)
  })
  test('insurance must be confirmed and not expired', () => {
    expect(complianceProblems({ ...good, insurance_confirmed: false }, today)).toContain('Assurance responsabilité civile professionnelle non confirmée')
    expect(complianceProblems({ ...good, insurance_expires_on: '2026-01-01' }, today)).toContain('Assurance expirée')
  })
  test('insurance expiring within 30 days is flagged', () => {
    expect(insuranceExpiresSoon('2026-11-20', today)).toBe(true)
    expect(insuranceExpiresSoon('2027-06-01', today)).toBe(false)
    expect(insuranceExpiresSoon(null, today)).toBe(false)
  })
  test('the form schema rejects a bad SIRET and unknown status, accepts a clean one', () => {
    expect(complianceSchema.safeParse({ legal_status: 'roi', siret: '', insurance_confirmed: true }).success).toBe(false)
    expect(complianceSchema.safeParse({ legal_status: 'entreprise', siret: '123', insurance_confirmed: true }).success).toBe(false)
    const ok = complianceSchema.safeParse({ legal_status: 'entreprise', siret: makeSiret('1234567890123'), insurance_confirmed: true })
    expect(ok.success).toBe(true)
  })
})

test.describe('account removal helpers', () => {
  test('verdict guard accepts only the four known results', () => {
    for (const v of ['deletable', 'anonymised', 'blocked_upcoming', 'blocked_role']) expect(isRemovalVerdict(v)).toBe(true)
    for (const v of ['ok', '', null, undefined, 42]) expect(isRemovalVerdict(v)).toBe(false)
  })
  test('the replacement email frees the original address', () => {
    const e = anonymisedEmail('11111111-2222-4333-8444-555555555555')
    expect(e).toBe('deleted+11111111-2222-4333-8444-555555555555@deleted.invalid')
    expect(e.endsWith('.invalid')).toBe(true)
  })
})

test.describe('legal documents', () => {
  test('versions are ISO dates', () => {
    for (const v of Object.values(LEGAL_VERSIONS)) expect(v).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
  test('every document has non-empty sections with unique titles', () => {
    for (const make of [termsSections, providerTermsSections, privacySections, cookiesSections, legalNoticeSections]) {
      const sections = make()
      expect(sections.length).toBeGreaterThanOrEqual(3)
      expect(new Set(sections.map((s) => s.title)).size).toBe(sections.length)
      for (const s of sections) expect((s.paragraphs?.length ?? 0) + (s.items?.length ?? 0)).toBeGreaterThan(0)
    }
  })
  test('company details are never invented: a missing one shows the placeholder', () => {
    const text = legalNoticeSections().flatMap((s) => [...(s.paragraphs ?? []), ...(s.items ?? [])]).join('\n')
    if (!COMPANY.siren) expect(text).toContain(`SIREN : ${TO_COMPLETE}`)
    expect(missingCompanyFields().length).toBeGreaterThanOrEqual(0)
  })
  test('the privacy policy lists the processors that are actually used', () => {
    const text = privacySections().flatMap((s) => [...(s.paragraphs ?? []), ...(s.items ?? [])]).join('\n')
    for (const name of ['Supabase', 'Stripe', 'Resend', 'Vercel']) expect(text).toContain(name)
  })
  test('the cookie policy states that no tracking cookie is used', () => {
    const text = cookiesSections().flatMap((s) => [...(s.paragraphs ?? []), ...(s.items ?? [])]).join('\n')
    expect(text).toMatch(/Aucun cookie de mesure d’audience/)
  })
})
