import { test, expect } from '@playwright/test'
import { buildDirectChargeIntent, isStripeAccountId, type DirectChargeInput } from '@/lib/stripe/direct-charge'
import { computeCommission } from '@/lib/utils'

const base: DirectChargeInput = {
  amountCents: 10000,
  platformFeeCents: 2000,
  providerAccountId: 'acct_1ABCdef',
  bookingId: 'b-1',
  serviceId: 's-1',
  touristId: 't-1',
  title: 'Dîner de chef',
}

test.describe('direct charge intent', () => {
  test('charges the traveller the displayed price and keeps the commission as application fee', () => {
    const { params, options } = buildDirectChargeIntent(base)
    expect(params.amount).toBe(10000)
    expect(params.application_fee_amount).toBe(2000)
    expect(options.stripeAccount).toBe('acct_1ABCdef')
    expect(options.idempotencyKey).toBe('booking-b-1')
  })

  test('the fee matches the configured commission', () => {
    const { platformFee } = computeCommission(10000, 20)
    expect(buildDirectChargeIntent({ ...base, platformFeeCents: platformFee }).params.application_fee_amount).toBe(2000)
  })

  test('a 0 % commission sends no application fee', () => {
    expect('application_fee_amount' in buildDirectChargeIntent({ ...base, platformFeeCents: 0 }).params).toBe(false)
  })

  test('refuses a fee that is not smaller than the amount, a negative one, or a bad amount', () => {
    expect(() => buildDirectChargeIntent({ ...base, platformFeeCents: 10000 })).toThrow('invalid_platform_fee')
    expect(() => buildDirectChargeIntent({ ...base, platformFeeCents: -1 })).toThrow('invalid_platform_fee')
    expect(() => buildDirectChargeIntent({ ...base, amountCents: 0, platformFeeCents: 0 })).toThrow('invalid_amount')
    expect(() => buildDirectChargeIntent({ ...base, amountCents: 99.5 })).toThrow('invalid_amount')
  })

  test('refuses anything that is not a connected account id', () => {
    for (const bad of ['', 'cus_123', 'acct_', 'acct_1 ABC', 'acct_1ABC/../x']) {
      expect(() => buildDirectChargeIntent({ ...base, providerAccountId: bad }), bad).toThrow('invalid_provider_account')
    }
    expect(isStripeAccountId('acct_1ABCdef')).toBe(true)
    expect(isStripeAccountId(undefined)).toBe(false)
  })
})
