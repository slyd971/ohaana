// Envoi d'email via l'API REST de Resend (aucune dépendance). Sans RESEND_API_KEY, rien n'est envoyé :
// en dev le message est écrit dans la console, en production l'appel est ignoré et journalisé.
// Un échec d'envoi ne doit JAMAIS faire échouer l'action métier qui l'a déclenché : l'appelant reçoit un statut.

export type SendResult = { status: 'sent'; id: string | null } | { status: 'skipped'; reason: string } | { status: 'failed'; reason: string }

export interface OutgoingEmail {
  to: string
  subject: string
  html: string
  text: string
  /** Lien de désabonnement en un clic (en-tête List-Unsubscribe), pour les envois non transactionnels. */
  unsubscribeUrl?: string
}

const FROM = process.env.EMAIL_FROM?.trim() || 'Ohaana <noreply@ohaana.fr>'

export async function sendEmail(mail: OutgoingEmail): Promise<SendResult> {
  const key = process.env.RESEND_API_KEY?.trim()
  if (!key) {
    if (process.env.NODE_ENV !== 'production') console.info(`[email:dev] → ${mail.to} · ${mail.subject}\n${mail.text}`)
    return { status: 'skipped', reason: 'no_api_key' }
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: FROM,
        to: [mail.to],
        subject: mail.subject,
        html: mail.html,
        text: mail.text,
        ...(mail.unsubscribeUrl
          ? { headers: { 'List-Unsubscribe': `<${mail.unsubscribeUrl}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' } }
          : {}),
      }),
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) {
      console.error('[email] Resend refused the message:', res.status)
      return { status: 'failed', reason: `http_${res.status}` }
    }
    const body = (await res.json().catch(() => null)) as { id?: string } | null
    return { status: 'sent', id: body?.id ?? null }
  } catch (error) {
    console.error('[email] send failed:', error instanceof Error ? error.message : error)
    return { status: 'failed', reason: 'network' }
  }
}
