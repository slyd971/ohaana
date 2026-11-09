import { createHash, randomBytes } from 'node:crypto'

// Jeton du double opt-in : 32 octets aléatoires envoyés par email, seul leur empreinte SHA-256 est stockée.
// Une fuite de la base ne permet donc pas de confirmer ni de désinscrire un tiers.

export const hashLeadToken = (token: string) => createHash('sha256').update(token).digest('hex')

export function newLeadToken(): { token: string; hash: string } {
  const token = randomBytes(32).toString('hex')
  return { token, hash: hashLeadToken(token) }
}

export const isLeadToken = (v: unknown): v is string => typeof v === 'string' && /^[a-f0-9]{64}$/.test(v)
