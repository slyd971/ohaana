import { test, expect } from '@playwright/test'
import { statusFromAccount } from '@/lib/stripe/connect-status'

// Fixtures follow the real Accounts v2 response seen in test mode (GET with include=configuration.merchant,requirements).
const entry = (awaiting: 'user' | 'stripe') => ({ awaiting_action_from: awaiting })
const account = (status: string, entries: ReturnType<typeof entry>[], extra: Record<string, unknown> = {}) => ({
  configuration: { merchant: { capabilities: { card_payments: { status } } } },
  requirements: { entries },
  ...extra,
})

test.describe('statusFromAccount', () => {
  test('a fresh account with 18 things to provide is "incomplete" and cannot take payments', () => {
    const s = statusFromAccount(account('restricted', Array.from({ length: 18 }, () => entry('user'))))
    expect(s).toEqual({ state: 'incomplete', ready: false, dueCount: 18 })
  })

  test('nothing left for the provider but not active yet = Stripe is verifying ("pending")', () => {
    const s = statusFromAccount(account('restricted', [entry('stripe'), entry('stripe')]))
    expect(s).toEqual({ state: 'pending', ready: false, dueCount: 0 })
  })

  test('card_payments active means ready', () => {
    const s = statusFromAccount(account('active', []))
    expect(s).toEqual({ state: 'active', ready: true, dueCount: 0 })
  })

  test('a missing requirement list never makes an account ready by itself', () => {
    expect(statusFromAccount({ configuration: { merchant: { capabilities: { card_payments: { status: 'restricted' } } } } }).ready).toBe(false)
    expect(statusFromAccount({}).ready).toBe(false)
    expect(statusFromAccount({ configuration: null, requirements: null }).ready).toBe(false)
  })

  test('other card_payments statuses are not ready', () => {
    for (const status of ['pending', 'restricted', 'unsupported', '']) {
      expect(statusFromAccount(account(status, [])).ready, status).toBe(false)
    }
  })

  test('a closed account is closed, even if its capability says active', () => {
    expect(statusFromAccount(account('active', [], { closed: true }))).toEqual({ state: 'closed', ready: false, dueCount: 0 })
  })

  test('no account at all', () => {
    expect(statusFromAccount(null)).toEqual({ state: 'none', ready: false, dueCount: 0 })
    expect(statusFromAccount(undefined).state).toBe('none')
  })

  test('an active account can still list items to fill in later', () => {
    const s = statusFromAccount(account('active', [entry('user')]))
    expect(s).toEqual({ state: 'active', ready: true, dueCount: 1 })
  })
})
