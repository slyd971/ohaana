import { createAdminClient, hasServiceRole } from '@/lib/supabase/server'
import { getStripe } from './client'
import { refundCancelledBooking, type PaymentForRefund, type RefundDeps, type RefundOutcome } from './refund-logic'
import { isStripeAccountId } from './direct-charge'

export { expectedRefundCents } from './refund-logic'
export type { RefundOutcome }

/** Rembourse le voyageur d'une réservation annulée, selon la politique d'annulation (service_role + Stripe). */
export async function refundBookingPayment(bookingId: string): Promise<RefundOutcome> {
  if (!hasServiceRole() || !process.env.STRIPE_SECRET_KEY) throw new Error('refunds_not_configured')
  const admin = await createAdminClient()
  const stripe = getStripe()

  /** Compte connecté du prestataire de la réservation (null si absent : paiement encaissé par la plateforme). */
  async function connectedAccountOf(id: string): Promise<string | null> {
    const { data: b } = await admin.from('bookings').select('service_id').eq('id', id).maybeSingle()
    const serviceId = (b as { service_id: string } | null)?.service_id
    if (!serviceId) return null
    const { data: svc } = await admin.from('services').select('provider_id').eq('id', serviceId).maybeSingle()
    const providerId = (svc as { provider_id: string } | null)?.provider_id
    if (!providerId) return null
    const { data: prov } = await admin.from('provider_profiles').select('stripe_account_id').eq('id', providerId).maybeSingle()
    const account = (prov as { stripe_account_id: string | null } | null)?.stripe_account_id ?? null
    return isStripeAccountId(account) ? account : null
  }

  const deps: RefundDeps = {
    loadBooking: async (id) => {
      const { data } = await admin.from('bookings').select('status, refund_pct').eq('id', id).maybeSingle()
      return (data as { status: string; refund_pct: number | null } | null) ?? null
    },
    loadPayment: async (id) => {
      const { data } = await admin
        .from('payments')
        .select('status, total_cents, refunded_cents, stripe_payment_intent_id')
        .eq('booking_id', id)
        .maybeSingle()
      if (!data) return null
      return { ...(data as Omit<PaymentForRefund, 'stripe_account_id'>), stripe_account_id: await connectedAccountOf(id) }
    },
    createRefund: async ({ paymentIntent, amountCents, bookingId: id, stripeAccount }, idempotencyKey) => {
      // Paiement direct : le remboursement se fait sur le compte du prestataire, et la commission d'Ohaana est
      // rendue au prorata (si le service n'a pas lieu, Ohaana ne garde pas sa part).
      await stripe.refunds.create(
        {
          payment_intent: paymentIntent,
          amount: amountCents,
          reason: 'requested_by_customer',
          metadata: { booking_id: id },
          ...(stripeAccount ? { refund_application_fee: true } : {}),
        },
        stripeAccount ? { idempotencyKey, stripeAccount } : { idempotencyKey },
      )
    },
    recordRefund: async ({ paymentIntent, refundedCents, fully }) => {
      const { error } = await admin.rpc('apply_charge_refunded', {
        p_charge: null,
        p_intent: paymentIntent,
        p_fully: fully,
        p_refunded_cents: refundedCents,
      })
      if (error) throw new Error(`apply_charge_refunded: ${error.message}`)
    },
  }

  return refundCancelledBooking(bookingId, deps)
}
