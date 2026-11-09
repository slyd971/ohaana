import { COMPANY, orToComplete } from '../company'
import type { LegalSection } from '@/components/legal/LegalDocument'

// Politique de confidentialité (RGPD). BROUILLON à valider par un avocat ou le DPO : durées de conservation et régions
// d'hébergement à confirmer (voir rapports/legal-questions.md).

export const privacySections = (): LegalSection[] => [
  {
    title: 'Responsable du traitement',
    paragraphs: [
      `${orToComplete(COMPANY.name)}, ${orToComplete(COMPANY.address)}, est responsable du traitement de vos données personnelles. Contact : ${COMPANY.privacyEmail}.`,
    ],
  },
  {
    title: 'Données collectées',
    items: [
      'Compte : nom, adresse email, langue, mot de passe (stocké sous forme chiffrée par notre service d’authentification) ou identifiant Google si vous vous connectez avec Google.',
      'Réservations : service, date, nombre de participants, adresse de la prestation, notes que vous saisissez.',
      'Paiement : le montant, le statut et l’identifiant de la transaction. Vos coordonnées bancaires sont traitées uniquement par Stripe et ne sont jamais enregistrées chez nous.',
      'Prestataires : nom commercial, présentation, téléphone, statut professionnel, SIRET, attestation d’assurance, compte de paiement Stripe.',
      'Communications : demandes à la conciergerie, inscription à la lettre d’information (avec confirmation), notifications et emails liés à vos réservations.',
      'Données techniques : adresse IP et journaux de connexion, utilisés pour la sécurité et la prévention des abus.',
    ],
  },
  {
    title: 'Finalités et bases légales',
    items: [
      'Gérer votre compte et vos réservations, et vous envoyer les emails qui s’y rapportent : exécution du contrat.',
      'Traiter les paiements et les remboursements, tenir la comptabilité : exécution du contrat et obligation légale.',
      'Vérifier le dossier des prestataires (statut, assurance) et lutter contre la fraude et les abus : intérêt légitime et obligation légale.',
      'Vous envoyer des actualités : votre consentement (double confirmation), retirable à tout moment.',
      'Répondre à vos demandes et améliorer le service : intérêt légitime.',
    ],
  },
  {
    title: 'Durées de conservation',
    items: [
      'Compte : tant qu’il est actif, puis effacé ou anonymisé à votre demande. Un compte inactif depuis trois ans peut être supprimé.',
      'Réservations et paiements : dix ans, durée légale de conservation des pièces comptables ; ces données sont anonymisées si vous supprimez votre compte.',
      'Lettre d’information : jusqu’à votre désinscription, au plus trois ans après votre dernière interaction.',
      'Journaux techniques : douze mois au plus.',
    ],
  },
  {
    title: 'Destinataires et sous-traitants',
    paragraphs: ['Vos données sont accessibles à l’équipe Ohaana habilitée. Elles sont traitées pour notre compte par des prestataires techniques :'],
    items: [
      'Supabase : base de données, authentification et stockage des fichiers.',
      'Stripe : paiements, remboursements et comptes de versement des prestataires.',
      'Resend : envoi des emails.',
      'Vercel : hébergement du site.',
      'Le Prestataire que vous réservez reçoit les informations nécessaires à la prestation (prénom, adresse, notes, participants). Son téléphone ne vous est transmis qu’après réservation confirmée.',
    ],
  },
  {
    title: 'Transferts hors Union européenne',
    paragraphs: [
      'Certains sous-traitants peuvent traiter des données hors de l’Union européenne, notamment aux États-Unis. Ces transferts reposent sur les garanties prévues par le RGPD (clauses contractuelles types ou cadre de protection des données UE-États-Unis).',
    ],
  },
  {
    title: 'Vos droits',
    paragraphs: [
      'Vous disposez d’un droit d’accès, de rectification, d’effacement, de limitation, d’opposition et de portabilité, ainsi que du droit de retirer votre consentement et de définir des directives sur le sort de vos données après votre décès.',
      `Depuis votre espace (Réglages, « Mes données »), vous pouvez exporter vos données au format JSON et supprimer votre compte vous-même. Pour tout autre exercice de vos droits, écrivez à ${COMPANY.privacyEmail} ; nous répondons dans un délai d’un mois. Vous pouvez aussi introduire une réclamation auprès de la CNIL (cnil.fr).`,
    ],
  },
  {
    title: 'Suppression du compte',
    paragraphs: [
      'Sans réservation passée, la suppression efface toutes vos données. Avec des réservations passées, vos données personnelles sont effacées et les écritures comptables sont conservées sans votre identité. La suppression est impossible tant qu’une prestation confirmée reste à venir.',
    ],
  },
  {
    title: 'Sécurité et mineurs',
    paragraphs: [
      'Nous protégeons vos données par des accès restreints, des connexions chiffrées et un cloisonnement des droits dans la base. Le Site s’adresse aux personnes majeures.',
    ],
  },
  {
    title: 'Cookies',
    paragraphs: ['Le Site n’utilise que des cookies strictement nécessaires à son fonctionnement. Voir la politique de cookies.'],
  },
  {
    title: 'Modification',
    paragraphs: ['Cette politique peut évoluer ; la version en vigueur est datée en haut de page et les changements importants vous sont notifiés.'],
  },
]
