import { timingSafeEqual } from 'node:crypto'
import { NextResponse } from 'next/server'
import { hasServiceRole } from '@/lib/supabase/server'
import { runDailyJobs } from '@/lib/email/events'

export const dynamic = 'force-dynamic'

/** Comparaison en temps constant du jeton fourni par Vercel Cron (en-tête Authorization: Bearer <CRON_SECRET>). */
function authorised(request: Request): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  const given = request.headers.get('authorization') ?? ''
  const expected = `Bearer ${secret}`
  const a = Buffer.from(given)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

/**
 * Tâche quotidienne (vercel.json) : expiration des réservations non payées, rappels J-1, demandes d'avis J+1.
 * Sans CRON_SECRET la route refuse tout : elle ne s'exécute jamais « ouverte ».
 */
export async function GET(request: Request) {
  if (!authorised(request)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  if (!hasServiceRole()) return NextResponse.json({ error: 'not_configured' }, { status: 503 })
  try {
    return NextResponse.json({ ok: true, ...(await runDailyJobs()) })
  } catch (error) {
    console.error('[cron] daily failed:', error instanceof Error ? error.message : error)
    return NextResponse.json({ error: 'failed' }, { status: 500 })
  }
}
