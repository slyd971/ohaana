// Version en vigueur de chaque document juridique (date de dernière modification de fond, AAAA-MM-JJ).
// Changer une version ici suffit à faire enregistrer la nouvelle acceptation pour les inscriptions suivantes.
// Une modification de fond doit aussi mettre à jour la page correspondante et être notifiée aux utilisateurs.

export const LEGAL_VERSIONS = {
  terms: '2026-11-09',
  provider_terms: '2026-11-09',
  privacy: '2026-11-09',
} as const

export type LegalDocument = keyof typeof LEGAL_VERSIONS

/** Tant que les textes n'ont pas été validés par un avocat, les pages affichent un bandeau « brouillon ». */
export const LEGAL_DRAFT = true
