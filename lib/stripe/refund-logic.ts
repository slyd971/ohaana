// Remboursement d'une réservation annulée. Cœur sans dépendance (testable) : le montant dû vient du
// pourcentage fixé par la base au moment de l'annulation (politique d'annulation du service).

export type RefundOutcome =
  | { status: 'refunded'; refundedCents: number }
  | { status: 'nothing_to_refund'; reason: 'no_payment' | 'not_captured' | 'nothing_due' | 'already_refunded' }
  | { status: 'not_cancelled' }

/** Montant total dû au voyageur : total payé × pourcentage, borné à [0, 100] %. */
export function expectedRefundCents(totalCents: number, refundPct: number | null): number {
  const pct = Math.min(100, Math.max(0, refundPct ?? 0))
  return Math.round((totalCents * pct) / 100)
}

/** Ce qu'il reste à rembourser (jamais négatif, jamais plus que le total payé). */
export function remainingRefundCents(totalCents: number, refundPct: number | null, alreadyRefundedCents: number): number {
  return Math.max(0, Math.min(totalCents, expectedRefundCents(totalCents, refundPct)) - alreadyRefundedCents)
}

export interface BookingForRefund {
  status: string
  refund_pct: number | null
}
export interface PaymentForRefund {
  status: string
  total_cents: number
  refunded_cents: number
  stripe_payment_intent_id: string | null
}

export interface RefundDeps {
  loadBooking(bookingId: string): Promise<BookingForRefund | null>
  loadPayment(bookingId: string): Promise<PaymentForRefund | null>
  /** Appel Stripe. La clé d'idempotence garantit qu'un rejeu ne crée jamais un second remboursement. */
  createRefund(args: { paymentIntent: string; amountCents: number; bookingId: string }, idempotencyKey: string): Promise<void>
  /** Écrit le cumul remboursé en base (payments.refunded_cents, et le statut si c'est total). */
  recordRefund(args: { paymentIntent: string; refundedCents: number; fully: boolean }): Promise<void>
}

export async function refundCancelledBooking(bookingId: string, deps: RefundDeps): Promise<RefundOutcome> {
  const booking = await deps.loadBooking(bookingId)
  if (!booking || (booking.status !== 'cancelled_tourist' && booking.status !== 'cancelled_provider')) {
    return { status: 'not_cancelled' }
  }

  const payment = await deps.loadPayment(bookingId)
  if (!payment || !payment.stripe_payment_intent_id) return { status: 'nothing_to_refund', reason: 'no_payment' }
  // Un paiement jamais encaissé (réservation annulée avant de payer) n'a rien à rembourser.
  if (payment.status === 'pending' || payment.status === 'failed') return { status: 'nothing_to_refund', reason: 'not_captured' }
  if (payment.status === 'refunded') return { status: 'nothing_to_refund', reason: 'already_refunded' }

  const due = expectedRefundCents(payment.total_cents, booking.refund_pct)
  const remaining = remainingRefundCents(payment.total_cents, booking.refund_pct, payment.refunded_cents)
  if (remaining === 0) return { status: 'nothing_to_refund', reason: due === 0 ? 'nothing_due' : 'already_refunded' }

  // La clé dépend du montant dû : si Stripe a déjà remboursé mais que l'écriture en base a échoué, le rejeu
  // retombe sur le même remboursement au lieu d'en créer un autre.
  await deps.createRefund(
    { paymentIntent: payment.stripe_payment_intent_id, amountCents: remaining, bookingId },
    `booking-refund-${bookingId}-${payment.refunded_cents}-${remaining}`,
  )

  const refundedCents = payment.refunded_cents + remaining
  await deps.recordRefund({
    paymentIntent: payment.stripe_payment_intent_id,
    refundedCents,
    fully: refundedCents >= payment.total_cents,
  })
  return { status: 'refunded', refundedCents: remaining }
}
