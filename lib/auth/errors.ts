// Maps Supabase Auth errors to i18n keys (auth.errors.*). Never leak raw provider messages to users.
interface AuthLikeError {
  code?: string
  status?: number
  message?: string
}

export type AuthErrorKey =
  | 'invalidCredentials'
  | 'emailNotConfirmed'
  | 'rateLimited'
  | 'weakPassword'
  | 'userExists'
  | 'sessionExpired'
  | 'unavailable'
  | 'generic'

export function authErrorKey(error: unknown): AuthErrorKey {
  const e = (error ?? {}) as AuthLikeError
  const code = e.code ?? ''
  if (e.status === 429 || code === 'over_request_rate_limit' || code === 'over_email_send_rate_limit') return 'rateLimited'
  switch (code) {
    case 'invalid_credentials': return 'invalidCredentials'
    case 'email_not_confirmed': return 'emailNotConfirmed'
    case 'weak_password': return 'weakPassword'
    case 'user_already_exists':
    case 'email_exists': return 'userExists'
    case 'otp_expired':
    case 'flow_state_expired':
    case 'session_expired': return 'sessionExpired'
  }
  if (e.status === 400 && /invalid login credentials/i.test(e.message ?? '')) return 'invalidCredentials'
  if (e.message === 'AUTH_UNAVAILABLE' || e.status === 0 || /failed to fetch|network/i.test(e.message ?? '')) return 'unavailable'
  return 'generic'
}
