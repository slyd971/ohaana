# Conformité Ohaana — points à faire valider (Prompt 11)

> Je ne suis pas juriste. Les textes publiés (CGU/CGV, CGU prestataires, confidentialité, cookies, mentions légales) sont des **brouillons** qui décrivent le fonctionnement réel de la plateforme ; un bandeau « en cours de validation juridique » reste affiché tant que `LEGAL_DRAFT` vaut `true` dans `lib/legal/versions.ts`.

## 1. À renseigner par vous (aucune valeur inventée)

Variables Vercel (Production et Preview), affichées dans les mentions légales. Tant qu'une valeur manque, la page affiche « [À COMPLÉTER] ».

| Variable | Contenu |
|---|---|
| `NEXT_PUBLIC_COMPANY_NAME` | Dénomination sociale |
| `NEXT_PUBLIC_COMPANY_FORM` | Forme juridique (SAS, SARL, entreprise individuelle…) |
| `NEXT_PUBLIC_COMPANY_CAPITAL` | Capital (si société) |
| `NEXT_PUBLIC_COMPANY_SIREN` | SIREN |
| `NEXT_PUBLIC_COMPANY_RCS` | Ville d'immatriculation (RCS ou RM) |
| `NEXT_PUBLIC_COMPANY_VAT` | N° de TVA intracommunautaire, si assujetti |
| `NEXT_PUBLIC_COMPANY_ADDRESS` | Siège social |
| `NEXT_PUBLIC_COMPANY_PUBLISHER` | Directeur de la publication |
| `NEXT_PUBLIC_CONTACT_EMAIL`, `NEXT_PUBLIC_PRIVACY_EMAIL` | Contacts (défaut : contact@ / privacy@ohaana.fr — les boîtes doivent exister) |

Aussi à compléter dans `lib/legal/content/terms.ts` : le **médiateur de la consommation** (désignation obligatoire pour un professionnel qui vend à des consommateurs).

## 2. Questions à poser à un avocat

**Rôle et responsabilité**
1. Ohaana est-elle un simple intermédiaire (mise en relation) ou, vu le paiement et la commission prélevée via Stripe Connect, une « plateforme en ligne » au sens du Code de la consommation (art. L111-7) avec obligations d'information renforcées ? Quelles mentions exactes ?
2. Le modèle « paiement direct sur le compte du prestataire + commission d'application » évite-t-il le statut d'établissement de paiement / d'agent de paiement ? Faut-il un mandat d'encaissement ou des conditions Stripe Connect spécifiques ?
3. Quelle responsabilité pour Ohaana en cas de dommage causé par un prestataire ? Les clauses de limitation du brouillon sont-elles valables envers des consommateurs ?

**Consommateurs**
4. Les prestations (massage, chef, photographe…) relèvent-elles de l'exception du droit de rétractation pour « activités de loisirs à date déterminée » (art. L221-28 12°) ? Le brouillon l'affirme ; à confirmer service par service.
5. Médiation de la consommation : quel médiateur choisir ? Mentions obligatoires.
6. Classement des résultats et mises en avant (art. L111-7 et règlement P2B) : la formulation actuelle suffit-elle ? Les « fiches mises en avant » sont-elles à signaler comme telles ?
7. Avis : les conditions de collecte et de contrôle décrites (avis uniquement après réservation) suffisent-elles ? Faut-il indiquer la date de l'expérience ?

**Prestataires**
8. Requalification en salariat / travail dissimulé : quelles vérifications minimales à l'inscription (SIRET, attestation de vigilance URSSAF, assurance) et à quelle fréquence ?
9. Un prestataire « particulier » peut-il être admis (activité occasionnelle) ? Seuil et formulation.
10. Obligations déclaratives de la plateforme envers l'administration fiscale (revenus perçus via la plateforme, DAC7) et envers les prestataires (récapitulatif annuel).
11. Faut-il un contrat-cadre signé (et non une simple case à cocher) ? Valeur probante de la table `consents`.

**Données (RGPD)**
12. Durées de conservation proposées (comptes inactifs 3 ans, comptabilité 10 ans, newsletter 3 ans, journaux 12 mois) : à confirmer.
13. Régions d'hébergement de Supabase et de Vercel (UE ?) et mécanismes de transfert à mentionner ; besoin d'un DPA signé avec chaque sous-traitant ; registre des traitements ; faut-il un DPO ?
14. Conservation des pièces d'assurance et du SIRET des prestataires : base légale et durée.

## 3. Questions à poser à un expert-comptable

1. **TVA** — mon état des lieux, à confirmer : Guadeloupe et Martinique appliquent une TVA aux taux spécifiques des DOM (normal 8,5 %, réduit 2,1 %) ; Saint-Martin et Saint-Barthélemy, collectivités d'outre-mer, n'appliquent pas la TVA. Qu'en est-il pour une plateforme basée en métropole ou en Guadeloupe qui facture une commission à des prestataires de plusieurs territoires ?
2. Qui facture quoi : le prestataire facture la prestation au voyageur ; Ohaana facture sa commission au prestataire. Comment émettre les factures de commission (automatisation) ? Franchise en base de TVA des micro-entrepreneurs : impact sur les factures ?
3. Comptabilisation d'une commission d'application Stripe (produit) et des remboursements (restitution partielle de la commission).
4. Statut de la société Ohaana : seuils, régime de TVA, obligation de facturation électronique.

## 4. Checklist de vérification à l'onboarding prestataire

Dans l'espace admin, page du prestataire, bloc « Vérification du dossier » (le bouton « Marquer comme vérifié » ne s'active que si le dossier est complet) :

- [ ] Statut déclaré cohérent avec l'activité (un particulier à titre habituel : à examiner)
- [ ] SIRET valide (clé de contrôle automatique) **et** existant dans l'annuaire des entreprises, activité compatible
- [ ] Attestation d'assurance RC professionnelle lisible, nominative, couvrant l'activité, en cours de validité
- [ ] Identité du titulaire cohérente avec le dossier (et avec le compte Stripe)
- [ ] CGU prestataires acceptées (version enregistrée dans `consents`)
- [ ] Compte de paiement Stripe actif
- [ ] Contrôle de l'assurance à refaire avant sa date de fin (alerte à 30 jours dans le panneau)

Sans vérification, l'approbation d'un prestataire demande une confirmation explicite (« Approuver sans vérification ») qui est **journalisée**.

## 5. Ce que fait le produit (déjà en code)

- Acceptation **versionnée** des CGU et de la politique de confidentialité à l'inscription (formulaire et Google), des CGU prestataires à la saisie du statut — table `consents` (horodatage serveur, non modifiable par l'utilisateur).
- **Export** de ses données (JSON) et **suppression** du compte depuis les réglages : effacement complet sans historique de réservation ; sinon anonymisation (les écritures comptables restent). Refus tant qu'une prestation confirmée est à venir.
- Statut professionnel déclaré par le prestataire, **jamais public** ; vérification par l'équipe ; toute modification retire la vérification.

## 6. Limites connues

- Pas de nouvelle demande d'acceptation automatique quand une version change (à prévoir : bandeau à la connexion).
- Les textes ne sont rédigés qu'en français (la version française fait foi) ; traduction à faire après validation.
- Vérification du SIRET, de l'assurance et de l'identité : **manuelle** (aucune API Sirene branchée).
- Le bandeau de cookies n'est pas nécessaire tant qu'aucun traceur non essentiel n'est ajouté (aucun aujourd'hui) ; il le deviendra avec toute mesure d'audience.
