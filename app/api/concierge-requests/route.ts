import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { clientIp, rateLimited } from '@/lib/rate-limit'

const bodySchema = z.object({
  message: z.string().trim().min(1).max(1000),
  stayDates: z.string().trim().max(100).optional(),
  location: z.string().trim().max(150).optional(),
  contact: z.string().trim().min(3).max(254),
  locale: z.enum(['fr', 'en', 'es']).default('fr'),
})

const fail = (error: string, status: number) => NextResponse.json({ error }, { status })

/**
 * Concierge page request. Inserted with the visitor's own session (anon or signed-in): RLS only allows
 * status='new' and a user_id that is null or the caller's. Only admins can read the rows back.
 */
export async function POST(request: Request) {
  if (rateLimited(`concierge:${clientIp(request)}`)) return fail('rate_limited', 429)

  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return fail('invalid_request', 400)
  const { message, stayDates, location, contact, locale } = parsed.data

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase.from('concierge_requests').insert({
    user_id: user?.id ?? null,
    message,
    stay_dates: stayDates || null,
    location: location || null,
    contact,
    locale,
  })
  if (error) return fail('server_error', 500)
  return NextResponse.json({ ok: true })
}
