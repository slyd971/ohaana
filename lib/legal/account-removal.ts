// Décision côté serveur après prepare_account_removal (migration 014). Pure : testable sans base ni Supabase.

export type RemovalVerdict = 'deletable' | 'anonymised' | 'blocked_upcoming' | 'blocked_role'

export const REMOVAL_MESSAGES: Record<'blocked_upcoming' | 'blocked_role', string> = {
  blocked_upcoming:
    'Vous avez des réservations confirmées à venir. Annulez-les ou attendez qu’elles aient eu lieu, puis recommencez : nous ne pouvons pas supprimer un compte dont une prestation reste à honorer.',
  blocked_role: 'Ce compte appartient à l’équipe Ohaana : écrivez-nous pour le clôturer.',
}

export const isRemovalVerdict = (v: unknown): v is RemovalVerdict =>
  v === 'deletable' || v === 'anonymised' || v === 'blocked_upcoming' || v === 'blocked_role'

/** Adresse de remplacement dans le service d'authentification, pour libérer l'email d'origine. */
export const anonymisedEmail = (userId: string) => `deleted+${userId}@deleted.invalid`
