'use client'

import { Link } from '@/lib/i18n/navigation'
import { ChevronLeft } from 'lucide-react'
import { NotificationsList } from '@/components/account/NotificationsList'

export default function NotificationsPage() {
  return (
    <div className="min-h-screen bg-coconut pt-16">
      <div className="max-w-xl mx-auto px-5 py-8 pb-24 space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/profile" className="p-2 rounded-full hover:bg-sand transition-colors text-stone" aria-label="Retour">
            <ChevronLeft size={20} />
          </Link>
          <h1 className="text-2xl font-display text-charcoal">Notifications</h1>
        </div>
        <NotificationsList />
      </div>
    </div>
  )
}
