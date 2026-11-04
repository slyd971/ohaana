import { test, expect } from '@playwright/test'
import type Stripe from 'stripe'
import { handleStripeEvent, type WebhookDeps } from '@/lib/stripe/webhook-handlers'

// Pure logic: the Supabase and Stripe calls are replaced by recorders. The SQL side (idempotence,
// late payments, replays) is covered by supabase/tests/security.sql.

function makeDeps(result: unknown = 'ok', error: { message: string } | null = null) {
  const calls: { fn: string; args: Record<string, unknown> }[] = []
  const refunds: string[] = []
  const deps: WebhookDeps = {
    rpc: async (fn, args) => {
      calls.push({ fn, args })
      return { data: result, error }
    },
    refundLatePayment: async (id) => {
      refunds.push(id)
    },
  }
  return { deps, calls, refunds }
}

const event = (type: string, object: Record<string, unknown>) => ({ id: 'evt_1', type, data: { object } }) as unknown as Stripe.Event

test.describe('handleStripeEvent', () => {
  test('payment_intent.succeeded confirms through apply_payment_succeeded', async () => {
    const { deps, calls, refunds } = makeDeps('confirmed')
    const out = await handleStripeEvent(event('payment_intent.succeeded', { id: 'pi_1', latest_charge: 'ch_1' }), deps)
    expect(out).toEqual({ handled: true, result: 'confirmed' })
    expect(calls).toEqual([{ fn: 'apply_payment_succeeded', args: { p_intent: 'pi_1', p_charge: 'ch_1' } }])
    expect(refunds).toEqual([])
  })

  test('an expanded latest_charge object is reduced to its id', async () => {
    const { deps, calls } = makeDeps('already')
    await handleStripeEvent(event('payment_intent.succeeded', { id: 'pi_1', latest_charge: { id: 'ch_9' } }), deps)
    expect(calls[0].args.p_charge).toBe('ch_9')
  })

  test('a payment that arrives after the booking expired is refunded once', async () => {
    const { deps, refunds } = makeDeps('needs_refund')
    const out = await handleStripeEvent(event('payment_intent.succeeded', { id: 'pi_late', latest_charge: null }), deps)
    expect(out.result).toBe('needs_refund')
    expect(refunds).toEqual(['pi_late'])
  })

  test('no refund for an unknown or already processed payment', async () => {
    for (const result of ['unknown', 'already']) {
      const { deps, refunds } = makeDeps(result)
      await handleStripeEvent(event('payment_intent.succeeded', { id: 'pi_x', latest_charge: null }), deps)
      expect(refunds, result).toEqual([])
    }
  })

  test('payment_intent.payment_failed marks the payment failed', async () => {
    const { deps, calls } = makeDeps('failed')
    await handleStripeEvent(event('payment_intent.payment_failed', { id: 'pi_2' }), deps)
    expect(calls).toEqual([{ fn: 'apply_payment_failed', args: { p_intent: 'pi_2' } }])
  })

  test('charge.refunded distinguishes a full refund from a partial one', async () => {
    const full = makeDeps('refunded')
    await handleStripeEvent(event('charge.refunded', { id: 'ch_1', payment_intent: 'pi_1', refunded: true }), full.deps)
    expect(full.calls[0]).toEqual({ fn: 'apply_charge_refunded', args: { p_charge: 'ch_1', p_intent: 'pi_1', p_fully: true } })

    const partial = makeDeps('partial')
    await handleStripeEvent(event('charge.refunded', { id: 'ch_1', payment_intent: 'pi_1', refunded: false }), partial.deps)
    expect(partial.calls[0].args.p_fully).toBe(false)
  })

  test('account.updated is "ready" only when charges, payouts and details are all complete', async () => {
    const cases: [Record<string, boolean>, boolean][] = [
      [{ charges_enabled: true, payouts_enabled: true, details_submitted: true }, true],
      [{ charges_enabled: true, payouts_enabled: false, details_submitted: true }, false],
      [{ charges_enabled: false, payouts_enabled: true, details_submitted: true }, false],
      [{ charges_enabled: true, payouts_enabled: true, details_submitted: false }, false],
      [{}, false],
    ]
    for (const [flags, expected] of cases) {
      const { deps, calls } = makeDeps('updated')
      await handleStripeEvent(event('account.updated', { id: 'acct_1', ...flags }), deps)
      expect(calls[0].args, JSON.stringify(flags)).toEqual({ p_account: 'acct_1', p_ready: expected })
    }
  })

  test('other events are acknowledged without touching the database', async () => {
    const { deps, calls, refunds } = makeDeps()
    const out = await handleStripeEvent(event('customer.created', { id: 'cus_1' }), deps)
    expect(out).toEqual({ handled: false })
    expect(calls).toEqual([])
    expect(refunds).toEqual([])
  })

  test('a database error is raised so the route answers 500 and Stripe retries', async () => {
    const { deps } = makeDeps(null, { message: 'boom' })
    await expect(handleStripeEvent(event('payment_intent.succeeded', { id: 'pi_1', latest_charge: null }), deps)).rejects.toThrow('apply_payment_succeeded: boom')
  })

  test('a failing refund is raised too (the event is retried, the refund key is idempotent)', async () => {
    const deps: WebhookDeps = {
      rpc: async () => ({ data: 'needs_refund', error: null }),
      refundLatePayment: async () => {
        throw new Error('stripe down')
      },
    }
    await expect(handleStripeEvent(event('payment_intent.succeeded', { id: 'pi_1', latest_charge: null }), deps)).rejects.toThrow('stripe down')
  })
})
