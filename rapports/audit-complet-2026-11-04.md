# Audit complet Ohaana — 04/11/2026

**Contexte :** MVP / démo investisseur, backend non terminé (paiement, base de données, back-office).
**Méthode :** lecture du code (≈12 000 lignes), `tsc`, `eslint`, `next build`, sondes HTTP sur `ohaana.vercel.app` et `ohaana.com`, revue visuelle du site déployé.
**Limite :** la revue visuelle s'est faite sur desktop ~800 px uniquement. Mobile, Lighthouse et accessibilité clavier ne sont pas testés.

## Scores

| Axe | Score | Commentaire |
|---|---|---|
| Design / identité | 8/10 | Direction artistique premium cohérente, photos de qualité. Quelques problèmes de contraste et de reveal. |
| Copywriting | 7.5/10 | Promesse claire ("Le chef vient chez vous"). Preuve sociale et chiffres non réels. |
| SEO technique | 4/10 | Bonne base (JSON-LD, hreflang), mais canonical cassé, sitemap/robots sur le mauvais domaine, quasi aucune metadata par page. |
| Fonctionnalités réelles | 2/10 | Tout le parcours est une maquette. Rien n'est persisté. |
| Sécurité / robustesse | 2/10 | Auth désactivée en prod par défaut, RLS invalide et escaladable, redirection ouverte. |
| Qualité de code | 6/10 | `tsc` OK, build OK, mais 47 erreurs ESLint, 0 test, données en dur partout. |

---

## 1. Risques critiques (à traiter avant toute mise en ligne publique)

### 1.1 Zones privées accessibles à tout le monde en production
`proxy.ts` : `isDemoMode()` renvoie `true` dès que `NODE_ENV === 'production'` (sauf si `NEXT_PUBLIC_DEMO_MODE=false`). Constaté : `https://ohaana.vercel.app/admin/dashboard` et `/provider/dashboard` répondent **200** sans connexion. Les routes `/partner/*` ne sont de toute façon dans aucune liste protégée.

### 1.2 Les migrations SQL ne s'exécuteront pas telles quelles
`002_rls.sql` utilise `for insert update delete` et `for select update` : Postgres n'accepte qu'**une seule commande par policy**. Le `supabase db push` échouera sur `provider_profiles`, `concierge_profiles`, `service_categories`, `services`, `service_images`, `availability_slots` et `notifications`.

### 1.3 Failles RLS (même une fois la syntaxe corrigée)
- **Auto-promotion admin** : `users: update own` laisse l'utilisateur modifier sa propre colonne `role` → `admin`.
- **Auto-approbation prestataire** : un prestataire peut passer `is_approved`, `stripe_onboarded`, `stripe_account_id`, `avg_rating` à la valeur de son choix.
- **Réservation falsifiable** : `bookings: tourist insert` ne contraint ni `status` ni `total_cents` ; un touriste peut insérer une réservation `confirmed` à 0 €. Le prestataire peut modifier n'importe quelle colonne (dont `total_cents`).
- **Annulation sans garde-fou** : un touriste peut annuler une réservation déjà `completed`.
- **Avis** : aucun contrôle que la réservation est terminée ni qu'elle appartient au touriste.
- **Pas d'anti double-réservation** : aucun lien exclusif slot ↔ booking.
- `provider_profiles` n'est lisible que par les utilisateurs authentifiés → les fiches publiques ne pourront pas charger le prestataire pour un visiteur anonyme.
- Le trigger `handle_new_user` ne crée aucun profil (`tourist_profiles` / `provider_profiles`) et ne gère pas le rôle choisi à l'inscription.

### 1.4 Paiement : rien n'existe côté serveur
- `handlePayment()` dans `reserver/[serviceId]/page.tsx` fait un `setTimeout(1500)` puis affiche "confirmé". Aucun booking créé, aucun paiement.
- Aucune route ne crée de `PaymentIntent` ni de `booking`/`payments` (seul le webhook existe, et il suppose qu'une ligne `payments` existe déjà).
- `/paiement` : cartes et factures fictives, formulaire de carte en champs texte bruts (à remplacer par Stripe Elements, ne jamais manipuler un PAN soi-même).
- Webhook : pas d'idempotence (pas de table des `event.id`), erreurs Supabase ignorées, pas de gestion de `payment_intent.canceled`, `account.updated` (Connect), litiges, remboursements → statut booking. `createAdminClient()` utilise un client `ssr` basé sur les cookies avec la clé service-role : à remplacer par `createClient` de `supabase-js` sans session.
- **Incohérence de commission à trancher** : l'UI fait payer `total + platformFee` au touriste, alors que le webhook recalcule 20 % *sur le montant payé* (`computeFees(intent.amount)`). Le prestataire ne touchera pas le prix qu'il a fixé. La commission concierge (5 %) n'est appliquée nulle part.

### 1.5 Redirection ouverte
`api/auth/callback/route.ts` : `new URL(next, request.url)` accepte `next=https://evil.com` ou `//evil.com`. Il faut n'autoriser que les chemins relatifs commençant par un seul `/`. La redirection d'erreur `/login` ignore aussi la locale.

### 1.6 Les leads sont perdus
Le formulaire de capture (home) fait `console.log` + `localStorage`. Aucun email/WhatsApp collecté n'atteint un serveur.

---

## 2. Problèmes importants

### SEO
1. **Canonical global faux** : `app/[locale]/layout.tsx` définit `alternates.canonical = BASE` pour toutes les pages. `/search`, `/about`, `/concierge`… déclarent la home comme canonique, donc risque de désindexation. Seules les fiches `/prestataires/[id]` surchargent.
2. **`ohaana.com` ne sert pas cette application** : il répond avec un autre site (`<title>Ohaana — Private Chef & Dining Experiences</title>`, hébergeur différent). `sitemap.ts`, `robots.ts`, canonicals, OG et JSON-LD pointent tous vers `ohaana.com`. Sur le déploiement actuel, `/robots.txt` et `/sitemap.xml` répondent 404 (build plus ancien que le code).
3. **Sitemap alimenté par les données fictives** (`SERVICES` du seed) : fausses fiches indexables dès que le domaine pointera ici.
4. **Metadata inexistante** hors layout racine et fiche prestataire : pas de `title`/`description` propres pour `search`, `about`, `concierge`, `privacy`, `terms`. `sitemap` liste `/concierge` mais pas les pages légales.
5. **`hreflang`** identique sur toutes les pages (home uniquement) ; `es` absent des fiches prestataires alors que le sitemap les liste en `es`.
6. **Pas d'URLs de landing programmatiques** (ex. `/guadeloupe/chef-prive`, `/martinique/massage-a-domicile`) : c'est le principal levier SEO d'une marketplace locale, et ils n'existent pas.
7. **JSON-LD** : Organization + WebSite présents (bien). Mais `sameAs: []`, `Review`/`AggregateRating` absents, `Service.offers.availability: InStock` systématique, fil d'Ariane en français même sur `/en`.
8. `<meta viewport>` en **double** dans le HTML rendu (layout + Next).
9. Pages `search` rendues côté client avec filtres via `window.location` : le contenu des listes est peu crawlable, pas de pagination par URL, pas de page filtrée indexable.
10. `keywords` meta : inutile (ignoré par Google), mais mélange "airbnb" ; à retirer.

### Fonctionnel / produit
- **Tout est en données statiques** : `lib/data/seed.ts` (618 lignes, 17 services et 14 prestataires fictifs) alimente home, recherche, fiche et sitemap. Dashboards prestataire, admin, partenaire, concierge, `voyages`, `notifications`, `profile` : données codées en dur.
- Back-office prestataire : `provider/services` n'a que des boutons "Ajouter"/"Modifier" sans action ; l'onboarding (416 lignes) n'enregistre rien.
- Pas de gestion des **disponibilités** : le calendrier de réservation propose des créneaux fixes (`TIMES`) identiques pour tous, sans lien avec `availability_slots`.
- Pas de **messagerie**, pas de flux d'**acceptation par le prestataire** (confirmation manuelle vs instantanée), pas de règles d'**annulation/remboursement**.
- Pas de création de fiche **par l'admin pour le compte d'un prestataire** (vous l'avez demandé) : à prévoir dans le modèle (voir prompts).
- Concierge : WhatsApp en `590690000000`, lien d'accueil `wa.me/0000000000`, `href="#"` dans partner/dashboard, téléphones seed `000 001…` visibles.
- `proxy.ts` : redirections `/` sans préfixe de locale ; rôle `partner` absent du schéma (`user_role` = tourist/provider/concierge/admin) alors que l'UI a un espace partenaire distinct.

### Design / UX
- **Hero** : sur la capture (≈800 px), le titre et le sous-titre blancs sont quasi illisibles sur la photo claire de la piscine. Ajouter un dégradé sombre ou un scrim, vérifier le contraste ≥ 4,5:1.
- **Révélation au scroll** : après un scroll rapide, des sections entières restent vides quelques instants (animations `whileInView`). Prévoir un fallback sans JS/animation (`prefers-reduced-motion`) et ne jamais masquer le contenu au premier rendu (impact SEO et perçu).
- Les prix sur les cartes ("180 € / pers.") sont lisibles, mais la **proposition de valeur (garantie, annulation, prestataires vérifiés)** n'est pas rappelée sur la carte ni dans le tunnel.
- Parcours : les écrans de réservation, paiement et confirmation n'ont ni état d'erreur, ni état vide, ni gestion de session expirée.
- Textes français en dur dans `reserver`, `paiement`, dashboards, mois/jours (`MONTHS_FR`), `toLocaleDateString('fr-FR')` : le parcours est inutilisable en EN/ES.

### Technique / qualité
- `next build` : **OK**. `tsc --noEmit` : **OK**. `eslint` : **47 erreurs, 24 warnings** (37× `react/no-unescaped-entities`, 5× `set-state-in-effect`, 18× variables inutilisées, 4× `any`, 4× `<img>` au lieu de `next/image`).
- i18n : `next-intl` utilisé dans 5 fichiers seulement ; ailleurs, soit du texte en dur, soit des ternaires `L(fr, en, es)` dispersés. Les 3 fichiers `messages/*.json` ont 182 lignes chacun (peu).
- `buildUnsplashUrl(keyword)` ignore son paramètre et renvoie toujours la même image.
- Images : Unsplash en hotlinking pour une grande partie des visuels (licence, disponibilité, cohérence), JPEG locaux non vérifiés (poids).
- Aucun test, aucun CI, pas d'en-têtes de sécurité (CSP, HSTS, X-Frame-Options), pas de monitoring (Sentry), pas d'analytics, pas de bandeau cookies.
- README obsolète : annonce Next 15 (projet en 16.2), référence `.env.local.example` qui n'existe pas, `fr/en` seulement, roadmap non mise à jour.
- `audit-report.md` à la racine date de juin 2026 et ne reflète plus l'état du site.

---

## 3. Forces réelles
- Direction artistique crédible, cohérente avec le positionnement premium ; photographie locale soignée.
- Pile technique moderne et bien choisie (Next 16, Supabase, Stripe Connect, next-intl, Tailwind 4).
- Modèle de données de départ pertinent : rôles, services, créneaux, bookings, payments avec split plateforme/prestataire, reviews, favoris, notifications, `admin_logs`.
- Fiches prestataires avec JSON-LD `Service` + `BreadcrumbList` et metadata dynamiques par fiche.
- Copy d'accroche claire, ciblage villas/Airbnb pertinent, trilingue prévu dès le départ.
- Typage strict et build propre.

## 4. Quick wins (< 1 h chacun)
1. Mettre `NEXT_PUBLIC_DEMO_MODE=false` en production réelle ou protéger `/admin`, `/provider`, `/partner` quelle que soit la config.
2. Corriger l'open redirect de `auth/callback`.
3. Canonical par page (retirer `canonical: BASE` du layout, le définir dans chaque `generateMetadata`).
4. Pointer `robots`/`sitemap`/`metadataBase` vers le vrai domaine via une variable `NEXT_PUBLIC_SITE_URL`.
5. Ajouter un scrim sur le hero.
6. Retirer les placeholders (`wa.me/0000000000`, `href="#"`, numéros `…000…`) ou masquer le bouton tant qu'il n'y a pas de vrai numéro.
7. Supprimer le `<meta viewport>` dupliqué.
8. Corriger les 37 `no-unescaped-entities` (`&apos;` / `{"'"}`), puis le reste du lint.
9. Brancher le formulaire de leads sur une table `leads` Supabase (ou Resend/Airtable) en attendant le reste.

## 5. Plan d'ordre de bataille

| # | Chantier | Dépendances | Effort |
|---|---|---|---|
| 0 | Hygiène & sécurité immédiate | — | 0,5 j |
| 1 | Schéma + RLS v2 + seed SQL | 0 | 1–2 j |
| 2 | Auth réelle & rôles | 1 | 1 j |
| 3 | Couche données (remplacer le seed) | 1, 2 | 2 j |
| 4 | Back-office prestataire | 1–3 | 3–4 j |
| 5 | Back-office admin (dont création de fiche pour un prestataire) | 1–3 | 2–3 j |
| 6 | Réservation + Stripe Connect | 1–4 | 3–4 j |
| 7 | Notifications, emails, leads | 6 | 1–2 j |
| 8 | SEO technique & pages programmatiques | 3 | 2 j |
| 9 | i18n complète | 3 | 1–2 j |
| 10 | Design / accessibilité / performance | en continu | 2 j |
| 11 | Légal & conformité | en parallèle | — |
| 12 | Tests, CI, monitoring | en continu | 1–2 j |

---

# PROMPTS PRÊTS À COLLER (Claude Code)

> Utilisation : un prompt = une session. Dans l'ordre. Fais `git commit` entre chaque. Chaque prompt commence par rappeler de lire `AGENTS.md` : ce Next.js est la v16 et ses docs sont dans `node_modules/next/dist/docs/`.

## Prompt 0 — Hygiène & sécurité immédiate

```
Lis d'abord CLAUDE.md et AGENTS.md (Next.js 16 : consulte node_modules/next/dist/docs/ avant d'écrire du code).

Objectif : sécuriser et assainir le dépôt Ohaana avant d'aller plus loin. Ne touche pas au design.

1. proxy.ts
   - Le "demo mode" ne doit plus s'activer par défaut en production. Il ne s'active que si NEXT_PUBLIC_DEMO_MODE === 'true'. Ajoute un garde-fou : si NODE_ENV === 'production' et demo mode actif, ajoute l'en-tête X-Robots-Tag: noindex.
   - Protège aussi /partner et /concierge/dashboard. Redirige toujours en conservant le préfixe de locale.
   - Un utilisateur sans rôle suffisant est redirigé vers /{locale}/login, pas vers "/".
2. app/api/auth/callback/route.ts : corrige l'open redirect (n'accepte que des chemins relatifs commençant par un seul "/", jamais "//" ni schéma/hôte), conserve la locale pour la redirection d'erreur.
3. SEO de base : crée lib/site.ts exportant SITE_URL (depuis NEXT_PUBLIC_SITE_URL, défaut https://ohaana.vercel.app). Remplace toutes les occurrences de 'https://ohaana.com' (layout, sitemap, robots, prestataires/[id]/layout) par SITE_URL. Retire `alternates.canonical: BASE` du layout racine de locale (chaque page définira le sien). Retire le meta "keywords". Supprime le <meta name="viewport"> dupliqué dans app/[locale]/layout.tsx (utilise l'export `viewport` de Next).
4. Placeholders : supprime ou masque proprement (rendu conditionnel) tout lien wa.me/0000000000, href="#", WHATSAPP_NUMBER '590690000000'. Utilise NEXT_PUBLIC_WHATSAPP_NUMBER ; si vide, n'affiche pas le bouton.
5. Corrige les 47 erreurs ESLint (npx eslint .) sans désactiver de règles : apostrophes échappées, variables inutilisées, `any`, setState dans useEffect (utiliser useSyncExternalStore pour hooks/useDemoAuth.ts), <img> → next/image quand pertinent.
6. Crée .env.local.example avec toutes les variables nécessaires (Supabase, Stripe, SITE_URL, DEMO_MODE, WHATSAPP, RESEND) sans valeur réelle. Mets à jour le README (Next 16, 3 langues, roadmap réelle).
7. Corrige buildUnsplashUrl (paramètre ignoré) ou supprime-la si inutilisée.

Critères de fin : `npx tsc --noEmit`, `npx eslint .` et `npm run build` passent sans erreur. Liste-moi chaque fichier modifié et ce qui reste à faire.
```

## Prompt 1 — Schéma DB + RLS v2 (migration corrective)

```
Lis CLAUDE.md et AGENTS.md. Contexte : supabase/migrations/001_schema.sql et 002_rls.sql. 002 est invalide (Postgres n'accepte qu'une commande par CREATE POLICY : "for insert update delete" et "for select update" échouent) et contient des failles. Crée de NOUVELLES migrations (003_fix_rls.sql, 004_marketplace_extensions.sql) ; ne réécris pas l'historique si 001/002 sont déjà appliquées, sinon corrige 002 directement et dis-le moi.

A. Corriger la syntaxe : une policy par commande (select/insert/update/delete) partout.
B. Sécurité à implémenter (avec triggers BEFORE UPDATE + `with check` + fonctions security definer) :
   - users : l'utilisateur ne peut jamais modifier `role`, `is_active`, `email` ; seul admin le peut.
   - provider_profiles : le prestataire ne peut pas modifier is_approved, stripe_account_id, stripe_onboarded, avg_rating, review_count. Lecture publique (anon) des profils approuvés uniquement, via une vue `public_provider_profiles` sans téléphone/whatsapp si non souhaité.
   - services : un prestataire non approuvé ne peut pas publier (is_active forcé à false tant que is_approved = false). Ajouter `status` enum (draft, pending_review, published, rejected, archived), `created_by_admin_id` nullable, `slug` unique par langue.
   - bookings : INSERT uniquement via RPC `create_booking(service_id, slot_id, guests, notes)` (security definer) qui calcule total_cents côté serveur à partir du service, vérifie capacité et disponibilité, fixe status='pending'. Retire l'INSERT direct pour les clients. Le prestataire ne peut modifier que `status` (pending→confirmed/cancelled_provider/completed) via RPC. Le touriste ne peut annuler que pending/confirmed et selon la politique d'annulation (table `cancellation_policies` : ex. 100 % remboursé jusqu'à 48 h avant).
   - Anti double-réservation : contrainte d'unicité partielle sur bookings(slot_id) where status in ('pending','confirmed').
   - reviews : INSERT uniquement si la booking est `completed`, appartient au touriste, et qu'il n'existe pas déjà d'avis ; calcule provider_id/service_id depuis la booking.
   - payments : aucune écriture client ; uniquement service_role.
   - notifications : policies séparées select/update(is_read uniquement).
C. Fonctionnalités manquantes : tables `leads` (email, destination, whatsapp, source, created_at ; insert anon avec rate limit via contrainte/fonction), `webhook_events` (stripe_event_id unique, type, processed_at) pour l'idempotence, `provider_applications` (candidature prestataire avec statut), `service_translations` ou colonnes es, rôle `partner` ajouté à l'enum user_role (ou table partners/referrals si c'est un programme d'affiliation).
D. Trigger handle_new_user : lit raw_user_meta_data.role (limité à tourist|provider, jamais admin) et crée la ligne tourist_profiles ou provider_profiles correspondante.
E. Storage : buckets `service-images` (lecture publique, écriture limitée au dossier {provider_id}/) et `provider-docs` (privé) avec policies.
F. Index manquants (bookings.provider via service, availability par date, GIN sur tags, trigram sur title).
G. Un fichier supabase/seed.sql qui reprend les données de lib/data/seed.ts (catégories, prestataires, services) avec UUID stables, marqué clairement `is_demo=true` (ajoute la colonne) pour pouvoir les purger avant la vraie mise en ligne.
H. Régénère types/database.ts (supabase gen types) et corrige les erreurs TypeScript.

Fournis aussi un script SQL de tests (pgTAP ou simple) qui prouve : un touriste ne peut pas se promouvoir admin, ne peut pas insérer une réservation à 0 €, ne peut pas lire les réservations d'un autre ; un prestataire ne peut pas s'auto-approuver. Critère de fin : `supabase db reset` passe sans erreur et les tests de sécurité passent.
```

## Prompt 2 — Authentification réelle et rôles

```
Lis CLAUDE.md et AGENTS.md. Prérequis : migrations du prompt 1 appliquées.

Objectif : supprimer l'auth "démo" (localStorage) et brancher Supabase Auth de bout en bout.
- Pages login / register / reset-password : email+mot de passe, magic link et Google OAuth, avec validation Zod, messages d'erreur localisés, états de chargement. register?role=tourist|provider transmis dans user_metadata.role (jamais admin).
- Callback OAuth/magic link et reset password (page de mise à jour du mot de passe) fonctionnels, locale conservée.
- Crée lib/auth/session.ts (getCurrentUser, requireRole(['admin']) côté serveur) et un composant/hook client useUser basé sur onAuthStateChange. Remplace hooks/useDemoAuth.ts, lib/demo-auth.ts, components/layout/DemoBadge.tsx et les boutons "démo" de login. Garde un mode démo uniquement si NEXT_PUBLIC_DEMO_MODE=true.
- Header/BottomNav/Footer : affichent l'état réel (connecté, avatar, rôle, menu selon rôle).
- Les layouts (admin), (provider), (partner), (concierge) vérifient le rôle côté serveur via requireRole en plus du proxy (défense en profondeur).
- Rate limiting / protection basique sur login (Supabase le gère ; ajoute un message clair en cas de dépassement) et confirmation d'email obligatoire.
- Compte admin : script scripts/make-admin.ts (service role, usage local uniquement) pour promouvoir un utilisateur ; ne jamais exposer cela via l'UI.

Critères de fin : inscription touriste, inscription prestataire, connexion, déconnexion, reset de mot de passe testés manuellement et par un test Playwright. Aucune référence restante à getDemoRole en mode non démo.
```

## Prompt 3 — Remplacer le seed statique par Supabase

```
Lis CLAUDE.md et AGENTS.md. Prérequis : prompts 1 et 2.

Objectif : toutes les pages publiques lisent la base, pas lib/data/seed.ts.
- Crée lib/data/services.ts avec des fonctions serveur : getFeaturedServices, getServicesByFilters({island, category, q, priceRange, sort, page}), getServiceBySlugOrId, getProviderPublic, getAvailability(serviceId, from, to), getReviews. Typées avec types/database.ts, requêtes avec select ciblé (pas de select *).
- Home : Server Component qui récupère les rangées (HOME_ROWS) ; garde les interactions (île, ambiance) dans de petits composants client. Mets en cache avec `use cache` / revalidation (consulte les docs Next 16 locales) et un tag `services` invalidé après modification dans le back-office.
- /search : filtres synchronisés avec l'URL (searchParams), pagination par URL, rendu serveur, états vide/chargement/erreur. Recherche plein texte (pg_trgm).
- /prestataires/[id] : charge le service réel, avis réels, disponibilités réelles ; 404 propre si inexistant ; generateStaticParams depuis la base.
- Favoris : table favorites réelle pour connectés ; invités → localStorage puis fusion à la connexion.
- Voyages / notifications / profile : lire les vraies données de l'utilisateur.
- Supprime lib/data/seed.ts à la fin (garde un script de seed SQL). Aucune donnée fictive ne doit rester dans le code.
- Mets à jour sitemap.ts pour qu'il liste les services publiés depuis la base (revalidation quotidienne) et uniquement les pages `published`.

Critères de fin : build OK, plus aucun import de seed.ts, pages fonctionnelles avec la base seedée.
```

## Prompt 4 — Back-office prestataire (création de fiche)

```
Lis CLAUDE.md et AGENTS.md. Prérequis : prompts 1 à 3.

Construis l'espace (provider) complet, mobile-first, trilingue (FR obligatoire, EN/ES optionnels avec traduction auto proposée via translate.py ou l'API Claude côté serveur, jamais sans validation du prestataire).

1. Onboarding (provider/onboarding) en étapes sauvegardées automatiquement (brouillon) : identité & activité (nom, bio, langues, certifications, îles/zones desservies, téléphone/WhatsApp), pièces justificatives (upload privé : SIRET/ pièce d'identité / assurance RC pro), connexion Stripe Connect Express (lien d'onboarding, retour, statut account.updated), CGU prestataire à accepter. Soumission → statut `pending_review`. Écran d'attente avec message clair.
2. provider/services : liste réelle, création/édition via un formulaire Zod + server actions : titre/description FR(+EN/ES), catégorie, île/zone, prix (centimes), durée, capacité min/max, ce qui est inclus / à prévoir, politique d'annulation, tags, adresse ou zone de déplacement, 3 à 10 photos (upload Supabase Storage dans service-images/{provider_id}/, compression côté client, réordonnancement drag & drop, alt text obligatoire, photo de couverture), statut brouillon → soumis → publié. Aperçu "tel que le voit le touriste".
3. Disponibilités : calendrier récurrent (jours/horaires types) + exceptions (jours bloqués) générant availability_slots ; gestion de la durée de service + temps de battement.
4. provider/reservations : liste filtrable ; accepter / refuser (avec motif) / marquer comme terminé ; notifications.
5. provider/paiements : solde, virements Stripe, historique réel (table payments), lien vers le dashboard Express Stripe.
6. provider/dashboard : KPIs réels (réservations, revenu net après commission, taux d'acceptation, note moyenne).
7. Toutes les mutations passent par des server actions qui revalident l'identité et le rôle, et invalident le tag de cache `services`.

Un prestataire non approuvé ne peut pas publier. Critères de fin : un prestataire fraîchement inscrit peut créer, soumettre et (après approbation admin) publier une fiche visible sur le site, avec test Playwright.
```

## Prompt 5 — Back-office admin (dont création de fiche pour un prestataire)

```
Lis CLAUDE.md et AGENTS.md. Prérequis : prompts 1 à 4.

Construis l'espace (admin) réel, protégé par requireRole(['admin']), avec journalisation dans admin_logs pour toute action sensible.
1. Prestataires : file d'attente des candidatures (pending_review), fiche détail avec pièces justificatives, actions approuver / refuser (motif envoyé par email) / suspendre. Vue des prestataires par île et catégorie.
2. **Création et édition de fiches par l'admin** : l'admin peut (a) créer un prestataire "géré" sans compte (profil + services + photos + dispos) puis envoyer une invitation pour qu'il en prenne possession, (b) éditer n'importe quelle fiche. Utilise provider_profiles.created_by_admin_id et un flag `claimed`. Réutilise les formulaires du prompt 4 (composants partagés), pas de duplication.
3. Modération des services : relecture avant publication (statuts pending_review → published/rejected avec commentaire), mise en avant (is_featured), ordre sur la home.
4. Réservations & transactions : liste globale, filtres, détail avec timeline (booking + payment + remboursements), remboursement manuel via Stripe, résolution de litiges (statut disputed).
5. Utilisateurs : recherche, désactivation, changement de rôle (admin uniquement, journalisé).
6. Catégories & îles : CRUD des catégories (nom FR/EN/ES, icône, ordre).
7. Analytics : KPIs réels (GMV, take rate, réservations, conversion visite→réservation, prestataires actifs, répartition par île/catégorie) via vues SQL ou RPC ; export CSV.
8. Leads : liste des leads captés (table leads), statut (nouveau/contacté/converti), export.
9. Paramètres : taux de commission par défaut et par prestataire/catégorie (jamais codé en dur), politiques d'annulation par défaut.

Critères de fin : un admin peut créer entièrement une fiche pour un prestataire sans compte, la publier, puis l'inviter à la revendiquer. Tests Playwright des parcours principaux.
```

## Prompt 6 — Réservation + paiement Stripe Connect

```
Lis CLAUDE.md et AGENTS.md. Prérequis : prompts 1 à 5. Consulte la doc Stripe à jour (Connect destination charges / separate charges and transfers, PaymentElement) avant de coder.

0. Décision de modèle à implémenter (propose-la-moi d'abord en 10 lignes, attends mon feu vert) : qui paie la commission ? Recommandation : le touriste paie le prix affiché (commission incluse, pas de frais cachés au paiement), la plateforme garde X % (paramétrable, défaut 20 %, voir settings admin), le prestataire reçoit (prix − X %). La commission concierge/partenaire est prélevée sur la part plateforme. Traite aussi : devise EUR, TVA applicable, capture différée (autorisation à la réservation puis capture à l'acceptation du prestataire, ou paiement immédiat + remboursement en cas de refus), délai de virement au prestataire après prestation.
1. Tunnel /reserver/[serviceId] : étapes date → créneau réel (availability_slots) → participants → coordonnées/adresse du lieu → récapitulatif → paiement. Nécessite d'être connecté (sinon inscription express qui revient au tunnel). Prix toujours recalculé côté serveur.
2. Server action/route `createCheckout` : appelle la RPC create_booking, crée un PaymentIntent (avec transfer_data/application_fee_amount selon le modèle validé, metadata booking_id, idempotency key), insère la ligne payments, renvoie le client_secret. Utilise Stripe PaymentElement (@stripe/react-stripe-js déjà installé) : plus aucun champ carte maison. Gère 3DS, erreurs, retry, expiration du créneau (réservation `pending` libérée après 15 min via pg_cron ou job).
3. Webhook /api/webhooks/stripe : utilise un client supabase-js service-role SANS cookies (corrige createAdminClient), idempotence via la table webhook_events, journalisation, réponse 200 rapide. Gère payment_intent.succeeded / payment_failed / canceled, charge.refunded, charge.dispute.created, account.updated (stripe_onboarded), transfer.*. Les montants proviennent de la base, pas recalculés depuis intent.amount.
4. Annulation & remboursement : règles de la politique d'annulation, remboursement total/partiel automatique, statut booking cohérent, notifications aux deux parties.
5. Page /paiement : remplace la maquette par les vrais moyens de paiement (SetupIntent) et les vraies factures (payments + reçu Stripe), ou supprime la page si non nécessaire au MVP.
6. Confirmation : écran réel + email de confirmation + fichier .ics.
7. Tests : cartes de test Stripe (succès, 3DS, refus), simulation de webhooks avec `stripe trigger`, test de double livraison du même événement (idempotence).

Critères de fin : une réservation de bout en bout en mode test Stripe, un remboursement, un échec de paiement ; aucune donnée de carte ne transite par nos champs.
```

## Prompt 7 — Notifications, emails, leads, WhatsApp

```
Lis CLAUDE.md et AGENTS.md.
- Intègre Resend (ou équivalent) avec templates React Email trilingues : confirmation de réservation touriste, nouvelle demande prestataire, acceptation/refus, rappel J-1, demande d'avis J+1, approbation/refus de candidature prestataire, invitation à revendiquer une fiche (admin).
- Notifications in-app : alimente la table notifications à chaque évènement et branche la page /notifications (temps réel via Supabase Realtime).
- Formulaire de leads de la home : server action Zod avec honeypot + rate limit par IP, insertion dans `leads`, email de confirmation, double opt-in, consentement RGPD explicite.
- WhatsApp : lien wa.me généré depuis NEXT_PUBLIC_WHATSAPP_NUMBER avec message pré-rempli localisé ; ne pas afficher le numéro des prestataires avant réservation confirmée (anti-contournement de la marketplace).
- Tâches planifiées (Supabase cron ou Vercel Cron) : rappels, expiration des réservations pending, demandes d'avis.
Critères de fin : chaque évènement ci-dessus déclenche email + notification, testé avec la boîte de réception de test Resend.
```

## Prompt 8 — SEO technique & pages programmatiques

```
Lis CLAUDE.md et AGENTS.md. Utilise SITE_URL partout.
1. Metadata : crée un helper lib/seo.ts (buildMetadata({title, description, path, locale, image})) qui produit title, description, canonical auto-référent, hreflang complet fr/en/es + x-default, openGraph, twitter. Applique-le à TOUTES les pages publiques (home, search, about, concierge, privacy, terms, fiches) ; pages privées (profile, voyages, paiement, admin, provider, partner, reserver, onboarding, login/register) en noindex,nofollow.
2. Pages programmatiques indexables (le levier n°1) : /{ile}/{categorie} (ex. /guadeloupe/chef-prive, /martinique/massage-a-domicile, /saint-martin/dj) et /{ile} : H1 unique, 150-300 mots de contenu éditorial unique par combinaison (gabarit + variables + bloc rédigé par moi), liste des services, FAQ avec JSON-LD FAQPage, maillage interne vers fiches et combinaisons voisines, fil d'Ariane. Génère-les seulement si ≥ 3 services publiés (sinon noindex) pour éviter le contenu mince.
3. JSON-LD : Organization avec sameAs réels, WebSite SearchAction pointant vers une vraie route /search?q=, Service/Product + AggregateRating + Review uniquement avec de vrais avis, BreadcrumbList localisé, FAQPage, LocalBusiness par prestataire. Valider avec le test des résultats enrichis.
4. sitemap.ts dynamique depuis la base (avec alternates hreflang et lastModified réel = updated_at), robots.ts : désallouer privé, autoriser le reste, bloquer les paramètres de tri/filtre inutiles.
5. Images : tout via next/image avec sizes corrects, alt descriptifs localisés (alt_fr/en), priority uniquement sur le LCP. Remplace progressivement les images Unsplash par des photos hébergées dans Storage/public.
6. Performance : cible Lighthouse mobile ≥ 90 (LCP < 2,5 s). Mesure avant/après, polices via next/font (supprime les <link> Google Fonts manuels), réduction du JS client sur la home (Server Components), pas de contenu masqué au premier rendu.
7. Contenu : page /blog ou /guides (MDX) avec 5 guides (ex. "Chef privé en Guadeloupe : tarifs 2027", "Que faire dans sa villa à Saint-François") pour capter la longue traîne.
Livre un rapport avant/après (audit.py + Lighthouse).
```

## Prompt 9 — i18n complète FR/EN/ES

```
Lis CLAUDE.md (section traduction) et AGENTS.md.
- Inventorie tout texte en dur (pages, composants, messages d'erreur, emails, métadonnées) et les ternaires L(fr,en,es). Déplace tout dans messages/{fr,en,es}.json structuré par page/composant (namespaces), avec useTranslations côté client et getTranslations côté serveur.
- Dates, nombres et devises via Intl avec la locale courante (supprime MONTHS_FR, DAYS_FR, 'fr-FR' en dur). Pluriels via ICU.
- Contenu base de données : colonnes/tables de traduction (title_fr/en/es, description_fr/en/es), repli sur FR si manquant.
- Lance translate.py --merge pour EN/ES, puis relis les clés sensibles (promesse de valeur, CTA, légal). Ne modifie jamais fr.json sans me le dire.
- Ajoute un test qui échoue si une clé existe dans fr.json et pas dans en/es (et inversement), et si des variables {name} diffèrent.
Critères de fin : parcours complet réservation en EN et ES sans aucun texte français résiduel.
```

## Prompt 10 — Design, UX, accessibilité

```
Lis CLAUDE.md et AGENTS.md. Ne change pas l'identité (vert profond, coconut, turquoise, typographie).
1. Hero : ajoute un dégradé/scrim garantissant un contraste ≥ 4,5:1 pour le titre et le sous-titre, vérifié sur desktop et mobile ; formulaire de recherche lisible.
2. Animations : aucun contenu invisible au premier rendu ; respecte prefers-reduced-motion ; pas de layout shift (CLS < 0,1).
3. Preuve & réassurance sur cartes, fiche et tunnel : prestataire vérifié, annulation gratuite jusqu'à X h, paiement sécurisé, note + nombre d'avis réels (n'affiche pas de note s'il n'y a pas d'avis). Retire les témoignages/chiffres fictifs tant qu'ils ne sont pas réels, ou marque-les clairement comme exemples en démo.
4. Tunnel de réservation : barre de progression, résumé sticky mobile, tous les états (chargement, erreur de paiement, créneau devenu indisponible, session expirée), focus management et messages d'erreur ARIA.
5. Accessibilité WCAG 2.2 AA : navigation clavier complète (calendrier, sélecteurs, menus), focus visibles, labels, contrastes, tailles tactiles ≥ 44 px, rôles ARIA des composants Radix, tests axe sur les 8 pages clés.
6. Mobile : audit à 360/390/430 px de toutes les pages, BottomNav cohérente, pas de scroll horizontal.
7. États vides et pages d'erreur (404 localisée déjà présente, 500, hors-ligne), skeletons cohérents.
8. Bandeau cookies conforme (refus aussi simple que l'acceptation), aucun tracker avant consentement.
Livre captures avant/après des écrans modifiés et la liste des problèmes axe restants.
```

## Prompt 11 — Légal & conformité (à valider avec un juriste)

```
Lis CLAUDE.md. Tu n'es pas juriste : produis des BROUILLONS à faire valider par un avocat/expert-comptable, en listant clairement les points à confirmer.
- CGU / CGV marketplace (rôle d'intermédiaire, responsabilité, annulation, litiges, commission, paiement via Stripe, loi applicable), CGU prestataire, politique de confidentialité RGPD (finalités, durées, sous-traitants Supabase/Stripe/Resend/Vercel, droits), mentions légales, politique cookies. Remplace les pages terms/privacy actuelles.
- Obligations d'une plateforme (information loyale sur le classement, avis vérifiés, statut professionnel/particulier des prestataires), TVA applicable en Guadeloupe/Martinique/Saint-Martin/Saint-Barthélemy (régimes différents), facturation (qui facture quoi), assurances (RC pro prestataires), règles sur le travail dissimulé : checklist de vérification à l'onboarding prestataire.
- Implémente côté produit : acceptation versionnée des CGU (table consents), export et suppression de compte (RGPD), vérification du statut du prestataire avant publication.
Livre aussi la liste des questions à poser à un juriste/comptable.
```

## Prompt 12 — Tests, CI, observabilité

```
Lis CLAUDE.md et AGENTS.md.
- Playwright : parcours critiques (inscription touriste, recherche, réservation test Stripe, annulation, onboarding prestataire, publication d'une fiche, approbation admin) sur 3 locales, plus tests de sécurité (un touriste ne peut pas ouvrir /admin, pas de lecture des réservations d'autrui).
- Vitest : utils (computeFees, formatPrice), schémas Zod, helper SEO, garde-fous i18n.
- GitHub Actions : install, tsc, eslint, vitest, build, playwright sur preview, supabase db lint/migrations check.
- Sentry (client + serveur + webhooks), logs structurés, alertes sur échecs de webhook Stripe et d'envoi d'email.
- Analytics respectueux de la vie privée (Plausible/PostHog) avec entonnoir : visite → fiche → début réservation → paiement → réservation ; événements nommés et documentés.
- En-têtes de sécurité dans next.config.ts (CSP compatible Stripe/Supabase/Unsplash, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy).
- Environnements : preview (Supabase branch + Stripe test), prod. Variables validées au démarrage avec Zod (lib/env.ts) qui fait échouer le build si manquantes.
Critères de fin : CI verte sur main, protection de branche activée.
```
