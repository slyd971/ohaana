import { Link } from '@/lib/i18n/navigation'
import { ChevronLeft, MapPin, Heart, Users, Sparkles } from 'lucide-react'

const TEAM = [
  { name: 'Camille Rosier', role: 'Fondatrice & Concierge', island: 'Guadeloupe', photo: '/photos/masseuse-ingrid.jpeg' },
  { name: 'Marcus Théophile', role: 'Chef & Co-fondateur', island: 'Guadeloupe', photo: '/photos/chef-marcus.jpeg' },
  { name: 'William Desroses', role: 'Photographe partenaire', island: 'Martinique', photo: '/photos/photographe-william.jpeg' },
]

const VALUES = [
  { Icon: MapPin, title: 'Ancrage local', text: 'Chaque prestataire est rencontré en personne. On ne référence pas ce qu\'on ne connaît pas.' },
  { Icon: Heart, title: 'Authenticité d\'abord', text: 'On refuse les expériences formatées. Ohaana, c\'est le meilleur des Antilles, pas un catalogue générique.' },
  { Icon: Users, title: 'Impact direct', text: 'Chaque réservation rémunère un local. Pas d\'intermédiaire opaque entre le voyageur et le prestataire.' },
  { Icon: Sparkles, title: 'Exigence premium', text: 'Service 5 étoiles ne veut pas dire inaccessible. Ça veut dire irréprochable sur les détails qui comptent.' },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-coconut pt-16">
      <div className="max-w-3xl mx-auto px-5 py-10 pb-24">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-stone hover:text-charcoal mb-8">
          <ChevronLeft size={16} /> Retour
        </Link>

        {/* Hero */}
        <div className="mb-12">
          <p className="text-xs text-deep-green font-semibold uppercase tracking-widest mb-3">Notre histoire</p>
          <h1 className="text-3xl md:text-4xl font-display text-charcoal leading-snug mb-5">
            Les Antilles méritaient mieux<br />qu'un simple moteur de recherche.
          </h1>
          <p className="text-base text-stone leading-relaxed max-w-2xl">
            Ohaana est né d'un constat simple : des centaines de prestataires d'exception — chefs créoles, masseurs, photographes, DJs — sont invisibles en ligne et inaccessibles aux voyageurs qui les cherchent. En face, des touristes qui passent à côté des meilleures expériences, coincés sur TripAdvisor ou dans les excursions standardisées de leur hôtel.
          </p>
          <p className="text-base text-stone leading-relaxed max-w-2xl mt-4">
            On a décidé de construire le pont. Une concierge humaine, une plateforme de réservation, et une curation sérieuse. Pas une marketplace de plus — un service de confiance, ancré dans les îles.
          </p>
        </div>

        {/* Values */}
        <div className="mb-14">
          <h2 className="text-xl font-display text-charcoal mb-6">Ce en quoi on croit</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {VALUES.map(({ Icon, title, text }) => (
              <div key={title} className="flex gap-4 p-5 rounded-2xl bg-surface border border-mist">
                <div className="w-9 h-9 rounded-xl bg-sand flex items-center justify-center flex-none">
                  <Icon size={16} className="text-deep-green" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-charcoal mb-1">{title}</p>
                  <p className="text-xs text-stone leading-relaxed">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div className="mb-14">
          <h2 className="text-xl font-display text-charcoal mb-6">L'équipe</h2>
          <div className="grid sm:grid-cols-3 gap-5">
            {TEAM.map(({ name, role, island, photo }) => (
              <div key={name} className="text-center space-y-3">
                <div className="w-20 h-20 rounded-full overflow-hidden mx-auto border-2 border-mist">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo} alt={name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-charcoal">{name}</p>
                  <p className="text-xs text-stone">{role}</p>
                  <p className="text-xs text-deep-green/70 flex items-center justify-center gap-1 mt-0.5">
                    <MapPin size={10} /> {island}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-2xl bg-deep-green px-7 py-8 text-center space-y-4">
          <p className="text-xs text-coconut/50 uppercase tracking-widest">Rejoignez l'aventure</p>
          <h2 className="text-xl font-display text-coconut">Vous êtes prestataire aux Antilles ?</h2>
          <p className="text-sm text-coconut/60 leading-relaxed max-w-sm mx-auto">
            On cherche des chefs, masseurs, photographes, DJs et coaches qui veulent accéder à une clientèle premium sans gérer le marketing.
          </p>
          <Link
            href="/register?role=provider"
            className="inline-flex items-center gap-2 bg-coral text-coconut px-6 py-3 rounded-full text-sm font-medium hover:bg-coral-light transition-colors"
          >
            Rejoindre Ohaana
          </Link>
        </div>
      </div>
    </div>
  )
}
