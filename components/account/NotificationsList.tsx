'use client'

import { useLocale } from 'next-intl'
import { Button } from '@/components/ui/Button'
import { Bell, CheckCheck } from 'lucide-react'
import { Link } from '@/lib/i18n/navigation'
import { cn } from '@/lib/utils'
import { useNotifications } from '@/hooks/useNotifications'

export function NotificationsList() {
  const locale = useLocale()
  const { items, loading, error, unread, markRead } = useNotifications()

  if (loading) return <p className="py-10 text-center text-sm text-stone" role="status">Chargement…</p>
  if (error) return <p role="alert" className="py-6 text-sm text-coral-text">Impossible de charger vos notifications.</p>

  if (items.length === 0) {
    return (
      <div className="py-14 text-center space-y-2">
        <Bell className="mx-auto text-stone" size={28} />
        <p className="font-medium text-charcoal">Aucune notification</p>
        <p className="text-sm text-stone">Vous serez prévenu ici de l’avancement de vos réservations.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {unread > 0 && (
        <Button variant="link" size="bare" type="button" onClick={() => void markRead(items.filter((n) => !n.is_read).map((n) => n.id))} className="text-xs">
          <CheckCheck size={14} /> Tout marquer comme lu ({unread})
        </Button>
      )}
      <ul className="divide-y divide-mist overflow-hidden rounded-card border border-mist bg-surface">
        {items.map((n) => {
          const title = locale === 'en' ? (n.title_en ?? n.title_fr) : n.title_fr
          const body = locale === 'en' ? (n.body_en ?? n.body_fr) : n.body_fr
          const href = typeof n.payload?.booking_id === 'string' ? '/voyages' : null
          const content = (
            <div className="flex items-start gap-3 px-4 py-3.5">
              <span className={cn('mt-1.5 h-2 w-2 flex-none rounded-full', n.is_read ? 'bg-transparent' : 'bg-turquoise')} aria-hidden />
              <div className="min-w-0 flex-1">
                <p className={cn('text-sm', n.is_read ? 'text-charcoal-soft' : 'font-medium text-charcoal')}>{title}</p>
                {body && <p className="mt-0.5 text-xs text-stone">{body}</p>}
                <p className="mt-1 text-[11px] text-stone">
                  {new Date(n.created_at).toLocaleString(locale === 'en' ? 'en-GB' : locale === 'es' ? 'es-ES' : 'fr-FR', { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
              </div>
            </div>
          )
          return (
            <li key={n.id} onClick={() => { if (!n.is_read) void markRead([n.id]) }} className="cursor-default">
              {href ? <Link href={href}>{content}</Link> : content}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
