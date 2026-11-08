import { createAdminClient, hasServiceRole } from '@/lib/supabase/server'
import { getStripe } from './client'
import { refundCancelledBooking, type RefundDeps, type RefundOutcome } from './refund-logic'

export { expectedRefundCents } from './refund-logic'
export type { RefundOutcome }

/** Rembourse le voyageur d'une réservation annulée, selon la politique d'annulation (service_role + Stripe). */
export async function refundBookingPayment(bookingId: string): Promise<RefundOutcome> {
  if (!hasServiceRole() || !process.env.STRIPE_SECRET_KEY) throw new Error('refunds_not_configured')
  const admin = await createAdminClient()
  const stripe = getStripe()

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
      return (data as { status: string; total_cents: number; refunded_cents: number; stripe_payment_intent_id: string | null } | null) ?? null
    },
    createRefund: async ({ paymentIntent, amountCents, bookingId: id }, idempotencyKey) => {
      // NOTE Connect : quand les paiements seront des « destination charges », ajouter ici
      // reverse_transfer: true (reprendre la part du prestataire) et refund_application_fee selon la politique.
      await stripe.refunds.create(
        { payment_intent: paymentIntent, amount: amountCents, reason: 'requested_by_customer', metadata: { booking_id: id } },
        { idempotencyKey },
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
