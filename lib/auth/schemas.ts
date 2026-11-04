import { z } from 'zod'

// Error messages are i18n keys under auth.validation.* (translated by the form components).
const email = z
  .string({ error: 'required' })
  .trim()
  .min(1, { error: 'required' })
  .max(254, { error: 'emailInvalid' })
  .pipe(z.email({ error: 'emailInvalid' }))

// Supabase hashes with bcrypt, which ignores everything past 72 bytes.
const newPassword = z
  .string({ error: 'required' })
  .min(8, { error: 'passwordTooShort' })
  .max(72, { error: 'passwordTooLong' })
  .refine((v) => /[A-Za-z]/.test(v) && /\d/.test(v), { error: 'passwordWeak' })

export const loginSchema = z.object({
  email,
  password: z.string({ error: 'required' }).min(1, { error: 'required' }).max(72, { error: 'passwordTooLong' }),
})

export const magicLinkSchema = z.object({ email })

export const registerSchema = z.object({
  fullName: z.string({ error: 'required' }).trim().min(2, { error: 'nameTooShort' }).max(100, { error: 'nameTooLong' }),
  email,
  password: newPassword,
  role: z.enum(['tourist', 'provider']),
  acceptTerms: z.literal(true, { error: 'termsRequired' }),
})

export const resetRequestSchema = z.object({ email })

export const updatePasswordSchema = z
  .object({ password: newPassword, confirm: z.string({ error: 'required' }) })
  .refine((v) => v.password === v.confirm, { path: ['confirm'], error: 'passwordMismatch' })

/** Flatten a Zod error into { field: i18nKey } (first issue per field). */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? 'form')
    if (!(key in out)) out[key] = issue.message
  }
  return out
}
