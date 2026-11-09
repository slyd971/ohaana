import type { SeoLocale } from '@/lib/seo'

// Titres et descriptions des pages publiques statiques (≈ 60 et ≈ 150 caractères).
type Copy = Record<SeoLocale, { title: string; description: string }>

export const PAGE_SEO = {
  search: {
    fr: { title: 'Tous les services à domicile aux Antilles', description: 'Chef privé, massage, photographe, DJ et plus : comparez les prestataires locaux de Guadeloupe, Martinique, Saint-Martin et Saint-Barth et réservez en ligne.' },
    en: { title: 'All at-home services in the French Antilles', description: 'Private chef, massage, photographer, DJ and more: compare local providers in Guadeloupe, Martinique, Saint-Martin and Saint-Barth and book online.' },
    es: { title: 'Todos los servicios a domicilio en las Antillas', description: 'Chef privado, masaje, fotógrafo, DJ y más: compara profesionales locales de Guadalupe, Martinica, San Martín y San Bartolomé y reserva en línea.' },
  },
  about: {
    fr: { title: 'À propos', description: 'Ohaana réunit des prestataires locaux sélectionnés aux Antilles pour qu’ils viennent jusqu’à votre villa, votre gîte ou votre maison de vacances.' },
    en: { title: 'About us', description: 'Ohaana brings together selected local providers in the French Antilles who come to your villa, gîte or holiday home.' },
    es: { title: 'Acerca de nosotros', description: 'Ohaana reúne a profesionales locales seleccionados en las Antillas que acuden a tu villa, tu gîte o tu casa de vacaciones.' },
  },
  concierge: {
    fr: { title: 'Conciergerie : organisez votre séjour avec Ohaana', description: 'Décrivez votre séjour aux Antilles, notre équipe vous recommande les prestataires adaptés et vous aide à réserver.' },
    en: { title: 'Concierge: plan your stay with Ohaana', description: 'Tell us about your stay in the French Antilles and our team recommends the right providers and helps you book.' },
    es: { title: 'Conserjería: organiza tu estancia con Ohaana', description: 'Cuéntanos tu estancia en las Antillas y nuestro equipo te recomienda los profesionales adecuados y te ayuda a reservar.' },
  },
  terms: {
    fr: { title: 'Conditions générales d’utilisation', description: 'Les conditions d’utilisation de la plateforme Ohaana : réservation, paiement, annulation et responsabilités.' },
    en: { title: 'Terms of use', description: 'The terms of use of the Ohaana platform: booking, payment, cancellation and responsibilities.' },
    es: { title: 'Condiciones de uso', description: 'Las condiciones de uso de la plataforma Ohaana: reserva, pago, cancelación y responsabilidades.' },
  },
  privacy: {
    fr: { title: 'Politique de confidentialité', description: 'Comment Ohaana collecte, utilise et protège vos données personnelles, et comment exercer vos droits.' },
    en: { title: 'Privacy policy', description: 'How Ohaana collects, uses and protects your personal data, and how to exercise your rights.' },
    es: { title: 'Política de privacidad', description: 'Cómo recoge, utiliza y protege Ohaana tus datos personales y cómo ejercer tus derechos.' },
  },
  providerTerms: {
    fr: { title: 'Conditions générales prestataires', description: 'Les conditions de présence d’un prestataire sur Ohaana : accès, commission, paiement, annulations et responsabilités.' },
    en: { title: 'Provider terms', description: 'The conditions for providers on Ohaana: access, commission, payment, cancellations and responsibilities.' },
    es: { title: 'Condiciones para proveedores', description: 'Las condiciones de presencia de un proveedor en Ohaana: acceso, comisión, pago, cancelaciones y responsabilidades.' },
  },
  cookies: {
    fr: { title: 'Politique de cookies', description: 'Les cookies utilisés par Ohaana : uniquement ceux qui sont strictement nécessaires au fonctionnement du site.' },
    en: { title: 'Cookie policy', description: 'The cookies used by Ohaana: only those strictly necessary for the site to work.' },
    es: { title: 'Política de cookies', description: 'Las cookies que usa Ohaana: solo las estrictamente necesarias para el funcionamiento del sitio.' },
  },
  legal: {
    fr: { title: 'Mentions légales', description: 'Éditeur, hébergeur et informations légales du site Ohaana.' },
    en: { title: 'Legal notice', description: 'Publisher, host and legal information for the Ohaana website.' },
    es: { title: 'Aviso legal', description: 'Editor, alojamiento e información legal del sitio web de Ohaana.' },
  },
} satisfies Record<string, Copy>

export type PageKey = keyof typeof PAGE_SEO
