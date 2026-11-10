// Aperçu et envoi de test des emails transactionnels.
//   node scripts/email/preview.mjs                      → génère .email-preview/index.html (3 langues × tous les modèles)
//   node --env-file=.env.local scripts/email/preview.mjs --send vous@gmail.com [--lang fr]
//                                                        → envoie un exemple de chaque modèle à cette adresse (préfixe [TEST])
// Aucune donnée réelle : tout est fictif.
import { mkdirSync, writeFileSync } from 'node:fs'
import * as T from '../../lib/email/templates.ts'
import { sendEmail } from '../../lib/email/send.ts'

const args = process.argv.slice(2)
const sendTo = args.includes('--send') ? args[args.indexOf('--send') + 1] : null
const only = args.includes('--lang') ? args[args.indexOf('--lang') + 1] : null
const langs = only ? [only] : ['fr', 'en', 'es']

const base = (lang) => ({
  lang,
  recipientName: 'Camille',
  serviceTitle: 'Massage en bord de mer',
  when: lang === 'en' ? 'Sat, 15 Nov 2026, 10:00' : lang === 'es' ? 'sáb, 15 nov 2026, 10:00' : 'sam. 15 nov. 2026, 10:00',
  guests: 2,
  total: lang === 'fr' ? '120,00 €' : '€120.00',
  url: 'https://www.ohaana.fr/voyages',
  counterpart: 'Camille',
})

const samples = (lang) => [
  ['confirmation-voyageur', T.bookingConfirmedTourist(base(lang))],
  ['nouvelle-resa-prestataire', T.bookingNewProvider(base(lang))],
  ['annulation-voyageur', T.bookingCancelled({ ...base(lang), by: 'provider', recipient: 'tourist', refundLine: lang === 'fr' ? 'Remboursement : 120,00 €' : 'Refund: €120.00' })],
  ['rappel-j-1', T.bookingReminder(base(lang))],
  ['demande-avis', T.reviewRequest(base(lang))],
  ['prestataire-approuve', T.providerApproved({ lang, name: 'Camille', url: 'https://www.ohaana.fr/prestataire' })],
  ['prestataire-suspendu', T.providerSuspended({ lang, name: 'Camille', contactUrl: 'https://www.ohaana.fr/contact' })],
  ['inscription-double-opt-in', T.leadConfirmation({ lang, confirmUrl: 'https://www.ohaana.fr/api/leads/confirm?t=exemple', unsubscribeUrl: 'https://www.ohaana.fr/api/leads/confirm?t=exemple&u=1' })],
]

if (sendTo) {
  if (!process.env.RESEND_API_KEY) { console.error('RESEND_API_KEY absente : lancez avec --env-file=.env.local'); process.exit(1) }
  for (const lang of langs) for (const [name, r] of samples(lang)) {
    const res = await sendEmail({ to: sendTo, subject: `[TEST ${lang}] ${r.subject}`, html: r.html, text: r.text })
    console.log(lang, name, res.status, res.reason ?? '')
    await new Promise((ok) => setTimeout(ok, 600)) // reste sous la limite de débit de Resend
  }
} else {
  mkdirSync('.email-preview', { recursive: true })
  let index = '<!doctype html><meta charset="utf-8"><title>Aperçu emails Ohaana</title><body style="font-family:sans-serif;max-width:720px;margin:2rem auto"><h1>Aperçu emails</h1>'
  for (const lang of langs) {
    index += `<h2>${lang.toUpperCase()}</h2><ul>`
    for (const [name, r] of samples(lang)) {
      const file = `${lang}-${name}.html`
      writeFileSync(`.email-preview/${file}`, r.html)
      index += `<li><a href="${file}">${name}</a> — ${r.subject}</li>`
    }
    index += '</ul>'
  }
  writeFileSync('.email-preview/index.html', index)
  console.log('Aperçu généré : .email-preview/index.html')
}
