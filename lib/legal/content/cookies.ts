import type { LegalSection } from '@/components/legal/LegalDocument'

// Politique de cookies : décrit uniquement ce que le site dépose réellement aujourd'hui.
// À mettre à jour AVANT d'ajouter tout outil de mesure d'audience, de publicité ou de session replay (bandeau de consentement requis).

export const cookiesSections = (): LegalSection[] => [
  {
    title: 'Ce que nous utilisons',
    paragraphs: [
      'Le Site n’utilise que des cookies et stockages strictement nécessaires à son fonctionnement. Ils ne demandent pas votre consentement.',
    ],
    items: [
      'Session de connexion (cookies « sb-… » de notre service d’authentification) : vous garder connecté et sécuriser votre compte.',
      'Langue : mémoriser la langue choisie.',
      'Stockage de session du navigateur : mémoriser temporairement l’île sélectionnée sur l’accueil. Il disparaît à la fermeture de l’onglet.',
      'Paiement (Stripe) : lors du paiement, Stripe peut déposer des cookies de sécurité pour détecter la fraude. Ils sont nécessaires au paiement et régis par la politique de Stripe.',
    ],
  },
  {
    title: 'Ce que nous n’utilisons pas',
    paragraphs: [
      'Aucun cookie de mesure d’audience, de publicité ou de suivi entre sites n’est déposé. Si nous en ajoutons un jour, un bandeau vous demandera votre accord avant tout dépôt, et refuser sera aussi simple qu’accepter.',
    ],
  },
  {
    title: 'Gérer les cookies',
    paragraphs: [
      'Vous pouvez supprimer ou bloquer les cookies dans les réglages de votre navigateur. Bloquer les cookies de session vous empêchera de rester connecté.',
    ],
  },
]
