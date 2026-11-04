import { Link } from '@/lib/i18n/navigation'
import { ChevronLeft } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-coconut pt-16">
      <div className="max-w-2xl mx-auto px-5 py-10 pb-24">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-stone hover:text-charcoal mb-8">
          <ChevronLeft size={16} /> Retour
        </Link>

        <h1 className="text-3xl font-display text-charcoal mb-2">Conditions générales d&apos;utilisation</h1>
        <p className="text-sm text-stone mb-10">Dernière mise à jour : juin 2026</p>

        <div className="space-y-8 text-sm text-charcoal-soft leading-relaxed">

          <section>
            <h2 className="text-lg font-semibold text-charcoal mb-3">1. Objet</h2>
            <p>Les présentes conditions générales régissent l&apos;utilisation de la plateforme Ohaana, marketplace de services et d&apos;expériences à domicile dans les Antilles françaises. En accédant à la plateforme, vous acceptez sans réserve les présentes conditions.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-charcoal mb-3">2. Description du service</h2>
            <p>Ohaana est une plateforme de mise en relation entre des voyageurs (ci-après &quot;Clients&quot;) et des prestataires locaux (ci-après &quot;Prestataires&quot;) proposant des services à domicile : cuisine, bien-être, photographie, musique, coaching sportif et autres expériences.</p>
            <p className="mt-2">Ohaana agit en qualité d&apos;intermédiaire et n&apos;est pas partie prenante à la prestation entre le Client et le Prestataire.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-charcoal mb-3">3. Inscription et compte</h2>
            <p>L&apos;utilisation complète de la plateforme nécessite la création d&apos;un compte. Vous vous engagez à fournir des informations exactes et à maintenir la confidentialité de vos identifiants. Ohaana se réserve le droit de suspendre tout compte en cas d&apos;utilisation frauduleuse.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-charcoal mb-3">4. Réservation et paiement</h2>
            <p>Toute réservation effectuée via Ohaana est soumise à confirmation par le Prestataire. Le paiement est sécurisé via Stripe et débité uniquement après confirmation. Des frais de service de 10% sont appliqués sur chaque transaction.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-charcoal mb-3">5. Annulation et remboursement</h2>
            <ul className="space-y-1.5 list-disc list-inside">
              <li>Annulation plus de 24h avant la prestation : remboursement intégral</li>
              <li>Annulation entre 12h et 24h avant : remboursement de 50%</li>
              <li>Annulation moins de 12h avant : aucun remboursement</li>
            </ul>
            <p className="mt-2">En cas d&apos;annulation par le Prestataire, le Client est remboursé intégralement dans un délai de 5 jours ouvrés.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-charcoal mb-3">6. Responsabilités</h2>
            <p>Ohaana ne peut être tenu responsable des dommages résultant de l&apos;exécution des prestations par les Prestataires. Chaque Prestataire certifié est assuré en responsabilité civile professionnelle. Ohaana vérifie les documents obligatoires mais ne garantit pas la qualité des prestations.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-charcoal mb-3">7. Propriété intellectuelle</h2>
            <p>L&apos;ensemble des contenus de la plateforme (marque, visuels, textes, interface) est la propriété exclusive d&apos;Ohaana SAS et est protégé par les lois sur la propriété intellectuelle. Toute reproduction est interdite sans autorisation écrite préalable.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-charcoal mb-3">8. Droit applicable</h2>
            <p>Les présentes CGU sont soumises au droit français. En cas de litige, les parties s&apos;engagent à rechercher une solution amiable avant tout recours judiciaire. Le tribunal compétent est celui de Pointe-à-Pitre, Guadeloupe.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-charcoal mb-3">9. Contact</h2>
            <p>Ohaana SAS — Guadeloupe, France<br />
            <a href="mailto:legal@ohaana.com" className="text-deep-green underline underline-offset-2">legal@ohaana.com</a></p>
          </section>
        </div>
      </div>
    </div>
  )
}
