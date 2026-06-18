import { Link } from '@/lib/i18n/navigation'
import { ChevronLeft } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-coconut pt-16">
      <div className="max-w-2xl mx-auto px-5 py-10 pb-24">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-stone hover:text-charcoal mb-8">
          <ChevronLeft size={16} /> Retour
        </Link>

        <h1 className="text-3xl font-display text-charcoal mb-2">Politique de confidentialité</h1>
        <p className="text-sm text-stone mb-10">Dernière mise à jour : juin 2026</p>

        <div className="prose prose-sm max-w-none space-y-8 text-charcoal-soft leading-relaxed">

          <section>
            <h2 className="text-lg font-semibold text-charcoal mb-3">1. Données collectées</h2>
            <p>Ohaana collecte les données suivantes lors de votre utilisation de la plateforme :</p>
            <ul className="mt-2 space-y-1 list-disc list-inside text-sm">
              <li>Informations d'identification : nom, adresse email, numéro de téléphone</li>
              <li>Données de réservation : dates, services choisis, préférences</li>
              <li>Données de paiement (traitées par Stripe — nous ne stockons pas vos coordonnées bancaires)</li>
              <li>Données de navigation : pages visitées, durée de session, appareil utilisé</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-charcoal mb-3">2. Utilisation des données</h2>
            <p>Vos données sont utilisées pour :</p>
            <ul className="mt-2 space-y-1 list-disc list-inside text-sm">
              <li>Gérer vos réservations et vous mettre en relation avec les prestataires</li>
              <li>Vous envoyer des confirmations et rappels de réservation</li>
              <li>Améliorer nos services et personnaliser votre expérience</li>
              <li>Vous informer des nouvelles expériences et offres (avec votre consentement)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-charcoal mb-3">3. Partage des données</h2>
            <p className="text-sm">Nous ne vendons jamais vos données personnelles. Vos informations sont partagées uniquement avec :</p>
            <ul className="mt-2 space-y-1 list-disc list-inside text-sm">
              <li>Les prestataires concernés par votre réservation (nom, contact, détails de la prestation)</li>
              <li>Stripe pour le traitement sécurisé des paiements</li>
              <li>Nos outils analytiques internes (données anonymisées)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-charcoal mb-3">4. Vos droits</h2>
            <p className="text-sm">Conformément au RGPD, vous disposez des droits suivants :</p>
            <ul className="mt-2 space-y-1 list-disc list-inside text-sm">
              <li>Droit d'accès à vos données personnelles</li>
              <li>Droit de rectification en cas d'informations incorrectes</li>
              <li>Droit à l'effacement ("droit à l'oubli")</li>
              <li>Droit à la portabilité de vos données</li>
              <li>Droit d'opposition au traitement marketing</li>
            </ul>
            <p className="text-sm mt-3">Pour exercer ces droits : <a href="mailto:privacy@ohaana.com" className="text-deep-green underline underline-offset-2">privacy@ohaana.com</a></p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-charcoal mb-3">5. Cookies</h2>
            <p className="text-sm">Ohaana utilise des cookies essentiels au fonctionnement de la plateforme (session, préférences de langue) et des cookies analytiques anonymisés. Vous pouvez gérer vos préférences dans les paramètres de votre navigateur.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-charcoal mb-3">6. Conservation des données</h2>
            <p className="text-sm">Vos données sont conservées pendant la durée de votre relation avec Ohaana, puis archivées 3 ans conformément aux obligations légales françaises, et supprimées définitivement à l'issue de cette période.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-charcoal mb-3">7. Contact</h2>
            <p className="text-sm">Ohaana SAS — Guadeloupe, France<br />
            DPO : <a href="mailto:privacy@ohaana.com" className="text-deep-green underline underline-offset-2">privacy@ohaana.com</a></p>
          </section>
        </div>
      </div>
    </div>
  )
}
