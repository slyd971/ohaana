import type Stripe from 'stripe'

/** What the handlers need from the outside world (a Supabase service-role client and Stripe), injectable for tests. */
export interface WebhookDeps {
  rpc(fn: string, args: Record<string, unknown>): Promise<{ data: unknown; error: { message: string } | null }>
  refundLatePayment(paymentIntentId: string): Promise<void>
}

export type HandlerOutcome = { handled: boolean; result?: string }

async function call(deps: WebhookDeps, fn: string, args: Record<string, unknown>): Promise<string> {
  const { data, error } = await deps.rpc(fn, args)
  if (error) throw new Error(`${fn}: ${error.message}`)
  return typeof data === 'string' ? data : ''
}

const idOf = (v: string | { id: string } | null | undefined): string | null => (typeof v === 'string' ? v : v?.id ?? null)

/**
 * Applies one Stripe event. Every database change goes through an atomic, replayable SQL function
 * (migration 010), so a duplicate or concurrent delivery cannot confirm, notify or refund twice.
 * Throws on any failure: the route then answers 500 and Stripe retries the event.
 */
export async function handleStripeEvent(event: Stripe.Event, deps: WebhookDeps): Promise<HandlerOutcome> {
  switch (event.type) {
    case 'payment_intent.succeeded': {
      const intent = event.data.object
      const result = await call(deps, 'apply_payment_succeeded', {
        p_intent: intent.id,
        p_charge: idOf(intent.latest_charge as string | { id: string } | null),
      })
      // Paid after the booking expired or was cancelled: the slot is no longer guaranteed, give the money back.
      if (result === 'needs_refund') await deps.refundLatePayment(intent.id)
      return { handled: true, result }
    }

    case 'payment_intent.payment_failed':
      return { handled: true, result: await call(deps, 'apply_payment_failed', { p_intent: event.data.object.id }) }

    case 'charge.refunded': {
      const charge = event.data.object
      return {
        handled: true,
        result: await call(deps, 'apply_charge_refunded', {
          p_charge: charge.id,
          p_intent: idOf(charge.payment_intent as string | { id: string } | null),
          p_fully: charge.refunded === true,
          p_refunded_cents: typeof charge.amount_refunded === 'number' ? charge.amount_refunded : null,
        }),
      }
    }

    case 'account.updated': {
      const account = event.data.object
      const ready = Boolean(account.charges_enabled && account.payouts_enabled && account.details_submitted)
      return { handled: true, result: await call(deps, 'apply_account_updated', { p_account: account.id, p_ready: ready }) }
    }

    default:
      return { handled: false }
  }
}
