import { test, expect } from '@playwright/test'
import {
  expectedRefundCents,
  refundCancelledBooking,
  remainingRefundCents,
  type BookingForRefund,
  type PaymentForRefund,
  type RefundDeps,
} from '@/lib/stripe/refund-logic'

// Pure logic with recorders instead of Stripe / Supabase. The percentage itself comes from the database
// (refund_percent + the service's cancellation policy), covered in supabase/tests/security.sql.

function setup(booking: BookingForRefund | null, payment: PaymentForRefund | null, opts: { recordFails?: boolean } = {}) {
  const created: { args: { paymentIntent: string; amountCents: number; bookingId: string; stripeAccount: string | null }; key: string }[] = []
  const recorded: { paymentIntent: string; refundedCents: number; fully: boolean }[] = []
  const deps: RefundDeps = {
    loadBooking: async () => booking,
    loadPayment: async () => payment,
    createRefund: async (args, key) => {
      created.push({ args, key })
    },
    recordRefund: async (args) => {
      if (opts.recordFails) throw new Error('db down')
      recorded.push(args)
    },
  }
  return { deps, created, recorded }
}

const paid = (over: Partial<PaymentForRefund> = {}): PaymentForRefund => ({
  status: 'succeeded',
  total_cents: 36000,
  refunded_cents: 0,
  stripe_payment_intent_id: 'pi_1',
  stripe_account_id: 'acct_1ABC',
  ...over,
})
const cancelled = (pct: number | null, status = 'cancelled_tourist'): BookingForRefund => ({ status, refund_pct: pct })

test.describe('refund amounts', () => {
  test('expected refund follows the policy percentage', () => {
    expect(expectedRefundCents(36000, 100)).toBe(36000)
    expect(expectedRefundCents(36000, 50)).toBe(18000)
    expect(expectedRefundCents(36000, 0)).toBe(0)
    expect(expectedRefundCents(36000, null)).toBe(0)
  })

  test('rounds to the cent and stays within 0-100 %', () => {
    expect(expectedRefundCents(1001, 50)).toBe(501)
    expect(expectedRefundCents(36000, 250)).toBe(36000)
    expect(expectedRefundCents(36000, -10)).toBe(0)
  })

  test('remaining never goes negative nor above the amount paid', () => {
    expect(remainingRefundCents(36000, 50, 0)).toBe(18000)
    expect(remainingRefundCents(36000, 50, 18000)).toBe(0)
    expect(remainingRefundCents(36000, 50, 30000)).toBe(0)
    expect(remainingRefundCents(36000, 100, 6000)).toBe(30000)
  })
})

test.describe('refundCancelledBooking', () => {
  test('a full refund (100 %) refunds the whole payment and marks it fully refunded', async () => {
    const { deps, created, recorded } = setup(cancelled(100), paid())
    const out = await refundCancelledBooking('b1', deps)
    expect(out).toEqual({ status: 'refunded', refundedCents: 36000 })
    expect(created).toHaveLength(1)
    expect(created[0].args).toEqual({ paymentIntent: 'pi_1', amountCents: 36000, bookingId: 'b1', stripeAccount: 'acct_1ABC' })
    expect(recorded).toEqual([{ paymentIntent: 'pi_1', refundedCents: 36000, fully: true }])
  })

  test('a 50 % policy refunds half and leaves the payment partially refunded', async () => {
    const { deps, created, recorded } = setup(cancelled(50), paid())
    const out = await refundCancelledBooking('b1', deps)
    expect(out).toEqual({ status: 'refunded', refundedCents: 18000 })
    expect(created[0].args.amountCents).toBe(18000)
    expect(recorded[0]).toEqual({ paymentIntent: 'pi_1', refundedCents: 18000, fully: false })
  })

  test('a provider cancellation (100 %) refunds everything', async () => {
    const { deps, created } = setup(cancelled(100, 'cancelled_provider'), paid())
    expect((await refundCancelledBooking('b1', deps)).status).toBe('refunded')
    expect(created[0].args.amountCents).toBe(36000)
  })

  test('0 % (late cancellation) refunds nothing', async () => {
    const { deps, created } = setup(cancelled(0), paid())
    expect(await refundCancelledBooking('b1', deps)).toEqual({ status: 'nothing_to_refund', reason: 'nothing_due' })
    expect(created).toHaveLength(0)
  })

  test('only the missing part is refunded when part of it already left', async () => {
    const { deps, created, recorded } = setup(cancelled(100), paid({ refunded_cents: 6000 }))
    const out = await refundCancelledBooking('b1', deps)
    expect(out).toEqual({ status: 'refunded', refundedCents: 30000 })
    expect(created[0].args.amountCents).toBe(30000)
    expect(recorded[0]).toEqual({ paymentIntent: 'pi_1', refundedCents: 36000, fully: true })
  })

  test('nothing happens for bookings that are not cancelled', async () => {
    for (const status of ['pending', 'confirmed', 'completed', 'expired']) {
      const { deps, created } = setup({ status, refund_pct: 100 }, paid())
      expect((await refundCancelledBooking('b1', deps)).status, status).toBe('not_cancelled')
      expect(created).toHaveLength(0)
    }
    expect((await refundCancelledBooking('b1', setup(null, paid()).deps)).status).toBe('not_cancelled')
  })

  test('nothing to refund without a captured payment', async () => {
    expect(await refundCancelledBooking('b1', setup(cancelled(100), null).deps)).toEqual({ status: 'nothing_to_refund', reason: 'no_payment' })
    expect(await refundCancelledBooking('b1', setup(cancelled(100), paid({ stripe_payment_intent_id: null })).deps)).toEqual({ status: 'nothing_to_refund', reason: 'no_payment' })
    for (const status of ['pending', 'failed']) {
      const { deps, created } = setup(cancelled(100), paid({ status }))
      expect(await refundCancelledBooking('b1', deps), status).toEqual({ status: 'nothing_to_refund', reason: 'not_captured' })
      expect(created).toHaveLength(0)
    }
  })

  test('an already refunded payment is left alone', async () => {
    const { deps, created } = setup(cancelled(100), paid({ status: 'refunded', refunded_cents: 36000 }))
    expect(await refundCancelledBooking('b1', deps)).toEqual({ status: 'nothing_to_refund', reason: 'already_refunded' })
    expect(created).toHaveLength(0)
  })

  test('replay after a failed database write reuses the same idempotency key (no second refund)', async () => {
    const first = setup(cancelled(100), paid(), { recordFails: true })
    await expect(refundCancelledBooking('b1', first.deps)).rejects.toThrow('db down')
    expect(first.created).toHaveLength(1)

    // Stripe already refunded but the database still says "0 refunded": same state, so the same key.
    const second = setup(cancelled(100), paid())
    await refundCancelledBooking('b1', second.deps)
    expect(second.created[0].key).toBe(first.created[0].key)
  })

  test('the idempotency key changes when the amount still due changes', async () => {
    const a = setup(cancelled(100), paid({ refunded_cents: 0 }))
    const b = setup(cancelled(100), paid({ refunded_cents: 6000 }))
    await refundCancelledBooking('b1', a.deps)
    await refundCancelledBooking('b1', b.deps)
    expect(a.created[0].key).not.toBe(b.created[0].key)
  })
})

test.describe('direct charges', () => {
  test('the refund is requested on the provider account that took the payment', async () => {
    const { deps, created } = setup(cancelled(100), paid())
    await refundCancelledBooking('b1', deps)
    expect(created[0].args.stripeAccount).toBe('acct_1ABC')
  })

  test('a legacy platform payment has no connected account', async () => {
    const { deps, created } = setup(cancelled(100), paid({ stripe_account_id: null }))
    await refundCancelledBooking('b1', deps)
    expect(created[0].args.stripeAccount).toBeNull()
  })
})
