import type { SeoLocale } from '@/lib/seo'
import type { CategoryInfo, IslandInfo } from './editorial'

// Construction des textes des pages « île » et « île / catégorie » : un gabarit commun, des variables réelles
// (nombre de services, prix minimum) et les blocs éditoriaux de editorial.ts. Fonction pure : testable sans base.

export interface LandingContent {
  h1: string
  title: string
  description: string
  paragraphs: string[]
  faq: { q: string; a: string }[]
}

export interface LandingData {
  locale: SeoLocale
  island: IslandInfo
  category?: CategoryInfo | null
  count: number
  /** Prix minimum déjà formaté (« 80 € »), absent s'il n'y a aucun service. */
  minPrice?: string | null
  /** Noms des catégories disponibles sur l'île (page île uniquement). */
  categoryNames?: string[]
}

const join = (items: string[], locale: SeoLocale) => {
  if (items.length <= 1) return items.join('')
  const and = { fr: ' et ', en: ' and ', es: ' y ' }[locale]
  return `${items.slice(0, -1).join(', ')}${and}${items[items.length - 1]}`
}

const HOW: Record<SeoLocale, string> = {
  fr: 'Le principe est simple : vous choisissez un service et un créneau, vous payez en ligne de façon sécurisée, et le prestataire se déplace à votre hébergement. Chaque fiche indique la durée, le nombre de participants, la zone de déplacement et la politique d’annulation avant tout paiement.',
  en: 'The principle is simple: you pick a service and a time slot, pay securely online, and the provider travels to your accommodation. Each listing shows the duration, number of guests, travel area and cancellation policy before you pay anything.',
  es: 'El principio es sencillo: eliges un servicio y un horario, pagas en línea de forma segura y el profesional se desplaza a tu alojamiento. Cada ficha indica la duración, el número de participantes, la zona de desplazamiento y la política de cancelación antes de pagar nada.',
}

const TIP: Record<SeoLocale, string> = {
  fr: 'Réserver à l’avance est conseillé en haute saison, de décembre à avril, et pour les week-ends : les créneaux les plus demandés partent vite. Précisez au moment de la réservation vos besoins particuliers (allergies, accès au logement, nombre d’invités) pour que le prestataire prépare au mieux sa venue.',
  en: 'Booking ahead is advisable in high season, from December to April, and for weekends: the most popular slots go quickly. When you book, mention any special needs (allergies, access to the property, number of guests) so the provider can prepare their visit properly.',
  es: 'Conviene reservar con antelación en temporada alta, de diciembre a abril, y para los fines de semana: los horarios más solicitados se agotan rápido. Al reservar, indica tus necesidades particulares (alergias, acceso al alojamiento, número de invitados) para que el profesional prepare mejor su visita.',
}

const AREAS = (areas: string[], locale: SeoLocale) =>
  ({
    fr: `Parmi les secteurs courants : ${join(areas, 'fr')}. Vérifiez toujours la zone de déplacement indiquée sur la fiche du prestataire.`,
    en: `Common areas include ${join(areas, 'en')}. Always check the travel area shown on the provider’s listing.`,
    es: `Entre las zonas habituales están ${join(areas, 'es')}. Comprueba siempre la zona de desplazamiento indicada en la ficha del profesional.`,
  })[locale]

function faq(d: LandingData, label: string): { q: string; a: string }[] {
  const { locale, island, count, minPrice } = d
  const where = island.in[locale]
  const priced = count > 0 && minPrice
  return [
    {
      q: { fr: `Comment réserver : ${label} ${where} ?`, en: `How do I book: ${label} ${where}?`, es: `¿Cómo reservar: ${label} ${where}?` }[locale],
      a: {
        fr: 'Choisissez un service, sélectionnez la date et l’heure parmi les créneaux proposés, puis payez en ligne. Vous recevez une confirmation par email et le prestataire est prévenu immédiatement.',
        en: 'Pick a service, select a date and time from the available slots, then pay online. You receive an email confirmation and the provider is notified straight away.',
        es: 'Elige un servicio, selecciona la fecha y la hora entre los horarios disponibles y paga en línea. Recibes una confirmación por email y el profesional es avisado de inmediato.',
      }[locale],
    },
    {
      q: { fr: 'Quel est le prix ?', en: 'How much does it cost?', es: '¿Cuál es el precio?' }[locale],
      a: priced
        ? {
            fr: `Les tarifs commencent à partir de ${minPrice}. Le prix affiché sur chaque fiche est le prix que vous payez, sans frais supplémentaires.`,
            en: `Prices start from ${minPrice}. The price shown on each listing is the price you pay, with no extra fees.`,
            es: `Los precios empiezan desde ${minPrice}. El precio que aparece en cada ficha es el que pagas, sin gastos adicionales.`,
          }[locale]
        : {
            fr: 'Le prix est indiqué sur chaque fiche. C’est le prix que vous payez, sans frais supplémentaires.',
            en: 'The price is shown on each listing. It is the price you pay, with no extra fees.',
            es: 'El precio figura en cada ficha. Es el precio que pagas, sin gastos adicionales.',
          }[locale],
    },
    {
      q: { fr: 'Puis-je annuler ?', en: 'Can I cancel?', es: '¿Puedo cancelar?' }[locale],
      a: {
        fr: 'Oui, selon la politique d’annulation du service, affichée avant le paiement. Si le prestataire annule, vous êtes remboursé intégralement.',
        en: 'Yes, according to the service’s cancellation policy, shown before you pay. If the provider cancels, you are refunded in full.',
        es: 'Sí, según la política de cancelación del servicio, que se muestra antes de pagar. Si el profesional cancela, se te reembolsa íntegramente.',
      }[locale],
    },
    {
      q: { fr: 'Le prestataire vient-il à mon hébergement ?', en: 'Does the provider come to my accommodation?', es: '¿El profesional va a mi alojamiento?' }[locale],
      a: {
        fr: 'Oui, c’est le principe d’Ohaana : le prestataire se déplace dans sa zone d’intervention, précisée sur la fiche, que vous séjourniez en villa, en gîte, en bungalow ou en location de vacances.',
        en: 'Yes, that is the idea behind Ohaana: the provider travels within their service area, shown on the listing, whether you stay in a villa, a gîte, a bungalow or a holiday rental.',
        es: 'Sí, es la idea de Ohaana: el profesional se desplaza dentro de su zona de servicio, indicada en la ficha, ya te alojes en una villa, un gîte, un bungaló o un alquiler vacacional.',
      }[locale],
    },
  ]
}

export function buildLanding(d: LandingData): LandingContent {
  const { locale, island, category, count, minPrice } = d
  const where = island.in[locale]

  if (category) {
    const head = category.head[locale]
    const h1 = `${head} ${where}`
    const intro =
      count > 0
        ? {
            fr: `${h1} : réservez en ligne parmi ${count} service${count > 1 ? 's' : ''} de prestataires locaux${minPrice ? `, à partir de ${minPrice}` : ''}, pour votre villa, votre gîte ou votre maison de vacances.`,
            en: `${h1}: book online from ${count} service${count > 1 ? 's' : ''} by local providers${minPrice ? `, from ${minPrice}` : ''}, for your villa, gîte or holiday home.`,
            es: `${h1}: reserva en línea entre ${count} servicio${count > 1 ? 's' : ''} de profesionales locales${minPrice ? `, desde ${minPrice}` : ''}, para tu villa, tu gîte o tu casa de vacaciones.`,
          }[locale]
        : {
            fr: `${h1} : cette offre arrive bientôt sur Ohaana. Découvrez en attendant les autres services disponibles ${where}.`,
            en: `${h1}: this offer is coming soon to Ohaana. In the meantime, discover the other services available ${where}.`,
            es: `${h1}: esta oferta llegará pronto a Ohaana. Mientras tanto, descubre los demás servicios disponibles ${where}.`,
          }[locale]
    return {
      h1,
      title: h1,
      description: intro,
      paragraphs: [intro, island.blurb[locale], category.blurb[locale], AREAS(island.areas, locale), TIP[locale], HOW[locale]],
      faq: faq(d, category.noun[locale]),
    }
  }

  const h1 = { fr: `Services à domicile ${where}`, en: `At-home services ${where}`, es: `Servicios a domicilio ${where}` }[locale]
  const names = d.categoryNames ?? []
  const intro =
    count > 0
      ? {
          fr: `${h1} : ${count} service${count > 1 ? 's' : ''} de prestataires locaux${names.length ? ` (${join(names, 'fr')})` : ''}${minPrice ? `, à partir de ${minPrice}` : ''}. Réservez en ligne pour votre villa, votre gîte ou votre maison de vacances.`,
          en: `${h1}: ${count} service${count > 1 ? 's' : ''} by local providers${names.length ? ` (${join(names, 'en')})` : ''}${minPrice ? `, from ${minPrice}` : ''}. Book online for your villa, gîte or holiday home.`,
          es: `${h1}: ${count} servicio${count > 1 ? 's' : ''} de profesionales locales${names.length ? ` (${join(names, 'es')})` : ''}${minPrice ? `, desde ${minPrice}` : ''}. Reserva en línea para tu villa, tu gîte o tu casa de vacaciones.`,
        }[locale]
      : {
          fr: `${h1} : les premiers prestataires arrivent bientôt sur Ohaana. Revenez très vite ou découvrez les autres îles.`,
          en: `${h1}: the first providers are joining Ohaana soon. Check back shortly or explore the other islands.`,
          es: `${h1}: los primeros profesionales llegarán pronto a Ohaana. Vuelve enseguida o descubre las otras islas.`,
        }[locale]
  return {
    h1,
    title: h1,
    description: intro,
    paragraphs: [intro, island.blurb[locale], AREAS(island.areas, locale), TIP[locale], HOW[locale]],
    faq: faq(d, { fr: 'un service à domicile', en: 'an at-home service', es: 'un servicio a domicilio' }[locale]),
  }
}

/** Indexable seulement avec assez de services : en dessous, la page existe (utile au visiteur) mais reste en noindex. */
export const MIN_SERVICES_TO_INDEX = 3
