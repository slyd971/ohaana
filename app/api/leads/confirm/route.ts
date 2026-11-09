import { NextResponse } from 'next/server'
import { createPublicClient } from '@/lib/supabase/public'
import { hashLeadToken, isLeadToken } from '@/lib/email/lead-token'
import { clientIp, rateLimited } from '@/lib/rate-limit'
import { SITE_URL } from '@/lib/site'

/** Lien reçu par email : confirme (double opt-in) ou désinscrit, puis redirige vers une page d'information. */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const locale = ['en', 'es'].includes(url.searchParams.get('locale') ?? '') ? url.searchParams.get('locale')! : 'fr'
  const base = `${SITE_URL}${locale === 'fr' ? '' : `/${locale}`}/inscription`
  const redirect = (status: string) => NextResponse.redirect(`${base}?status=${status}`, 303)

  if (rateLimited(`lead-confirm:${clientIp(request)}`, 20)) return redirect('invalid')
  const token = url.searchParams.get('token')
  if (!isLeadToken(token)) return redirect('invalid')

  const action = url.searchParams.get('action') === 'unsubscribe' ? 'unsubscribe' : 'confirm'
  const { data, error } = await createPublicClient().rpc(action === 'confirm' ? 'confirm_lead' : 'unsubscribe_lead', {
    p_hash: hashLeadToken(token),
  })
  if (error || data !== true) return redirect('invalid')
  return redirect(action === 'confirm' ? 'confirmed' : 'unsubscribed')
}
