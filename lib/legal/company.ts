// Identité de l'éditeur, exigée par les mentions légales (LCEN) et la politique de confidentialité.
// AUCUNE valeur n'est inventée : renseignez les variables d'environnement (Vercel) avec les informations réelles de la société.
// Tant qu'une valeur manque, la page affiche « [À COMPLÉTER] » plutôt qu'une information fausse.

const env = (name: string) => process.env[name]?.trim() || null

export const COMPANY = {
  name: env('NEXT_PUBLIC_COMPANY_NAME'),
  legalForm: env('NEXT_PUBLIC_COMPANY_FORM'),
  capital: env('NEXT_PUBLIC_COMPANY_CAPITAL'),
  siren: env('NEXT_PUBLIC_COMPANY_SIREN'),
  rcs: env('NEXT_PUBLIC_COMPANY_RCS'),
  vat: env('NEXT_PUBLIC_COMPANY_VAT'),
  address: env('NEXT_PUBLIC_COMPANY_ADDRESS'),
  publisher: env('NEXT_PUBLIC_COMPANY_PUBLISHER'),
  contactEmail: env('NEXT_PUBLIC_CONTACT_EMAIL') ?? 'contact@ohaana.fr',
  privacyEmail: env('NEXT_PUBLIC_PRIVACY_EMAIL') ?? 'contact@ohaana.fr',
  phone: env('NEXT_PUBLIC_COMPANY_PHONE'),
} as const

export const TO_COMPLETE = '[À COMPLÉTER]'
export const orToComplete = (v: string | null) => v ?? TO_COMPLETE
export const missingCompanyFields = () =>
  (['name', 'legalForm', 'siren', 'address', 'publisher'] as const).filter((k) => !COMPANY[k])
