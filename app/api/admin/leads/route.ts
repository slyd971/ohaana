import { getAdminContext } from '@/lib/admin/context'

/** Export CSV des leads, réservé aux administrateurs (lu avec la session de l'admin, sous RLS). */
export async function GET() {
  const ctx = await getAdminContext()
  if (ctx.kind !== 'admin') return new Response('Forbidden', { status: 403 })

  const { data, error } = await ctx.supabase
    .from('leads')
    .select('created_at, email, destination, whatsapp, locale, source, status')
    .order('created_at', { ascending: false })
    .limit(5000)
  if (error) return new Response('Export impossible', { status: 500 })

  // Une cellule qui commence par = + - @ serait interprétée comme une formule par un tableur : on la neutralise.
  const cell = (value: unknown) => {
    let s = value == null ? '' : String(value)
    if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`
    return `"${s.replace(/"/g, '""')}"`
  }
  const header = ['date', 'email', 'destination', 'whatsapp', 'langue', 'source', 'statut']
  const lines = (data ?? []).map((r) => [r.created_at, r.email, r.destination, r.whatsapp, r.locale, r.source, r.status].map(cell).join(','))
  const csv = '﻿' + [header.join(','), ...lines].join('\r\n')

  return new Response(csv, {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="leads-${new Date().toISOString().slice(0, 10)}.csv"`,
      'cache-control': 'no-store',
    },
  })
}
