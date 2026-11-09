import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createPublicClient } from '@/lib/supabase/public'
import { clientIp, rateLimited } from '@/lib/rate-limit'
import { newLeadToken } from '@/lib/email/lead-token'
import { sendEmail } from '@/lib/email/send'
import { leadConfirmation } from '@/lib/email/templates'
import { SITE_URL } from '@/lib/site'

const bodySchema = z.object({
  email: z.string().trim().max(254).pipe(z.email()),
  destination: z.string().trim().max(100).optional(),
  whatsapp: z.string().trim().max(30).optional(),
  locale: z.enum(['fr', 'en', 'es']).default('fr'),
  consent: z.literal(true),
  /** Piège à robots : champ invisible pour un humain. Rempli => on répond « ok » sans rien enregistrer. */
  website: z.string().max(200).optional(),
})

const fail = (error: string, status: number) => NextResponse.json({ error }, { status })

/**
 * Home lead capture, with double opt-in. Inserts with the anon role: RLS only allows status='new', consent=true and
 * an unconfirmed lead. A confirmation email carries a one-time link; only the hash of its token is stored.
 */
export async function POST(request: Request) {
  if (rateLimited(`leads:${clientIp(request)}`)) return fail('rate_limited', 429)

  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return fail('invalid_request', 400)
  const { email, destination, whatsapp, locale, consent, website } = parsed.data
  if (website) return NextResponse.json({ ok: true }) // robot : même réponse qu'un succès, rien n'est enregistré

  const { token, hash } = newLeadToken()
  const row = { email, destination: destination || null, whatsapp: whatsapp || null, locale, source: 'home', consent }
  let { error } = await createPublicClient().from('leads').insert({ ...row, confirm_token_hash: hash })
  let tokenStored = !error
  // Migration 013 pas encore appliquée : on enregistre quand même le lead (sans double opt-in) plutôt que de perdre le contact.
  if (error?.code === '42703' || error?.code === 'PGRST204') {
    ;({ error } = await createPublicClient().from('leads').insert(row))
    tokenStored = false
  }

  // 23505 = already registered today: same outcome for the visitor (and no email enumeration).
  if (error && error.code !== '23505') return fail('server_error', 500)

  if (!error && tokenStored) {
    const link = (action: 'confirm' | 'unsubscribe') =>
      `${SITE_URL}/api/leads/confirm?action=${action}&locale=${locale}&token=${token}`
    const mail = leadConfirmation({ lang: locale, confirmUrl: link('confirm'), unsubscribeUrl: link('unsubscribe') })
    await sendEmail({ to: email, ...mail, unsubscribeUrl: link('unsubscribe') })
  }
  return NextResponse.json({ ok: true })
}
