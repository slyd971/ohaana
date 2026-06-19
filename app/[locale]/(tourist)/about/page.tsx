import { Link } from '@/lib/i18n/navigation'
import { ChevronLeft, MapPin, Heart, Users, Sparkles } from 'lucide-react'

const TEAM = [
  { name: 'Camille Rosier', role: 'Fondatrice & Concierge', island: 'Guadeloupe', photo: '/photos/masseuse-ingrid.jpeg' },
  { name: 'Marcus Théophile', role: 'Chef & Co-fondateur', island: 'Guadeloupe', photo: '/photos/chef-marcus.jpeg' },
  { name: 'William Desroses', role: 'Photographe partenaire', island: 'Martinique', photo: '/photos/photographe-william.jpeg' },
]

const VALUES = [
  { Icon: MapPin, title: 'Ancrage local', text: 'Nous sélectionnons des professionnels qui connaissent leur territoire et se déplacent sur les lieux de séjour.' },
  { Icon: Heart, title: 'Confiance d\'abord', text: 'Ohaana remplace les recommandations dispersées par une sélection vérifiée, lisible et réservable.' },
  { Icon: Users, title: 'Pensé pour les voyageurs', text: 'Villa, bungalow, Airbnb ou maison de vacances : le service vient au voyageur, pas l\'inverse.' },
  { Icon: Sparkles, title: 'Service sans friction', text: 'Comparer, choisir et réserver doit prendre quelques minutes, pas une série de messages WhatsApp.' },
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
            Le concierge digital<br />des hébergements privatifs.
          </h1>
          <p className="text-base text-stone leading-relaxed max-w-2xl">
            Ohaana permet aux voyageurs en hébergement privatif de réserver facilement les meilleurs services locaux directement sur leur lieu de séjour : massage à domicile, chef privé, photographe, DJ, coach sportif, baby-sitter ou expériences sur mesure.
          </p>
          <p className="text-base text-stone leading-relaxed max-w-2xl mt-4">
            Contrairement aux hôtels qui disposent déjà d&apos;un concierge, les voyageurs en villa, bungalow, Airbnb ou maison de vacances doivent souvent s&apos;appuyer sur le bouche-à-oreille, WhatsApp ou des recommandations dispersées. Notre rôle est de centraliser ces services dans une seule application, avec des professionnels vérifiés et disponibles pendant les vacances.
          </p>
          <p className="text-base text-stone leading-relaxed max-w-2xl mt-4">
            Notre ambition est simple : devenir le concierge digital des hébergements privatifs dans les Caraïbes, puis dans les destinations touristiques où l&apos;accès aux services reste fragmenté.
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
          <h2 className="text-xl font-display text-charcoal mb-6">L&apos;équipe</h2>
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
          <p className="text-xs text-coconut/50 uppercase tracking-widest">Rejoignez l&apos;aventure</p>
          <h2 className="text-xl font-display text-coconut">Vous êtes prestataire aux Antilles ?</h2>
          <p className="text-sm text-coconut/60 leading-relaxed max-w-sm mx-auto">
            Ohaana connecte les professionnels locaux à des voyageurs déjà sur place, qui cherchent un service fiable pendant leur séjour.
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
