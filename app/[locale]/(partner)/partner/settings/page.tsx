import { User, MapPin, Bell, Lock, Globe } from 'lucide-react'

const SECTIONS = [
  {
    title: 'Profil partenaire',
    Icon: User,
    fields: [
      { label: 'Nom de la structure', value: 'Conciergerie Les Îles Dorées' },
      { label: 'Type de partenaire',  value: 'Conciergerie de villas'       },
      { label: 'Contact',             value: 'Isabelle Martin'               },
      { label: 'Téléphone',           value: '+590 690 012 345'              },
    ],
  },
  {
    title: 'Zone d\'activité',
    Icon: MapPin,
    fields: [
      { label: 'Île principale', value: 'Guadeloupe'                         },
      { label: 'Zones couvertes', value: 'Gosier, Sainte-Anne, Saint-François' },
    ],
  },
  {
    title: 'Langue & région',
    Icon: Globe,
    fields: [
      { label: 'Langue', value: 'Français' },
      { label: 'Devise', value: 'EUR (€)'  },
    ],
  },
  {
    title: 'Notifications',
    Icon: Bell,
    fields: [
      { label: 'Nouvelles réservations générées', value: 'Email + SMS' },
      { label: 'Virements effectués',             value: 'Email'       },
    ],
  },
  {
    title: 'Sécurité',
    Icon: Lock,
    fields: [
      { label: 'Email',         value: 'partner@demo.ohaana.com' },
      { label: 'Mot de passe',  value: '••••••••'                },
    ],
  },
]

export default function PartnerSettingsPage() {
  return (
    <div className="p-5 md:p-8 space-y-5 max-w-2xl">
      <h1 className="text-2xl font-display text-deep-green">Paramètres</h1>

      {SECTIONS.map(({ title, Icon, fields }) => (
        <div key={title} className="bg-coconut rounded-2xl border border-mist overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-mist">
            <Icon size={15} className="text-deep-green" />
            <h2 className="text-sm font-semibold text-charcoal">{title}</h2>
          </div>
          <div className="divide-y divide-mist">
            {fields.map((f) => (
              <div key={f.label} className="flex items-center justify-between px-5 py-3.5 gap-3">
                <p className="text-xs text-stone flex-none">{f.label}</p>
                <p className="text-sm text-charcoal text-right truncate">{f.value}</p>
              </div>
            ))}
          </div>
          <div className="px-5 py-3 border-t border-mist">
            <button type="button" className="text-xs text-deep-green hover:underline">Modifier</button>
          </div>
        </div>
      ))}
    </div>
  )
}
