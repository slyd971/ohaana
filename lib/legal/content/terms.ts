import { COMPANY, orToComplete, TO_COMPLETE } from '../company'
import type { LegalSection } from '@/components/legal/LegalDocument'

// Conditions générales d'utilisation et de vente (voyageurs). BROUILLON à valider par un avocat : voir rapports/legal-questions.md.

export const termsSections = (): LegalSection[] => [
  {
    title: 'Objet et éditeur',
    paragraphs: [
      `Les présentes conditions régissent l’utilisation de la plateforme Ohaana (le « Site ») et les réservations qui y sont effectuées. Le Site est édité par ${orToComplete(COMPANY.name)} (voir les mentions légales). En créant un compte ou en réservant, vous acceptez ces conditions.`,
    ],
  },
  {
    title: 'Définitions',
    items: [
      '« Voyageur » : toute personne qui réserve un service via le Site.',
      '« Prestataire » : le professionnel indépendant qui propose et réalise le service (chef, masseur, photographe, DJ…).',
      '« Service » : la prestation décrite sur la fiche, avec son prix, sa durée, sa capacité et sa zone de déplacement.',
    ],
  },
  {
    title: 'Rôle d’Ohaana',
    paragraphs: [
      'Ohaana est une plateforme de mise en relation. Le contrat de prestation est conclu directement entre le Voyageur et le Prestataire : Ohaana n’est pas partie à ce contrat et n’exécute pas la prestation.',
      'Ohaana sélectionne les Prestataires et vérifie les informations de leur dossier avant publication, sans garantir la qualité de chaque prestation. Les avis publiés proviennent de voyageurs ayant réellement réservé le service concerné.',
    ],
  },
  {
    title: 'Compte',
    paragraphs: [
      'Réserver nécessite un compte. Vous devez être majeur, fournir des informations exactes et garder vos identifiants confidentiels. Vous êtes responsable de l’activité réalisée depuis votre compte.',
    ],
  },
  {
    title: 'Réservation et prix',
    paragraphs: [
      'Le prix affiché sur la fiche est le prix total que vous payez, en euros, sans frais supplémentaires pour le Voyageur. Il est calculé par nos serveurs selon le tarif du Prestataire, le nombre de participants et la durée.',
      'La réservation est confirmée lorsque le paiement est accepté. Le créneau est alors réservé et le Prestataire en est informé. Une réservation non payée dans le délai indiqué expire et le créneau est libéré.',
      'Le régime de TVA applicable dépend du statut du Prestataire et du territoire de réalisation du service (Guadeloupe, Martinique, Saint-Martin, Saint-Barthélemy).',
    ],
  },
  {
    title: 'Paiement',
    paragraphs: [
      'Le paiement est effectué en ligne par carte ou autre moyen proposé, via notre prestataire de paiement Stripe. Ohaana ne conserve pas vos coordonnées bancaires. Le montant est versé au Prestataire, Ohaana prélevant sa commission sur la part du Prestataire.',
    ],
  },
  {
    title: 'Annulation et remboursement',
    items: [
      'La politique d’annulation de chaque service est affichée avant le paiement. Elle fixe le pourcentage remboursé selon le délai entre l’annulation et la prestation.',
      'Si le Prestataire annule, le Voyageur est remboursé intégralement.',
      'Le remboursement est émis sur le moyen de paiement utilisé. Le délai d’apparition sur le compte dépend de votre banque.',
      'Une annulation n’est plus possible une fois la prestation commencée.',
    ],
    paragraphs: [
      'Droit de rétractation : les prestations de loisirs fournies à une date ou sur une période déterminée n’ouvrent pas de droit de rétractation de quatorze jours (article L221-28 du Code de la consommation). Les conditions d’annulation ci-dessus s’appliquent à leur place.',
    ],
  },
  {
    title: 'Obligations du Voyageur',
    items: [
      'Fournir l’accès au lieu, l’adresse exacte et les informations utiles (allergies, besoins particuliers, nombre de participants).',
      'Respecter le Prestataire, le matériel et les horaires convenus.',
      'Ne pas contourner la plateforme pour régler ou convenir d’une prestation hors Ohaana : vous perdriez la protection du remboursement et des avis.',
    ],
  },
  {
    title: 'Avis',
    paragraphs: [
      'Seul un Voyageur ayant réservé et bénéficié du service peut publier un avis, qui doit refléter son expérience. Ohaana peut retirer un avis illicite, injurieux ou sans lien avec le service, sans modifier sa note autrement. Ohaana ne rémunère pas les avis.',
    ],
  },
  {
    title: 'Classement des résultats',
    paragraphs: [
      'L’ordre d’affichage des services dépend de leur pertinence par rapport à votre recherche, de la popularité (nombre de réservations) et de mises en avant éditoriales décidées par Ohaana. Aucun Prestataire ne paie pour améliorer son classement.',
    ],
  },
  {
    title: 'Responsabilité',
    paragraphs: [
      'Le Prestataire est responsable de la bonne exécution de la prestation et de son assurance professionnelle. Ohaana répond de la disponibilité raisonnable du Site et de la sécurité des paiements dans la limite de ses obligations légales, et ne saurait être tenue responsable des dommages résultant d’une prestation qu’elle n’a pas réalisée, sauf faute de sa part.',
      'Le Site peut être interrompu pour maintenance ou en cas de force majeure.',
    ],
  },
  {
    title: 'Données personnelles et cookies',
    paragraphs: ['Le traitement de vos données est décrit dans la politique de confidentialité et la politique de cookies.'],
  },
  {
    title: 'Propriété intellectuelle',
    paragraphs: [
      'La marque, le Site et ses contenus propres sont protégés. Les contenus des Prestataires (textes, photos) restent leur propriété et sont affichés avec leur autorisation.',
    ],
  },
  {
    title: 'Réclamations et médiation',
    paragraphs: [
      `Pour toute réclamation, écrivez à ${COMPANY.contactEmail}. À défaut de solution amiable, vous pouvez recourir gratuitement au médiateur de la consommation : ${TO_COMPLETE} (nom, adresse et site du médiateur à renseigner après désignation).`,
      'Vous pouvez aussi utiliser la plateforme européenne de règlement en ligne des litiges : ec.europa.eu/consumers/odr.',
    ],
  },
  {
    title: 'Droit applicable et modification',
    paragraphs: [
      'Ces conditions sont soumises au droit français. En cas de litige, et sauf règle impérative contraire pour le consommateur, les tribunaux français sont compétents.',
      'Ohaana peut modifier ces conditions ; la version applicable à une réservation est celle en vigueur au moment de celle-ci. Les modifications de fond vous sont notifiées.',
    ],
  },
]
