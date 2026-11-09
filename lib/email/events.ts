import { createAdminClient, hasServiceRole } from '@/lib/supabase/server'
import { absoluteUrl } from '@/lib/site'
import { sendEmail, type SendResult } from './send'
import {
  bookingCancelled,
  bookingConfirmedTourist,
  bookingNewProvider,
  bookingReminder,
  providerApproved,
  providerSuspended,
  reviewRequest,
  toLang,
  type BookingMail,
  type Lang,
  type Rendered,
} from './templates'

// Orchestration serveur : charge les données avec la clé service_role, choisit la langue de chaque destinataire,
// envoie l'email et, pour les évènements que la base ne notifie pas déjà, écrit la notification in-app.
// Toutes ces fonctions avalent leurs erreurs : un email raté ne doit jamais annuler le paiement ni l'annulation.

const TZ = 'America/Guadeloupe'
const LOCALES: Record<Lang, string> = { fr: 'fr-FR', en: 'en-GB', es: 'es-ES' }

export const formatWhen = (iso: string | null, lang: Lang) =>
  iso ? new Intl.DateTimeFormat(LOCALES[lang], { dateStyle: 'full', timeStyle: 'short', timeZone: TZ }).format(new Date(iso)) : '—'
export const formatMoney = (cents: number, lang: Lang) =>
  new Intl.NumberFormat(LOCALES[lang], { style: 'currency', currency: 'EUR' }).format(cents / 100)

interface Person {
  id: string
  email: string
  full_name: string | null
  lang: Lang
}
interface Loaded {
  booking: { id: string; status: string; guests: number; totalCents: number; startsAt: string | null; refundPct: number | null }
  titles: { fr: string; en: string | null; es: string | null }
  tourist: Person
  provider: Person | null
}

type Admin = Awaited<ReturnType<typeof createAdminClient>>

async function person(admin: Admin, userId: string | null | undefined): Promise<Person | null> {
  if (!userId) return null
  const { data } = await admin.from('users').select('id, email, full_name, locale').eq('id', userId).maybeSingle()
  const u = data as { id: string; email: string | null; full_name: string | null; locale: string | null } | null
  return u?.email ? { id: u.id, email: u.email, full_name: u.full_name, lang: toLang(u.locale) } : null
}

async function loadBooking(admin: Admin, bookingId: string): Promise<Loaded | null> {
  const { data: b } = await admin
    .from('bookings')
    .select('id, status, guests_count, total_cents, starts_at, refund_pct, tourist_id, service_id')
    .eq('id', bookingId)
    .maybeSingle()
  const booking = b as { id: string; status: string; guests_count: number; total_cents: number; starts_at: string | null; refund_pct: number | null; tourist_id: string; service_id: string } | null
  if (!booking) return null
  const { data: s } = await admin.from('services').select('title_fr, title_en, title_es, provider_id').eq('id', booking.service_id).maybeSingle()
  const service = s as { title_fr: string; title_en: string | null; title_es: string | null; provider_id: string } | null
  if (!service) return null
  const { data: p } = await admin.from('provider_profiles').select('user_id').eq('id', service.provider_id).maybeSingle()
  const tourist = await person(admin, booking.tourist_id)
  if (!tourist) return null
  return {
    booking: { id: booking.id, status: booking.status, guests: booking.guests_count, totalCents: booking.total_cents, startsAt: booking.starts_at, refundPct: booking.refund_pct },
    titles: { fr: service.title_fr, en: service.title_en, es: service.title_es },
    tourist,
    provider: await person(admin, (p as { user_id: string } | null)?.user_id),
  }
}

const titleFor = (l: Loaded, lang: Lang) => (lang === 'en' ? l.titles.en : lang === 'es' ? l.titles.es : null) ?? l.titles.fr

function mailFor(l: Loaded, to: Person, path: string, counterpart: string | null): BookingMail {
  return {
    lang: to.lang,
    recipientName: to.full_name,
    serviceTitle: titleFor(l, to.lang),
    when: formatWhen(l.booking.startsAt, to.lang),
    guests: l.booking.guests,
    total: formatMoney(l.booking.totalCents, to.lang),
    url: absoluteUrl(path, to.lang),
    counterpart,
  }
}

const firstName = (n: string | null) => (n ?? '').trim().split(' ')[0] || null

async function deliver(to: string, mail: Rendered): Promise<SendResult> {
  return sendEmail({ to, subject: mail.subject, html: mail.html, text: mail.text })
}

/** Pour la tâche planifiée : un envoi raté doit remonter pour que la réservation soit retentée au prochain passage. */
async function deliverStrict(to: string, mail: Rendered): Promise<void> {
  const r = await deliver(to, mail)
  if (r.status === 'failed') throw new Error(`email_${r.reason}`)
}

async function safely<T>(label: string, fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn()
  } catch (error) {
    console.error(`[email] ${label} failed:`, error instanceof Error ? error.message : error)
    return null
  }
}

// ─── Évènements ──────────────────────────────────────────────────────────────

/** Réservation payée : confirmation au voyageur, alerte au prestataire. À appeler UNE fois (résultat « confirmed »). */
export async function emailBookingPaid(intentId: string): Promise<void> {
  if (!hasServiceRole()) return
  await safely('booking paid', async () => {
    const admin = await createAdminClient()
    const { data: pay } = await admin.from('payments').select('booking_id').eq('stripe_payment_intent_id', intentId).maybeSingle()
    const bookingId = (pay as { booking_id: string } | null)?.booking_id
    const l = bookingId ? await loadBooking(admin, bookingId) : null
    if (!l) return
    await deliver(l.tourist.email, bookingConfirmedTourist(mailFor(l, l.tourist, '/voyages', null)))
    if (l.provider) {
      await deliver(l.provider.email, bookingNewProvider(mailFor(l, l.provider, '/provider/reservations', firstName(l.tourist.full_name))))
    }
  })
}

/** Annulation : prévient l'autre partie, et confirme à celle qui annule. */
export async function emailBookingCancelled(bookingId: string, by: 'tourist' | 'provider', refundLine?: Partial<Record<Lang, string>>): Promise<void> {
  if (!hasServiceRole()) return
  await safely('booking cancelled', async () => {
    const admin = await createAdminClient()
    const l = await loadBooking(admin, bookingId)
    if (!l) return
    const send = (to: Person, recipient: 'tourist' | 'provider', path: string, counterpart: string | null) =>
      deliver(to.email, bookingCancelled({ ...mailFor(l, to, path, counterpart), by, recipient, refundLine: recipient === 'tourist' ? (refundLine?.[to.lang] ?? null) : null }))
    await send(l.tourist, 'tourist', '/voyages', null)
    if (l.provider) await send(l.provider, 'provider', '/provider/reservations', firstName(l.tourist.full_name))
  })
}

/** Dossier prestataire validé ou suspendu : email + notification in-app. */
export async function emailProviderDecision(providerId: string, approved: boolean): Promise<void> {
  if (!hasServiceRole()) return
  await safely('provider decision', async () => {
    const admin = await createAdminClient()
    const { data: p } = await admin.from('provider_profiles').select('user_id').eq('id', providerId).maybeSingle()
    const user = await person(admin, (p as { user_id: string } | null)?.user_id)
    if (!user) return
    const mail = approved
      ? providerApproved({ lang: user.lang, name: user.full_name, url: absoluteUrl('/provider/paiements', user.lang) })
      : providerSuspended({ lang: user.lang, name: user.full_name, contactUrl: absoluteUrl('/concierge', user.lang) })
    await deliver(user.email, mail)
    await admin.rpc('notify', {
      p_user: user.id,
      p_type: 'provider_status',
      p_title_fr: approved ? 'Votre dossier est validé' : 'Votre compte prestataire est suspendu',
      p_title_en: approved ? 'Your application is approved' : 'Your provider account is suspended',
      p_body_fr: approved ? 'Vous pouvez publier vos services et configurer vos paiements.' : 'Vos fiches ne sont plus visibles. Contactez-nous en cas d’erreur.',
      p_body_en: approved ? 'You can publish your services and set up your payments.' : 'Your listings are no longer visible. Contact us if this is a mistake.',
      p_payload: { provider_id: providerId },
    })
  })
}

// ─── Tâche planifiée ─────────────────────────────────────────────────────────

export interface DailyReport {
  expired: number
  reminders: number
  reviewRequests: number
}

const HOUR = 3_600_000

/** Libère les réservations non payées, envoie les rappels J-1 et les demandes d'avis. Chaque envoi est réclamé en base avant l'email. */
export async function runDailyJobs(now = new Date()): Promise<DailyReport> {
  const admin = await createAdminClient()
  const report: DailyReport = { expired: 0, reminders: 0, reviewRequests: 0 }

  const { error: expireError } = await admin.rpc('expire_pending_bookings')
  if (expireError) console.error('[cron] expire_pending_bookings:', expireError.message)

  // Sans clé d'envoi, on ne « consomme » aucun rappel : ils partiront dès que la clé sera configurée.
  if (!process.env.RESEND_API_KEY?.trim()) return report

  // Rappel : prestations qui commencent dans 12 à 36 h (une seule fois par réservation).
  const { data: soon } = await admin
    .from('bookings')
    .select('id')
    .eq('status', 'confirmed')
    .is('reminder_sent_at', null)
    .gte('starts_at', new Date(now.getTime() + 12 * HOUR).toISOString())
    .lte('starts_at', new Date(now.getTime() + 36 * HOUR).toISOString())
    .limit(500)
  for (const { id } of (soon ?? []) as { id: string }[]) {
    if (await claimAndSend(admin, id, 'reminder_sent_at', async (l) => {
      await deliverStrict(l.tourist.email, bookingReminder(mailFor(l, l.tourist, '/voyages', null)))
      await notifyUser(admin, l.tourist.id, 'booking_reminder', 'Rappel : votre expérience est demain', 'Reminder: your experience is tomorrow', titleFor(l, 'fr'), titleFor(l, 'en'), id)
    })) report.reminders += 1
  }

  // Avis : prestations terminées depuis plus de 24 h (30 jours maximum), sans avis déjà déposé.
  const { data: done } = await admin
    .from('bookings')
    .select('id')
    .eq('status', 'completed')
    .is('review_request_sent_at', null)
    .lte('starts_at', new Date(now.getTime() - 24 * HOUR).toISOString())
    .gte('starts_at', new Date(now.getTime() - 30 * 24 * HOUR).toISOString())
    .limit(500)
  const ids = ((done ?? []) as { id: string }[]).map((r) => r.id)
  const reviewed = new Set<string>()
  if (ids.length) {
    const { data: rv } = await admin.from('reviews').select('booking_id').in('booking_id', ids)
    for (const r of (rv ?? []) as { booking_id: string }[]) reviewed.add(r.booking_id)
  }
  for (const id of ids.filter((i) => !reviewed.has(i))) {
    if (await claimAndSend(admin, id, 'review_request_sent_at', async (l) => {
      await deliverStrict(l.tourist.email, reviewRequest(mailFor(l, l.tourist, '/voyages', null)))
      await notifyUser(admin, l.tourist.id, 'review_request', 'Comment s’est passée votre expérience ?', 'How was your experience?', titleFor(l, 'fr'), titleFor(l, 'en'), id)
    })) report.reviewRequests += 1
  }
  return report
}

async function notifyUser(admin: Admin, userId: string, type: string, tFr: string, tEn: string, bFr: string, bEn: string, bookingId: string) {
  await admin.rpc('notify', { p_user: userId, p_type: type, p_title_fr: tFr, p_title_en: tEn, p_body_fr: bFr, p_body_en: bEn, p_payload: { booking_id: bookingId } })
}

/** Réclame la réservation (colonne *_sent_at) avant d'envoyer ; si l'envoi échoue, la réclamation est relâchée pour le prochain passage. */
async function claimAndSend(admin: Admin, bookingId: string, column: 'reminder_sent_at' | 'review_request_sent_at', send: (l: Loaded) => Promise<void>): Promise<boolean> {
  const { data: claimed } = await admin.from('bookings').update({ [column]: new Date().toISOString() }).eq('id', bookingId).is(column, null).select('id')
  if (!claimed || claimed.length === 0) return false // une autre exécution l'a déjà prise
  try {
    const l = await loadBooking(admin, bookingId)
    if (!l) throw new Error('booking_unavailable')
    await send(l)
    return true
  } catch (error) {
    console.error(`[cron] ${column} for ${bookingId} failed:`, error instanceof Error ? error.message : error)
    await admin.from('bookings').update({ [column]: null }).eq('id', bookingId)
    return false
  }
}

/** Phrase sur le remboursement, dans chaque langue, pour l'email d'annulation. */
export function refundSentence(kind: 'refunded' | 'pending' | 'none', cents = 0): Record<Lang, string> | undefined {
  if (kind === 'refunded') {
    return {
      fr: `Un remboursement de ${formatMoney(cents, 'fr')} a été émis ; il apparaît sur votre moyen de paiement sous quelques jours.`,
      en: `A refund of ${formatMoney(cents, 'en')} has been issued; it will appear on your payment method within a few days.`,
      es: `Se ha emitido un reembolso de ${formatMoney(cents, 'es')}; aparecerá en tu medio de pago en unos días.`,
    }
  }
  if (kind === 'pending') {
    return {
      fr: 'Votre remboursement est en cours de traitement par notre équipe.',
      en: 'Your refund is being processed by our team.',
      es: 'Nuestro equipo está tramitando tu reembolso.',
    }
  }
  return undefined
}
