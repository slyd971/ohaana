import { ChevronLeft } from 'lucide-react'
import { Link } from '@/lib/i18n/navigation'
import { LEGAL_DRAFT, LEGAL_VERSIONS, type LegalDocument as DocKey } from '@/lib/legal/versions'
import type { SeoLocale } from '@/lib/seo'

export interface LegalSection {
  title: string
  paragraphs?: string[]
  items?: string[]
}

const NOTICE: Record<SeoLocale, string> = {
  fr: '',
  en: 'This document is provided in French, which is the legally binding version. A courtesy translation will be added once the French text is validated.',
  es: 'Este documento se ofrece en francés, que es la versión jurídicamente vinculante. Se añadirá una traducción de cortesía cuando se valide el texto francés.',
}

const DRAFT: string =
  'Document en cours de validation juridique. Il décrit le fonctionnement actuel de la plateforme et peut évoluer avant l’ouverture au public.'

export function LegalDocumentPage({
  locale,
  doc,
  title,
  intro,
  sections,
}: {
  locale: SeoLocale
  doc: DocKey | null
  title: string
  intro?: string
  sections: LegalSection[]
}) {
  const version = doc ? LEGAL_VERSIONS[doc] : null
  return (
    <div className="min-h-screen bg-coconut pt-16">
      <div className="max-w-2xl mx-auto px-5 py-10 pb-24">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-stone hover:text-charcoal mb-8">
          <ChevronLeft size={16} /> Retour
        </Link>

        <h1 className="text-3xl font-display text-charcoal mb-2">{title}</h1>
        {version && <p className="text-sm text-stone mb-6">Version du {new Date(`${version}T12:00:00Z`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>}

        {LEGAL_DRAFT && (
          <p role="note" className="mb-6 rounded-card border border-amber-300/60 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">{DRAFT}</p>
        )}
        {NOTICE[locale] && <p role="note" className="mb-6 rounded-card border border-mist bg-surface px-4 py-3 text-xs text-stone">{NOTICE[locale]}</p>}
        {intro && <p className="mb-8 text-sm leading-relaxed text-charcoal-soft">{intro}</p>}

        <div className="space-y-8 text-sm text-charcoal-soft leading-relaxed" lang="fr">
          {sections.map((s, i) => (
            <section key={s.title}>
              <h2 className="text-lg font-semibold text-charcoal mb-3">{i + 1}. {s.title}</h2>
              {s.paragraphs?.map((p) => <p key={p} className="mb-2">{p}</p>)}
              {s.items && (
                <ul className="mt-2 space-y-1.5 list-disc list-inside">
                  {s.items.map((it) => <li key={it}>{it}</li>)}
                </ul>
              )}
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
