import { notFound } from 'next/navigation'
import { Button, Badge, Card, Alert, IconButton, Input, Textarea } from '@/components/ui'
import { Heart } from 'lucide-react'

export const metadata = { title: 'Design system — Ohaana', robots: { index: false, follow: false } }

// Guide de style vivant. Réservé au développement : 404 en production.
const COLORS = [
  { name: 'deep-green', cls: 'bg-deep-green', use: 'Primaire, titres, CTA' },
  { name: 'coral-text', cls: 'bg-coral-text', use: 'CTA secondaire, texte corail' },
  { name: 'coral', cls: 'bg-coral', use: 'Accent décoratif (pas pour du texte)' },
  { name: 'turquoise-text', cls: 'bg-turquoise-text', use: 'Texte/eyebrow turquoise' },
  { name: 'turquoise', cls: 'bg-turquoise', use: 'Fonds, pastilles, focus' },
  { name: 'sand', cls: 'bg-sand', use: 'Fond secondaire' },
  { name: 'coconut', cls: 'bg-coconut border border-mist', use: 'Fond de page' },
  { name: 'mist', cls: 'bg-mist', use: 'Bordures, séparateurs' },
  { name: 'stone', cls: 'bg-stone', use: 'Texte secondaire (AA)' },
  { name: 'charcoal', cls: 'bg-charcoal', use: 'Texte principal' },
  { name: 'star', cls: 'bg-star', use: 'Notes, avertissements' },
  { name: 'danger', cls: 'bg-danger', use: 'Erreurs, actions destructives' },
]

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="font-display text-2xl text-deep-green">{title}</h2>
      {children}
    </section>
  )
}

export default function DesignPage() {
  if (process.env.NODE_ENV === 'production') notFound()

  return (
    <main className="mx-auto max-w-4xl space-y-14 px-5 pb-24 pt-28 md:px-8">
      <header className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-turquoise-text">Design system</p>
        <h1 className="font-display text-4xl text-deep-green md:text-5xl">Ohaana UI</h1>
        <p className="max-w-xl text-charcoal/70">Tokens et composants partagés. Source : <code>app/globals.css</code> et <code>components/ui</code>. Règles : <code>docs/DESIGN-SYSTEM.md</code>.</p>
      </header>

      <Section title="Couleurs">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {COLORS.map((c) => (
            <div key={c.name} className="space-y-2">
              <div className={`h-16 rounded-control ${c.cls}`} />
              <p className="text-sm font-medium text-charcoal">{c.name}</p>
              <p className="text-xs text-stone">{c.use}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Typographie">
        <Card className="space-y-3">
          <p className="font-display text-5xl text-deep-green">Titre display</p>
          <p className="font-display text-3xl text-deep-green">Titre de section</p>
          <p className="text-base text-charcoal">Corps de texte (Inter 16px). Planifiez une expérience sur mesure en quelques clics.</p>
          <p className="text-sm text-stone">Texte secondaire (14px, stone).</p>
          <p className="text-xs text-stone">Légende (12px, plancher minimal — jamais en dessous).</p>
        </Card>
      </Section>

      <Section title="Boutons">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Primary</Button>
          <Button variant="coral">Coral</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button loading>Chargement</Button>
          <Button disabled>Désactivé</Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm">Small (44px)</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
          <IconButton label="Ajouter aux favoris" variant="surface"><Heart size={18} /></IconButton>
        </div>
      </Section>

      <Section title="Badges & alertes">
        <div className="flex flex-wrap gap-2">
          {(['default', 'green', 'coral', 'turquoise', 'stone', 'warning', 'danger'] as const).map((v) => (
            <Badge key={v} variant={v}>{v}</Badge>
          ))}
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <Alert tone="info">Information neutre.</Alert>
          <Alert tone="success">Réservation confirmée.</Alert>
          <Alert tone="warning">Paiement en attente.</Alert>
          <Alert tone="danger">Une erreur est survenue.</Alert>
        </div>
      </Section>

      <Section title="Formulaires">
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Nom" placeholder="Camille" hint="Tel qu'il apparaît sur la réservation" />
          <Input label="Email" placeholder="vous@exemple.fr" error="Adresse invalide" />
          <div className="md:col-span-2"><Textarea label="Message" placeholder="Précisez vos envies…" /></div>
        </div>
      </Section>

      <Section title="Cartes & rayons">
        <div className="grid gap-4 md:grid-cols-3">
          <Card><p className="font-medium">Card</p><p className="text-sm text-stone">rounded-card (16px)</p></Card>
          <Card interactive tone="sand"><p className="font-medium">Card interactive</p><p className="text-sm text-stone">ombre au survol</p></Card>
          <div className="space-y-2 rounded-control bg-deep-green p-5 text-coconut"><p className="font-medium">Contrôle</p><p className="text-sm text-coconut/70">rounded-control (12px)</p></div>
        </div>
        <p className="text-sm text-stone">Pastilles et avatars : <code>rounded-full</code>.</p>
      </Section>
    </main>
  )
}
