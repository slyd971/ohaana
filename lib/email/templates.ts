// Modèles d'emails FR / EN / ES. Fonctions pures (aucun accès réseau ni base) : le texte est échappé et
// chaque modèle produit un sujet, une version HTML et une version texte brut.

export type Lang = 'fr' | 'en' | 'es'

export const toLang = (v: string | null | undefined): Lang => (v === 'en' || v === 'es' ? v : 'fr')

export interface Rendered {
  subject: string
  html: string
  text: string
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')

/** Les liens ne sont jamais construits à partir de saisies utilisateur : seulement http(s). */
const safeUrl = (u: string) => (/^https?:\/\//i.test(u) ? u : '#')

interface Layout {
  lang: Lang
  heading: string
  lines: string[]
  /** Détails clé / valeur (service, date…). */
  facts?: [string, string][]
  cta?: { label: string; url: string }
  footnote?: string
}

const FOOTER: Record<Lang, string> = {
  fr: 'Ohaana — des expériences à domicile aux Antilles.',
  en: 'Ohaana — at-home experiences in the French Antilles.',
  es: 'Ohaana — experiencias a domicilio en las Antillas.',
}

function layout(l: Layout): Pick<Rendered, 'html' | 'text'> {
  const facts = (l.facts ?? [])
    .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#6B6B6B;font-size:13px">${escapeHtml(k)}</td><td style="padding:4px 0;font-size:14px;color:#1C1C1E"><strong>${escapeHtml(v)}</strong></td></tr>`)
    .join('')
  const html = `<!doctype html><html lang="${l.lang}"><body style="margin:0;background:#F6F1E7;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden" cellpadding="0" cellspacing="0">
<tr><td style="background:#1A3D2B;color:#ffffff;padding:18px 28px;font-size:20px;font-weight:600;letter-spacing:.3px">Ohaana</td></tr>
<tr><td style="padding:28px">
<h1 style="margin:0 0 14px;font-size:20px;color:#1A3D2B">${escapeHtml(l.heading)}</h1>
${l.lines.map((p) => `<p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:#1C1C1E">${escapeHtml(p)}</p>`).join('')}
${facts ? `<table role="presentation" style="margin:8px 0 16px" cellpadding="0" cellspacing="0">${facts}</table>` : ''}
${l.cta ? `<p style="margin:18px 0"><a href="${escapeHtml(safeUrl(l.cta.url))}" style="display:inline-block;background:#1A3D2B;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:999px;font-size:14px;font-weight:600">${escapeHtml(l.cta.label)}</a></p>` : ''}
${l.footnote ? `<p style="margin:16px 0 0;font-size:12px;line-height:1.5;color:#6B6B6B">${escapeHtml(l.footnote)}</p>` : ''}
</td></tr>
<tr><td style="padding:16px 28px;background:#F6F1E7;font-size:12px;color:#6B6B6B">${escapeHtml(FOOTER[l.lang])}</td></tr>
</table></td></tr></table></body></html>`
  const text = [
    l.heading,
    '',
    ...l.lines,
    ...(l.facts?.length ? ['', ...l.facts.map(([k, v]) => `${k} : ${v}`)] : []),
    ...(l.cta ? ['', `${l.cta.label} : ${safeUrl(l.cta.url)}`] : []),
    ...(l.footnote ? ['', l.footnote] : []),
    '',
    FOOTER[l.lang],
  ].join('\n')
  return { html, text }
}

const hi = (lang: Lang, name: string | null | undefined) => {
  const n = (name ?? '').trim().split(' ')[0]
  return n ? { fr: `Bonjour ${n},`, en: `Hello ${n},`, es: `Hola ${n},` }[lang] : { fr: 'Bonjour,', en: 'Hello,', es: 'Hola,' }[lang]
}

// ─── Réservations ────────────────────────────────────────────────────────────

export interface BookingMail {
  lang: Lang
  recipientName?: string | null
  serviceTitle: string
  /** Date et heure déjà formatées dans la langue du destinataire. */
  when: string
  guests: number
  /** Montant déjà formaté (« 120,00 € »). */
  total: string
  /** Page où le destinataire retrouve la réservation (URL absolue). */
  url: string
  /** Nom ou prénom de l'autre partie, si connu. */
  counterpart?: string | null
  reason?: string | null
}

const factLabels: Record<Lang, { service: string; when: string; guests: string; total: string; who: string }> = {
  fr: { service: 'Service', when: 'Date', guests: 'Participants', total: 'Total', who: 'Voyageur' },
  en: { service: 'Service', when: 'Date', guests: 'Guests', total: 'Total', who: 'Traveller' },
  es: { service: 'Servicio', when: 'Fecha', guests: 'Participantes', total: 'Total', who: 'Viajero' },
}

const bookingFacts = (b: BookingMail, withWho: boolean): [string, string][] => {
  const f = factLabels[b.lang]
  return [
    [f.service, b.serviceTitle],
    [f.when, b.when],
    [f.guests, String(b.guests)],
    [f.total, b.total],
    ...(withWho && b.counterpart ? ([[f.who, b.counterpart]] as [string, string][]) : []),
  ]
}

export function bookingConfirmedTourist(b: BookingMail): Rendered {
  const t = {
    fr: { subject: `Réservation confirmée — ${b.serviceTitle}`, h: 'Votre réservation est confirmée', p: ['Votre paiement a bien été reçu. Votre prestataire est prévenu et vous attend à la date prévue.', 'Vous pouvez retrouver les détails, ou annuler selon les conditions du service, depuis votre espace.'], cta: 'Voir ma réservation' },
    en: { subject: `Booking confirmed — ${b.serviceTitle}`, h: 'Your booking is confirmed', p: ['We have received your payment. Your provider has been notified and will see you on the day.', 'You can review the details, or cancel according to the service conditions, from your account.'], cta: 'View my booking' },
    es: { subject: `Reserva confirmada — ${b.serviceTitle}`, h: 'Tu reserva está confirmada', p: ['Hemos recibido tu pago. Tu proveedor ya está avisado y te espera el día previsto.', 'Puedes consultar los detalles, o cancelar según las condiciones del servicio, desde tu cuenta.'], cta: 'Ver mi reserva' },
  }[b.lang]
  return { subject: t.subject, ...layout({ lang: b.lang, heading: t.h, lines: [hi(b.lang, b.recipientName), ...t.p], facts: bookingFacts(b, false), cta: { label: t.cta, url: b.url } }) }
}

export function bookingNewProvider(b: BookingMail): Rendered {
  const t = {
    fr: { subject: `Nouvelle réservation — ${b.serviceTitle}`, h: 'Vous avez une nouvelle réservation', p: ['Un voyageur vient de réserver et de payer. Le créneau est bloqué dans votre agenda.', 'Retrouvez tous les détails de la réservation dans votre espace.'], cta: 'Voir dans mon espace' },
    en: { subject: `New booking — ${b.serviceTitle}`, h: 'You have a new booking', p: ['A traveller has just booked and paid. The slot is blocked in your calendar.', 'You will find all the booking details in your dashboard.'], cta: 'Open my dashboard' },
    es: { subject: `Nueva reserva — ${b.serviceTitle}`, h: 'Tienes una nueva reserva', p: ['Un viajero acaba de reservar y pagar. El horario queda bloqueado en tu agenda.', 'Encontrarás todos los detalles de la reserva en tu panel.'], cta: 'Abrir mi panel' },
  }[b.lang]
  return { subject: t.subject, ...layout({ lang: b.lang, heading: t.h, lines: [hi(b.lang, b.recipientName), ...t.p], facts: bookingFacts(b, true), cta: { label: t.cta, url: b.url } }) }
}

export function bookingCancelled(b: BookingMail & { by: 'tourist' | 'provider'; recipient: 'tourist' | 'provider'; refundLine?: string | null }): Rendered {
  const own = b.by === b.recipient
  const t = {
    fr: {
      subject: `Réservation annulée — ${b.serviceTitle}`,
      h: 'Réservation annulée',
      p: own
        ? ['Votre annulation a bien été prise en compte.']
        : b.by === 'provider'
          ? ['Le prestataire a dû annuler cette réservation. Nous en sommes désolés.']
          : ['Le voyageur a annulé cette réservation. Le créneau est de nouveau disponible.'],
      cta: 'Voir le détail',
    },
    en: {
      subject: `Booking cancelled — ${b.serviceTitle}`,
      h: 'Booking cancelled',
      p: own
        ? ['Your cancellation has been recorded.']
        : b.by === 'provider'
          ? ['The provider had to cancel this booking. We are sorry about that.']
          : ['The traveller cancelled this booking. The slot is available again.'],
      cta: 'View details',
    },
    es: {
      subject: `Reserva cancelada — ${b.serviceTitle}`,
      h: 'Reserva cancelada',
      p: own
        ? ['Tu cancelación se ha registrado.']
        : b.by === 'provider'
          ? ['El proveedor ha tenido que cancelar esta reserva. Lo sentimos.']
          : ['El viajero ha cancelado esta reserva. El horario vuelve a estar disponible.'],
      cta: 'Ver el detalle',
    },
  }[b.lang]
  const lines = [hi(b.lang, b.recipientName), ...t.p, ...(b.refundLine ? [b.refundLine] : []), ...(b.reason ? [b.reason] : [])]
  return { subject: t.subject, ...layout({ lang: b.lang, heading: t.h, lines, facts: bookingFacts(b, false), cta: { label: t.cta, url: b.url } }) }
}

export function bookingReminder(b: BookingMail): Rendered {
  const t = {
    fr: { subject: `Demain : ${b.serviceTitle}`, h: 'Votre expérience a lieu demain', p: ['Un petit rappel avant votre prestation. Pensez à vérifier l’adresse et à prévoir ce que votre prestataire vous a demandé.'], cta: 'Voir ma réservation' },
    en: { subject: `Tomorrow: ${b.serviceTitle}`, h: 'Your experience is tomorrow', p: ['A quick reminder before your booking. Please check the address and prepare anything your provider asked for.'], cta: 'View my booking' },
    es: { subject: `Mañana: ${b.serviceTitle}`, h: 'Tu experiencia es mañana', p: ['Un recordatorio antes de tu reserva. Revisa la dirección y prepara lo que tu proveedor te haya pedido.'], cta: 'Ver mi reserva' },
  }[b.lang]
  return { subject: t.subject, ...layout({ lang: b.lang, heading: t.h, lines: [hi(b.lang, b.recipientName), ...t.p], facts: bookingFacts(b, false), cta: { label: t.cta, url: b.url } }) }
}

export function reviewRequest(b: BookingMail): Rendered {
  const t = {
    fr: { subject: `Comment s’est passée votre expérience ? — ${b.serviceTitle}`, h: 'Votre avis compte', p: ['Merci d’avoir choisi Ohaana. Quelques mots sur votre expérience aident les prochains voyageurs et valorisent votre prestataire.'], cta: 'Donner mon avis' },
    en: { subject: `How was your experience? — ${b.serviceTitle}`, h: 'Your opinion matters', p: ['Thank you for choosing Ohaana. A few words about your experience help future travellers and reward your provider.'], cta: 'Leave a review' },
    es: { subject: `¿Cómo fue tu experiencia? — ${b.serviceTitle}`, h: 'Tu opinión cuenta', p: ['Gracias por elegir Ohaana. Unas palabras sobre tu experiencia ayudan a otros viajeros y reconocen a tu proveedor.'], cta: 'Dejar mi opinión' },
  }[b.lang]
  return { subject: t.subject, ...layout({ lang: b.lang, heading: t.h, lines: [hi(b.lang, b.recipientName), ...t.p], facts: bookingFacts(b, false).slice(0, 2), cta: { label: t.cta, url: b.url } }) }
}

// ─── Prestataires ────────────────────────────────────────────────────────────

export function providerApproved(p: { lang: Lang; name?: string | null; url: string }): Rendered {
  const t = {
    fr: { subject: 'Votre dossier prestataire est validé', h: 'Bienvenue chez Ohaana', p: ['Votre dossier a été validé. Vous pouvez désormais publier vos services et recevoir des réservations.', 'Dernière étape : configurer vos paiements pour être réglé directement sur votre compte.'], cta: 'Configurer mes paiements' },
    en: { subject: 'Your provider application is approved', h: 'Welcome to Ohaana', p: ['Your application has been approved. You can now publish your services and receive bookings.', 'Last step: set up your payments so you are paid directly into your account.'], cta: 'Set up my payments' },
    es: { subject: 'Tu solicitud de proveedor ha sido aprobada', h: 'Bienvenido a Ohaana', p: ['Tu solicitud ha sido aprobada. Ya puedes publicar tus servicios y recibir reservas.', 'Último paso: configura tus pagos para cobrar directamente en tu cuenta.'], cta: 'Configurar mis pagos' },
  }[p.lang]
  return { subject: t.subject, ...layout({ lang: p.lang, heading: t.h, lines: [hi(p.lang, p.name), ...t.p], cta: { label: t.cta, url: p.url } }) }
}

export function providerSuspended(p: { lang: Lang; name?: string | null; contactUrl: string }): Rendered {
  const t = {
    fr: { subject: 'Votre compte prestataire est suspendu', h: 'Compte prestataire suspendu', p: ['Votre compte prestataire est suspendu et vos fiches ne sont plus visibles. Les réservations déjà confirmées ne sont pas modifiées.', 'Si vous pensez qu’il s’agit d’une erreur, répondez-nous : nous reviendrons vers vous rapidement.'], cta: 'Nous contacter' },
    en: { subject: 'Your provider account is suspended', h: 'Provider account suspended', p: ['Your provider account is suspended and your listings are no longer visible. Bookings already confirmed are not affected.', 'If you think this is a mistake, reply to us and we will get back to you quickly.'], cta: 'Contact us' },
    es: { subject: 'Tu cuenta de proveedor está suspendida', h: 'Cuenta de proveedor suspendida', p: ['Tu cuenta de proveedor está suspendida y tus fichas ya no son visibles. Las reservas ya confirmadas no se modifican.', 'Si crees que es un error, respóndenos y te contestaremos enseguida.'], cta: 'Contactarnos' },
  }[p.lang]
  return { subject: t.subject, ...layout({ lang: p.lang, heading: t.h, lines: [hi(p.lang, p.name), ...t.p], cta: { label: t.cta, url: p.contactUrl } }) }
}

// ─── Leads (double opt-in) ───────────────────────────────────────────────────

export function leadConfirmation(p: { lang: Lang; confirmUrl: string; unsubscribeUrl: string }): Rendered {
  const t = {
    fr: { subject: 'Confirmez votre inscription à Ohaana', h: 'Plus qu’un clic', p: ['Vous avez demandé à recevoir les actualités d’Ohaana. Confirmez votre adresse pour finaliser l’inscription.'], cta: 'Confirmer mon inscription', foot: 'Vous n’êtes pas à l’origine de cette demande ? Ignorez ce message ou ' },
    en: { subject: 'Confirm your Ohaana subscription', h: 'One more click', p: ['You asked to receive Ohaana news. Confirm your address to complete the subscription.'], cta: 'Confirm my subscription', foot: 'Did not ask for this? Ignore this message or ' },
    es: { subject: 'Confirma tu suscripción a Ohaana', h: 'Un clic más', p: ['Has pedido recibir las novedades de Ohaana. Confirma tu dirección para completar la suscripción.'], cta: 'Confirmar mi suscripción', foot: '¿No fuiste tú? Ignora este mensaje o ' },
  }[p.lang]
  const unsub = { fr: 'désinscrivez-vous', en: 'unsubscribe', es: 'cancela la suscripción' }[p.lang]
  const base = layout({ lang: p.lang, heading: t.h, lines: t.p, cta: { label: t.cta, url: p.confirmUrl }, footnote: `${t.foot}${unsub} : ${safeUrl(p.unsubscribeUrl)}` })
  return { subject: t.subject, ...base }
}
