import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createPublicClient } from '@/lib/supabase/public'

const bodySchema = z.object({
  email: z.string().trim().max(254).pipe(z.email()),
  destination: z.string().trim().max(100).optional(),
  whatsapp: z.string().trim().max(30).optional(),
  locale: z.enum(['fr', 'en', 'es']).default('fr'),
  consent: z.literal(true),
})

// Best-effort, per-instance throttle (the DB also allows a single lead per email per day).
const WINDOW_MS = 10 * 60_000
const MAX_PER_WINDOW = 5
const hits = new Map<string, number[]>()

function tooMany(ip: string) {
  const now = Date.now()
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS)
  recent.push(now)
  hits.set(ip, recent)
  if (hits.size > 5000) hits.clear()
  return recent.length > MAX_PER_WINDOW
}

const fail = (error: string, status: number) => NextResponse.json({ error }, { status })

/** Home lead capture. Inserts with the anon role: RLS only allows status='new' and consent=true. */
export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (tooMany(ip)) return fail('rate_limited', 429)

  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return fail('invalid_request', 400)
  const { email, destination, whatsapp, locale, consent } = parsed.data

  const { error } = await createPublicClient()
    .from('leads')
    .insert({ email, destination: destination || null, whatsapp: whatsapp || null, locale, source: 'home', consent })

  // 23505 = already registered today: same outcome for the visitor (and no email enumeration).
  if (error && error.code !== '23505') return fail('server_error', 500)
  return NextResponse.json({ ok: true })
}
