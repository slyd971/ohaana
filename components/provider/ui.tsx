import { AlertCircle, Clock3, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ProviderRow } from '@/lib/provider/context'

export const inputClass =
  'w-full rounded-xl border border-mist bg-white px-3.5 py-2.5 text-sm text-charcoal placeholder:text-stone/50 focus:outline-none focus:ring-2 focus:ring-deep-green/30 focus:border-deep-green/40'

export function Field({
  label,
  hint,
  error,
  htmlFor,
  children,
}: {
  label: string
  hint?: string
  error?: string
  htmlFor: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-xs font-semibold text-charcoal">
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-[11px] text-stone">{hint}</p>}
      {error && (
        <p role="alert" className="text-[11px] text-[#C0392B]">
          {error}
        </p>
      )}
    </div>
  )
}

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  draft: { label: 'Brouillon', className: 'bg-sand text-stone' },
  pending_review: { label: 'En relecture', className: 'bg-[#F5A623]/15 text-[#B7791F]' },
  published: { label: 'Publié', className: 'bg-turquoise/10 text-turquoise' },
  rejected: { label: 'Refusé', className: 'bg-coral/10 text-coral' },
  archived: { label: 'Archivé', className: 'bg-mist text-stone' },
  pending: { label: 'Paiement en attente', className: 'bg-[#F5A623]/15 text-[#B7791F]' },
  confirmed: { label: 'Confirmée', className: 'bg-turquoise/10 text-turquoise' },
  completed: { label: 'Terminée', className: 'bg-deep-green/10 text-deep-green' },
  cancelled_tourist: { label: 'Annulée par le voyageur', className: 'bg-mist text-stone' },
  cancelled_provider: { label: 'Annulée par vous', className: 'bg-mist text-stone' },
  disputed: { label: 'Litige', className: 'bg-coral/10 text-coral' },
  expired: { label: 'Expirée', className: 'bg-mist text-stone' },
}

export function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLES[status] ?? { label: status, className: 'bg-mist text-stone' }
  return <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap', s.className)}>{s.label}</span>
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-display text-deep-green">{title}</h1>
        {subtitle && <p className="text-stone text-sm mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

export function EmptyState({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="bg-coconut rounded-2xl border border-dashed border-mist p-8 text-center space-y-2">
      <p className="text-sm font-semibold text-charcoal">{title}</p>
      {children && <div className="text-xs text-stone">{children}</div>}
    </div>
  )
}

/** Rappel permanent : un prestataire non approuvé peut préparer ses fiches mais pas les publier. */
export function ApprovalBanner({ provider }: { provider: ProviderRow }) {
  if (provider.is_approved) {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-turquoise/10 text-turquoise px-4 py-2.5 text-xs font-medium">
        <ShieldCheck size={14} /> Compte approuvé : vos fiches validées sont visibles sur le site.
      </div>
    )
  }
  return (
    <div className="flex items-start gap-2 rounded-xl bg-[#F5A623]/10 text-[#8A5A00] px-4 py-3 text-xs">
      <Clock3 size={14} className="mt-0.5 flex-none" />
      <p>
        <strong>Dossier en cours de validation.</strong> Vous pouvez préparer et soumettre vos fiches, elles seront
        publiées dès que notre équipe aura approuvé votre compte.
      </p>
    </div>
  )
}

export function SignInRequired({ kind }: { kind: 'anonymous' | 'no_profile' }) {
  return (
    <div className="p-5 md:p-8 max-w-xl">
      <div className="bg-coconut rounded-2xl border border-mist p-6 space-y-2">
        <div className="flex items-center gap-2 text-deep-green">
          <AlertCircle size={16} />
          <h1 className="text-lg font-display">
            {kind === 'anonymous' ? 'Connexion requise' : 'Profil prestataire introuvable'}
          </h1>
        </div>
        <p className="text-sm text-stone">
          {kind === 'anonymous'
            ? 'Connectez-vous avec votre compte prestataire pour accéder à cet espace.'
            : 'Votre compte n’a pas encore de profil prestataire. Inscrivez-vous via « Devenir prestataire » pour le créer.'}
        </p>
      </div>
    </div>
  )
}

export function eur(cents: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(cents / 100)
}

export function formatDateTimeFr(iso: string | null): string {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Guadeloupe',
  }).format(new Date(iso))
}
