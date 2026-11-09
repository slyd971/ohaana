import { test, expect } from '@playwright/test'
import {
  bookingCancelled,
  bookingConfirmedTourist,
  bookingNewProvider,
  bookingReminder,
  leadConfirmation,
  providerApproved,
  providerSuspended,
  reviewRequest,
  toLang,
  type BookingMail,
  type Lang,
} from '@/lib/email/templates'
import { hashLeadToken, isLeadToken, newLeadToken } from '@/lib/email/lead-token'
import { refundSentence } from '@/lib/email/events'

const LANGS: Lang[] = ['fr', 'en', 'es']
const base = (lang: Lang): BookingMail => ({
  lang,
  recipientName: 'Camille Dupont',
  serviceTitle: 'Dîner de chef <script>alert(1)</script>',
  when: 'samedi 14 novembre 2026, 19:00',
  guests: 4,
  total: '320,00 €',
  url: 'https://www.ohaana.fr/voyages',
  counterpart: 'Marie',
})

test.describe('email templates', () => {
  for (const lang of LANGS) {
    test(`[${lang}] every booking template has subject, html and text, with the service and the link`, () => {
      const mails = [
        bookingConfirmedTourist(base(lang)),
        bookingNewProvider(base(lang)),
        bookingReminder(base(lang)),
        reviewRequest(base(lang)),
        bookingCancelled({ ...base(lang), by: 'provider', recipient: 'tourist', refundLine: 'Remboursé.' }),
        bookingCancelled({ ...base(lang), by: 'tourist', recipient: 'provider' }),
      ]
      for (const m of mails) {
        expect(m.subject.length).toBeGreaterThan(5)
        expect(m.html).toContain(`<html lang="${lang}"`)
        expect(m.html).toContain('https://www.ohaana.fr/voyages')
        expect(m.text).toContain('https://www.ohaana.fr/voyages')
        expect(m.text).toContain('Dîner de chef')
      }
    })

    test(`[${lang}] provider and lead templates render`, () => {
      expect(providerApproved({ lang, name: 'Marie', url: 'https://www.ohaana.fr/provider/paiements' }).html).toContain('Marie')
      expect(providerSuspended({ lang, contactUrl: 'https://www.ohaana.fr/concierge' }).subject.length).toBeGreaterThan(5)
      const lead = leadConfirmation({ lang, confirmUrl: 'https://www.ohaana.fr/api/leads/confirm?token=x', unsubscribeUrl: 'https://www.ohaana.fr/api/leads/confirm?action=unsubscribe' })
      expect(lead.text).toContain('confirm?token=x')
      expect(lead.text).toContain('unsubscribe')
    })
  }

  test('user-controlled text is escaped in the HTML', () => {
    const m = bookingConfirmedTourist(base('fr'))
    expect(m.html).not.toContain('<script>')
    expect(m.html).toContain('&lt;script&gt;')
  })

  test('a link that is not http(s) is neutralised', () => {
    const m = bookingConfirmedTourist({ ...base('fr'), url: 'javascript:alert(1)' })
    expect(m.html).not.toContain('javascript:')
    expect(m.text).not.toContain('javascript:')
  })

  test('the greeting uses the first name only, and tolerates a missing name', () => {
    expect(bookingConfirmedTourist(base('en')).text).toContain('Hello Camille,')
    expect(bookingConfirmedTourist({ ...base('es'), recipientName: null }).text).toContain('Hola,')
  })

  test('the provider mail never shows the traveller beyond a first name', () => {
    const m = bookingNewProvider(base('fr'))
    expect(m.text).toContain('Marie')
    expect(m.text).not.toContain('@')
  })

  test('an unknown language falls back to French', () => {
    expect(toLang('de')).toBe('fr')
    expect(toLang(null)).toBe('fr')
    expect(toLang('es')).toBe('es')
  })

  test('refund sentences exist in every language, with the amount', () => {
    const s = refundSentence('refunded', 12000)
    for (const lang of LANGS) expect(s?.[lang]).toMatch(/120/)
    expect(refundSentence('none')).toBeUndefined()
    expect(refundSentence('pending')?.fr).toContain('traitement')
  })
})

test.describe('lead token', () => {
  test('is 64 hex characters and only its hash is derivable', () => {
    const { token, hash } = newLeadToken()
    expect(isLeadToken(token)).toBe(true)
    expect(hash).toBe(hashLeadToken(token))
    expect(hash).not.toBe(token)
    expect(hash).toHaveLength(64)
  })
  test('two tokens never collide and malformed ones are refused', () => {
    expect(newLeadToken().token).not.toBe(newLeadToken().token)
    for (const bad of ['', 'abc', 'Z'.repeat(64), null, undefined, 42]) expect(isLeadToken(bad)).toBe(false)
  })
})
