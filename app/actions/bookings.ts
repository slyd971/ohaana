'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { hasServiceRole } from '@/lib/supabase/server'
import { refundBookingPayment } from '@/lib/stripe/refunds'
import { isUuid } from '@/lib/provider/service-input'
import type { CancelResult } from '@/lib/bookings/types'
import { emailBookingCancelled, refundSentence } from '@/lib/email/events'

/**
 * Annulation d'une réservation par le voyageur. Deux temps, dans cet ordre :
 *  1. la RPC cancel_booking (sous la session du voyageur) vérifie qu'elle lui appartient, qu'elle n'a pas
 *     commencé, libère le créneau et fixe le pourcentage remboursable selon la politique d'annulation ;
 *  2. le serveur rembourse ce pourcentage via Stripe (clé d'idempotence : un double clic ne rembourse pas deux fois).
 * Si l'étape 2 échoue, l'annulation reste valable et le remboursement apparaît dans « remboursements à traiter »
 * côté admin : on ne rend jamais le voyageur propriétaire d'un créneau qu'il a voulu libérer.
 */
export async function cancelMyBookingAction(bookingId: string, reason?: string): Promise<CancelResult> {
  if (!isUuid(bookingId)) return { ok: false, error: 'Réservation invalide.' }

  const supabase = await createClient()
  const { error } = await supabase.rpc('cancel_booking', {
    p_booking_id: bookingId,
    p_reason: typeof reason === 'string' && reason.trim() ? reason.trim().slice(0, 500) : null,
  })
  if (error) {
    const code = (error as { code?: string }).code
    if (code === '28000') return { ok: false, error: 'Connectez-vous pour annuler.' }
    if (code === 'P0002') return { ok: false, error: 'Réservation introuvable.' }
    if (code === '22023') return { ok: false, error: 'Cette réservation ne peut plus être annulée (déjà commencée ou terminée).' }
    return { ok: false, error: 'Impossible d’annuler pour le moment.' }
  }

  revalidatePath('/voyages')
  if (!hasServiceRole()) return { ok: true, refund: { kind: 'none' } }

  try {
    const outcome = await refundBookingPayment(bookingId)
    if (outcome.status === 'refunded') {
      await emailBookingCancelled(bookingId, 'tourist', refundSentence('refunded', outcome.refundedCents))
      return { ok: true, refund: { kind: 'refunded', cents: outcome.refundedCents } }
    }
    // Réservation jamais payée : personne n'a été prévenu de quoi que ce soit, pas d'email d'annulation.
    const neverPaid = outcome.status === 'nothing_to_refund' && (outcome.reason === 'no_payment' || outcome.reason === 'not_captured')
    if (!neverPaid) await emailBookingCancelled(bookingId, 'tourist')
    return { ok: true, refund: { kind: 'none' } }
  } catch (e) {
    console.error('[cancel] refund failed for', bookingId, e instanceof Error ? e.message : e)
    await emailBookingCancelled(bookingId, 'tourist', refundSentence('pending'))
    return { ok: true, refund: { kind: 'pending' } }
  }
}
