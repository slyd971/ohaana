import { COMPANY, orToComplete } from '../company'
import type { LegalSection } from '@/components/legal/LegalDocument'

// Conditions générales prestataires. BROUILLON à valider par un avocat : voir rapports/legal-questions.md.

export const providerTermsSections = (): LegalSection[] => [
  {
    title: 'Objet',
    paragraphs: [
      `Ces conditions encadrent la présence d’un professionnel (le « Prestataire ») sur la plateforme Ohaana, éditée par ${orToComplete(COMPANY.name)}. Ohaana met en relation des Prestataires indépendants et des voyageurs ; elle ne fournit pas les prestations.`,
    ],
  },
  {
    title: 'Conditions d’accès',
    items: [
      'Exercer son activité de manière régulière et déclarée : micro-entreprise, entreprise ou association. Un particulier ne peut pas proposer de prestations rémunérées de façon habituelle sans immatriculation.',
      'Renseigner un statut professionnel exact, un SIRET valide le cas échéant, et justifier d’une assurance responsabilité civile professionnelle en cours de validité.',
      'Faire valider son dossier par l’équipe Ohaana. Toute modification de ces informations déclenche une nouvelle vérification. Ohaana peut refuser ou retirer un Prestataire dont le dossier est incomplet ou inexact.',
    ],
  },
  {
    title: 'Fiches de service',
    items: [
      'Les informations (description, prix, durée, capacité, zone de déplacement, photos) doivent être exactes et vous appartenir ou être utilisées avec droit.',
      'Chaque modification d’une fiche publiée repasse en relecture avant d’être de nouveau visible.',
      'Vous gardez vos disponibilités à jour et honorez les réservations confirmées.',
    ],
  },
  {
    title: 'Prix, commission et paiement',
    paragraphs: [
      'Le prix que vous fixez est le prix payé par le voyageur : aucun frais ne lui est ajouté. Ohaana prélève une commission, en pourcentage de la part qui vous revient, au taux affiché dans votre espace prestataire. Le taux en vigueur à la date de la réservation s’applique ; toute modification vous est annoncée.',
      'Le voyageur paie sur votre compte Stripe, que vous devez configurer et maintenir actif (Stripe vérifie votre identité et vos coordonnées bancaires selon ses propres conditions). Les frais de traitement de Stripe sont à votre charge et se déduisent de votre versement. Sans compte de paiement actif, vous ne pouvez pas recevoir de réservation payée.',
    ],
  },
  {
    title: 'Annulations',
    paragraphs: [
      'En cas d’annulation par le voyageur, le remboursement suit la politique d’annulation de votre service. Si vous annulez, le voyageur est remboursé intégralement. Les annulations répétées par le Prestataire peuvent entraîner une suspension.',
    ],
  },
  {
    title: 'Engagements et loyauté',
    items: [
      'Ne pas contourner la plateforme : les échanges, réservations et paiements relatifs à une mise en relation Ohaana passent par Ohaana.',
      'Les coordonnées du voyageur ne sont utilisées que pour la prestation réservée.',
      'Respecter les lois applicables à votre activité (hygiène, sécurité, droit du travail, fiscalité) et les autorisations nécessaires.',
      'Ne publier ni avis fictifs ni pressions sur les avis.',
    ],
  },
  {
    title: 'Indépendance',
    paragraphs: [
      'Le Prestataire est indépendant : il n’existe aucun lien de subordination avec Ohaana. Il fixe librement ses prix, ses disponibilités et ses méthodes dans le respect de ces conditions, et reste seul responsable de ses obligations sociales et fiscales.',
    ],
  },
  {
    title: 'Fiscalité et facturation',
    paragraphs: [
      'Le Prestataire facture la prestation au voyageur et applique le régime de TVA qui lui est propre. Ohaana facture au Prestataire sa commission. Le Prestataire déclare ses revenus ; Ohaana peut être tenue de transmettre à l’administration fiscale les informations sur les revenus perçus via la plateforme.',
    ],
  },
  {
    title: 'Responsabilité et assurance',
    paragraphs: [
      'Le Prestataire répond des dommages causés lors de la prestation et maintient son assurance responsabilité civile professionnelle pendant toute la durée de sa présence sur la plateforme.',
    ],
  },
  {
    title: 'Suspension et résiliation',
    paragraphs: [
      'Ohaana peut suspendre ou retirer un Prestataire en cas de manquement (informations inexactes, assurance expirée, annulations répétées, contournement, comportement inapproprié). Les réservations déjà confirmées sont alors traitées au cas par cas pour protéger les voyageurs. Le Prestataire peut quitter la plateforme à tout moment, sous réserve d’honorer ses réservations à venir.',
    ],
  },
  {
    title: 'Données personnelles',
    paragraphs: ['Le traitement des données est décrit dans la politique de confidentialité. Les informations de statut professionnel ne sont jamais publiques.'],
  },
  {
    title: 'Droit applicable et modification',
    paragraphs: [
      'Ces conditions sont soumises au droit français. Ohaana peut les modifier ; les modifications de fond sont notifiées et peuvent exiger une nouvelle acceptation.',
    ],
  },
]
