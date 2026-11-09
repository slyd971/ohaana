import { COMPANY, orToComplete } from '../company'
import type { LegalSection } from '@/components/legal/LegalDocument'

// Mentions légales (article 6 de la LCEN). Les informations de la société ne sont jamais inventées :
// renseignez les variables NEXT_PUBLIC_COMPANY_* (voir lib/legal/company.ts).

export const legalNoticeSections = (): LegalSection[] => [
  {
    title: 'Éditeur du site',
    items: [
      `Dénomination : ${orToComplete(COMPANY.name)}`,
      `Forme juridique : ${orToComplete(COMPANY.legalForm)}${COMPANY.capital ? `, capital de ${COMPANY.capital}` : ''}`,
      `SIREN : ${orToComplete(COMPANY.siren)}${COMPANY.rcs ? ` · ${COMPANY.rcs}` : ''}`,
      `TVA intracommunautaire : ${orToComplete(COMPANY.vat)}`,
      `Siège social : ${orToComplete(COMPANY.address)}`,
      `Directeur de la publication : ${orToComplete(COMPANY.publisher)}`,
      `Contact : ${COMPANY.contactEmail}${COMPANY.phone ? ` · ${COMPANY.phone}` : ''}`,
    ],
  },
  {
    title: 'Hébergement',
    items: [
      'Site : Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis.',
      'Base de données et authentification : Supabase Inc.',
    ],
  },
  {
    title: 'Propriété intellectuelle',
    paragraphs: ['La marque Ohaana, le Site et ses éléments propres sont protégés. Toute reproduction sans autorisation est interdite. Les contenus des prestataires restent leur propriété.'],
  },
  {
    title: 'Données personnelles',
    paragraphs: [`Voir la politique de confidentialité. Contact pour l’exercice de vos droits : ${COMPANY.privacyEmail}.`],
  },
  {
    title: 'Médiation de la consommation',
    paragraphs: ['Les coordonnées du médiateur de la consommation sont indiquées dans les conditions générales d’utilisation.'],
  },
]
