# Ohaana — Marketplace lifestyle caribéenne premium

MVP démo-investisseur. Next.js 16 · TypeScript strict · Supabase · Stripe Connect · Tailwind v4 · Framer Motion · next-intl

## Stack

| Couche | Technologie |
|--------|------------|
| Framework | Next.js 16 App Router |
| Auth & BDD | Supabase (PostgreSQL + RLS + Auth + Storage) |
| Paiement | Stripe Connect Express (20% plateforme / 80% prestataire) |
| Styles | Tailwind CSS v4 + CSS variables design tokens |
| Animations | Framer Motion |
| i18n | next-intl (fr défaut / en / es) |
| Validation | Zod |
| Déploiement | Vercel + Supabase Cloud |

## Setup local

### 1. Cloner et installer

```bash
git clone <repo> ohaana
cd ohaana
npm install
```

### 2. Variables d'environnement

```bash
cp .env.local.example .env.local
# Remplir toutes les valeurs (voir .env.local.example)
```

Créer un projet sur [supabase.com](https://supabase.com) et récupérer :
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (clé `sb_publishable_…` ; l'ancienne `NEXT_PUBLIC_SUPABASE_ANON_KEY` reste acceptée)
- `SUPABASE_SERVICE_ROLE_KEY`

Créer un compte sur [stripe.com](https://stripe.com) et récupérer :
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET` (depuis la CLI Stripe)

### 3. Base de données (Supabase)

```bash
# Via Supabase CLI (premier usage : `supabase init` crée supabase/config.toml)
supabase login
supabase link --project-ref <your-project-ref>
supabase db push            # applique supabase/migrations/001 → 008
# Données de démo (local uniquement) :
supabase db reset           # rejoue les migrations puis supabase/seed.sql
```

| Migration | Contenu |
|---|---|
| `001_schema.sql` | Tables, enums, triggers `updated_at` |
| `002_rls.sql` | RLS valide (une commande par policy), helpers de rôle |
| `003_marketplace_extensions.sql` | Statuts de service, slugs, i18n ES, politiques d'annulation, leads, candidatures, `webhook_events`, index anti double-réservation |
| `004_security_and_rpc.sql` | Triggers de protection de colonnes, RPC `create_booking` / `cancel_booking` / `provider_set_booking_status` / `create_review`, vues publiques, `purge_demo_data()` |
| `005_storage.sql` | Buckets `service-images` (public) et `provider-docs` (privé) + policies |
| `008_public_availability.sql` | Vue `public_slot_availability` (créneaux réellement libres, sans données de réservation) |
| `006_reference_data.sql` | Catégories et politiques d'annulation (données réelles) |
| `007_become_provider.sql` | RPC `become_provider()` (inscription prestataire via Google) |

Règle d'or : **aucune écriture client directe** sur `bookings`, `payments`, `reviews`, `notifications`. Tout passe par les RPC ou par la clé `service_role` côté serveur (webhooks).

Données de démo : `supabase/seed.sql` (toutes les lignes sont `is_demo = true`; le catalogue statique `lib/data/seed.ts` a été supprimé, le site lit la base). Avant le lancement réel : `select public.purge_demo_data();`.

Tests de sécurité de la base (Postgres en mémoire via PGlite, sans Docker) :

```bash
npm run db:test   # migrations + seed + supabase/tests/security.sql
```

### 3 bis. Authentification (Supabase Auth)

Dans le dashboard Supabase → **Authentication** :

1. **URL Configuration**
   - *Site URL* : l'URL publique (ex. `https://www.ohaana.fr`).
   - *Redirect URLs* : `http://localhost:3000/api/auth/callback`, `https://www.ohaana.fr/api/auth/callback` et, pour les previews Vercel, `https://*.vercel.app/api/auth/callback`.
2. **Sign In / Providers** : *Email* activé avec **Confirm email = ON**. Google : activer, renseigner Client ID / Secret (Google Cloud Console → URI de redirection autorisée : `https://<ref>.supabase.co/auth/v1/callback`).
3. **Email Templates** (pour que les liens fonctionnent aussi quand l'email est ouvert sur un autre appareil) — remplacer le lien de chaque template par :

| Template | Lien |
|---|---|
| Confirm signup | `{{ .RedirectTo }}&token_hash={{ .TokenHash }}&type=signup` |
| Magic link | `{{ .RedirectTo }}&token_hash={{ .TokenHash }}&type=magiclink` |
| Reset password | `{{ .RedirectTo }}&token_hash={{ .TokenHash }}&type=recovery` |

4. **SMTP personnalisé** (Resend, etc.) : l'envoi par défaut de Supabase est limité à quelques emails par heure.

Promouvoir un administrateur (une fois le compte créé et confirmé) :

```bash
# SUPABASE_SERVICE_ROLE_KEY dans .env.local, jamais dans une variable NEXT_PUBLIC_*
npm run make-admin -- toi@exemple.com --yes
```

Tests de bout en bout (Chrome local) : `npm run test:e2e` (gardes de routes, validation, callback). Le parcours complet avec boîte mail : `E2E_FULL=1 E2E_TEST_EMAIL=… E2E_TEST_PASSWORD=… npm run test:e2e`.

**Back-office (prestataire → admin → public).** `tests/e2e/backoffice-guards.spec.ts` (sans compte) vérifie que chaque page de l'espace pro renvoie vers `/login`. `tests/e2e/backoffice.spec.ts` déroule tout le parcours : création d'un service, refus de la soumission sans 3 photos, envoi de 3 photos, soumission, refus par l'admin avec motif, nouvelle soumission, publication, ouverture par un visiteur anonyme, puis archivage du service de test.

1. Copiez `.env.e2e.example` en `.env.e2e` (ignoré par git) et renseignez deux comptes de **test** : un admin et un prestataire approuvé, tous deux e-mail + mot de passe (un compte Google peut définir un mot de passe depuis *Paramètres → Mon compte*).
2. Lancez : `PW_BASE_URL=http://localhost:3000 npm run test:e2e` (réutilise votre `npm run dev`, car Next n'autorise qu'un seul serveur de dev par dossier), ou sans `PW_BASE_URL` pour que Playwright démarre son propre serveur sur le port 3200.

⚠️ Ces tests écrivent de vraies lignes dans le projet Supabase de `.env.local` (le service de test finit archivé, jamais supprimé). Utilisez un projet de test dès que vous en avez un.

Sans CLI : `npm run db:bundle` génère `supabase/.generated/schema.sql` (ou `npm run db:bundle -- --with-seed` pour inclure les données de démo), à coller dans le SQL editor.

### 4. Lancer en développement

```bash
npm run dev
# → http://localhost:3000
```

### 5. Stripe webhooks (local)

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## Déploiement Vercel

1. Connecter le repo GitHub à Vercel
2. Ajouter toutes les variables d'environnement dans le dashboard Vercel
3. `npm run build` doit passer sans erreur
4. Push → déploiement automatique

## Architecture

```
app/
├── [locale]/           # Routes localisées (fr/en/es)
│   ├── (tourist)/      # Homepage, recherche, profil, réservations
│   ├── (auth)/         # Login, register
│   ├── (provider)/     # Dashboard prestataire
│   └── (admin)/        # Dashboard admin
├── api/
│   ├── auth/callback/  # OAuth redirect handler
│   └── webhooks/stripe/# Stripe webhooks
components/
├── ui/                 # Button, Input, Badge, Skeleton…
└── layout/             # Header, BottomNav, Footer
lib/
├── supabase/           # client.ts (browser), server.ts (RSC/Route)
├── stripe/             # client.ts, createPaymentIntent
├── i18n/               # routing, navigation, request config
└── utils.ts            # cn(), formatPrice(), computeFees()
supabase/migrations/
├── 001_schema.sql … 008_public_availability.sql   # voir tableau ci-dessus
supabase/seed.sql       # données de démo (is_demo = true)
supabase/tests/         # tests de sécurité SQL (npm run db:test)
messages/
├── fr.json
├── en.json
└── es.json
types/
└── database.ts         # Types TypeScript des tables Supabase
```

## Roadmap MVP

- [x] **Phase 1** — Fondations : Next.js, Supabase schema+RLS, Auth, Design tokens, Layout
- [~] **Phase 2** (UI maquettée sur données statiques ; backend, paiement et persistance à faire)
- [ ] **Phase 2 bis — Backend réel** : RLS v2, auth Supabase, couche données, Stripe Connect, back-offices prestataire/admin (voir `rapports/audit-complet-2026-11-04.md`)
- [ ] **Phase 2** — Expérience touriste : Onboarding, Homepage Netflix, Recherche, Fiches prestataires, Tunnel réservation, Paiement Stripe, Mes voyages, Favoris, Recommandations, Mode Concierge
- [ ] **Phase 3** — Dashboards : Prestataire, Concierge, Admin
- [ ] **Phase 4** — Finitions : Seed data Guadeloupe, Analytics, README production

## Variables d'environnement requises

Voir `.env.local.example` pour la liste complète. Points d'attention :

- `NEXT_PUBLIC_SITE_URL` : domaine public (canonical, sitemap, OG). Défaut : `https://www.ohaana.fr`.
- `NEXT_PUBLIC_DEMO_MODE=true` désactive **toute** l'authentification (démo investisseur uniquement, déploiement marqué `noindex`). Désactivé par défaut.
- `NEXT_PUBLIC_WHATSAPP_NUMBER` : si vide, les boutons WhatsApp sont masqués.

## Couche de données publique

- `lib/data/services.ts` (serveur) : `getHomeData`, `searchServices` (filtres + pagination), `getServiceByIdOrSlug`, `getAvailability`, `getReviews`… Tout est mis en cache avec `unstable_cache` (tags `services` / `availability` / `reviews`, 5 min) : après une modification en back-office, appeler `revalidateTag('services')`.
- Lecture publique uniquement via la clé publishable (`lib/supabase/public.ts`) : vues `public_provider_profiles`, `public_reviews`, `public_slot_availability`. Les téléphones des prestataires ne sont **pas** publics (RPC `get_provider_contact`, après confirmation).
- `safe()` : si la base est injoignable, les pages affichent un état vide au lieu de planter le build.
- Utilisateur connecté (client navigateur, RLS) : favoris (`hooks/useFavorites`), réservations (`useMyBookings`), notifications, préférences.

## Paiement Stripe (mode test)

Le paiement utilise le **Payment Element** de Stripe : cartes bancaires (3-D Secure), **Apple Pay** et **Google Pay** s'affichent automatiquement selon l'appareil — ce n'est pas une alternative à Stripe, c'en est une méthode.

1. Stripe Dashboard → bascule **Mode test** → *Developers → API keys*.
2. Variables (`.env.local` en local ; Vercel → Settings → Environment Variables pour la démo) :
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_…`
   - `STRIPE_SECRET_KEY=sk_test_…` (secret : jamais dans le chat ni dans une variable `NEXT_PUBLIC_*`)
3. Redéployer (les variables `NEXT_PUBLIC_*` sont figées au build).
4. Carte de test : `4242 4242 4242 4242`, date future, CVC au choix. 3-D Secure : `4000 0027 6000 3184`. Refus : `4000 0000 0000 0002`.
5. **Apple Pay** : Dashboard → *Settings → Payment methods → Apple Pay → Add new domain* (le domaine doit être servi en HTTPS ; visible uniquement dans Safari / appareils Apple avec une carte dans Wallet). **Google Pay** : visible dans Chrome avec une carte enregistrée.

`POST /api/checkout` calcule toujours le montant côté serveur (prix du service × participants + frais de service) ; le navigateur n'envoie que des identifiants.
- **Démo** (`NEXT_PUBLIC_DEMO_MODE=true`) : aucun compte ni réservation en base, uniquement des clés de test (`sk_test_` ou `rk_test_`) acceptées.
- **Réel** : exige un utilisateur connecté, appelle `create_booking` (verrou de créneau, prix serveur) puis crée le PaymentIntent lié à la réservation ; le webhook `payment_intent.succeeded` confirme la réservation. Requiert `SUPABASE_SERVICE_ROLE_KEY` et `STRIPE_WEBHOOK_SECRET`. Reste à faire (Prompt 6) : Stripe Connect (virement au prestataire), remboursements, idempotence des webhooks.
