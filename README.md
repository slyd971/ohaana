# Ohaana — Marketplace lifestyle caribéenne premium

MVP démo-investisseur. Next.js 15 · TypeScript strict · Supabase · Stripe Connect · Tailwind v4 · Framer Motion · next-intl

## Stack

| Couche | Technologie |
|--------|------------|
| Framework | Next.js 15 App Router |
| Auth & BDD | Supabase (PostgreSQL + RLS + Auth + Storage) |
| Paiement | Stripe Connect Express (20% plateforme / 80% prestataire) |
| Styles | Tailwind CSS v4 + CSS variables design tokens |
| Animations | Framer Motion |
| i18n | next-intl (fr défaut / en) |
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
# Remplir toutes les valeurs
```

Créer un projet sur [supabase.com](https://supabase.com) et récupérer :
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Créer un compte sur [stripe.com](https://stripe.com) et récupérer :
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET` (depuis la CLI Stripe)

### 3. Migrations Supabase

```bash
# Via Supabase CLI
supabase login
supabase link --project-ref <your-project-ref>
supabase db push

# Ou manuellement dans le SQL editor Supabase :
# 1. supabase/migrations/001_schema.sql
# 2. supabase/migrations/002_rls.sql
```

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
├── [locale]/           # Routes localisées (fr/en)
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
├── 001_schema.sql      # Toutes les tables + triggers
└── 002_rls.sql         # Row Level Security
messages/
├── fr.json
└── en.json
types/
└── database.ts         # Types TypeScript des tables Supabase
```

## Roadmap MVP

- [x] **Phase 1** — Fondations : Next.js, Supabase schema+RLS, Auth, Design tokens, Layout
- [ ] **Phase 2** — Expérience touriste : Onboarding, Homepage Netflix, Recherche, Fiches prestataires, Tunnel réservation, Paiement Stripe, Mes voyages, Favoris, Recommandations, Mode Concierge
- [ ] **Phase 3** — Dashboards : Prestataire, Concierge, Admin
- [ ] **Phase 4** — Finitions : Seed data Guadeloupe, Analytics, README production

## Variables d'environnement requises

Voir `.env.local.example` pour la liste complète.
