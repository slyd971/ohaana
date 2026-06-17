'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getDemoRole, setDemoRole, type DemoRole } from '@/lib/demo-auth'
import { User, Briefcase, Handshake, LogOut, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

export function DemoBadge() {
  const [role, setRole] = useState<DemoRole>(null)
  const [open, setOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setRole(getDemoRole())
    function onStorage(e: StorageEvent) {
      if (e.key === 'ohaana_demo_role') setRole(getDemoRole())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  if (!role) return null

  function switchTo(r: DemoRole) {
    setDemoRole(r)
    setRole(r)
    setOpen(false)
    if (r === 'provider') router.push('/provider/dashboard')
    else if (r === 'partner') router.push('/partner/dashboard')
    else if (r === 'client') router.push('/voyages')
  }

  function logout() {
    setDemoRole(null)
    setRole(null)
    setOpen(false)
    router.push('/')
  }

  return (
    <div className="fixed bottom-24 md:bottom-6 left-4 z-[90]">
      {/* Menu */}
      {open && (
        <div className="mb-2 bg-charcoal rounded-2xl overflow-hidden shadow-elevated border border-white/10 min-w-[200px]">
          <p className="text-[10px] text-coconut/40 uppercase tracking-widest px-4 pt-3 pb-1">Mode démo</p>

          <button
            onClick={() => switchTo('client')}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors hover:bg-white/10',
              role === 'client' ? 'text-turquoise' : 'text-coconut/70'
            )}
          >
            <User size={15} />
            Parcours Client
            {role === 'client' && <span className="ml-auto text-[10px] bg-turquoise/20 text-turquoise px-1.5 py-0.5 rounded-full">actif</span>}
          </button>

          <button
            onClick={() => switchTo('provider')}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors hover:bg-white/10',
              role === 'provider' ? 'text-turquoise' : 'text-coconut/70'
            )}
          >
            <Briefcase size={15} />
            Parcours Prestataire
            {role === 'provider' && <span className="ml-auto text-[10px] bg-turquoise/20 text-turquoise px-1.5 py-0.5 rounded-full">actif</span>}
          </button>

          <button
            onClick={() => switchTo('partner')}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors hover:bg-white/10',
              role === 'partner' ? 'text-turquoise' : 'text-coconut/70'
            )}
          >
            <Handshake size={15} />
            Parcours Partenaire
            {role === 'partner' && <span className="ml-auto text-[10px] bg-turquoise/20 text-turquoise px-1.5 py-0.5 rounded-full">actif</span>}
          </button>

          <div className="h-px bg-white/10 mx-4" />

          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-coral/80 hover:text-coral transition-colors hover:bg-white/10"
          >
            <LogOut size={15} />
            Quitter le mode démo
          </button>

          <div className="pb-2" />
        </div>
      )}

      {/* Trigger chip */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 bg-charcoal text-coconut rounded-full px-3.5 py-2 text-xs font-semibold shadow-elevated border border-white/10 hover:bg-charcoal/90 transition-colors"
      >
        {role === 'client' ? <User size={13} /> : role === 'partner' ? <Handshake size={13} /> : <Briefcase size={13} />}
        Demo · {role === 'client' ? 'Client' : role === 'partner' ? 'Partenaire' : 'Prestataire'}
        <ChevronUp size={12} className={cn('transition-transform', open && 'rotate-180')} />
      </button>
    </div>
  )
}
