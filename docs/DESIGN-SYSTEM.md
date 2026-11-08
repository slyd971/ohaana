# Design system Ohaana

Guide vivant : `/fr/design` (dev uniquement, 404 en prod). Tokens : `app/globals.css`. Composants : `components/ui` (import via `@/components/ui`).

## Principes
Premium et chaleureux, lisible en plein soleil sur mobile, accessible (WCAG AA), cohérent entre espaces (voyageur, prestataire, partenaire, admin).

## Tokens
| Rôle | Token / classe | Note |
|---|---|---|
| Primaire | `deep-green` | titres, CTA principal (11.5:1) |
| CTA secondaire | `coral-text` (fond) | `coral` seul = décoratif, 3.25:1 |
| Texte turquoise | `turquoise-text` | `turquoise` = fonds/pastilles uniquement |
| Texte corail | `coral-text` | |
| Texte secondaire | `stone` (#6B6B70) | 5.2:1 sur coconut |
| Notes/avertissement | `star` | |
| Erreur/destructif | `danger` | |
| Rayons | `rounded-card` 16px · `rounded-control` 12px · `rounded-full` | plus de `2xl/xl/lg` en dur sur les nouveaux composants |

**Sur fonds sombres** (admin, bandeaux deep-green) : garder `turquoise`/`coral` (pas les variantes `-text`).

## Typographie
Fraunces (`font-display`) pour h1–h3, Inter pour le reste via `next/font`. Plancher : `text-xs` (12px). Pas de `text-[9–11px]`.

## Composants
`Button` (primary, coral, secondary, outline, ghost, danger ; sm=44px) · `IconButton` (label obligatoire, 44px) · `Input` / `Textarea` · `Badge` · `Alert` · `Card` · `Skeleton` · `ConfirmButton`.

## Règles
- Pas de `<button>` brut pour un CTA : utiliser `Button` (override par `className` si besoin).
- Cibles tactiles ≥ 44px.
- Pas de couleur hexadécimale en dur : ajouter un token.
- Animations framer-motion : le `MotionProvider` gère `prefers-reduced-motion`.

## Boutons : quand utiliser quoi
`Button` variantes `primary`, `coral`, `secondary`, `outline`, `ghost`, `danger`, `link` (action textuelle), `soft` (action tintée turquoise, admin). `size="bare"` = sans hauteur/padding imposés (tableaux, liens-boutons) : fournir le padding via `className`.

## Hors design system (volontaire)
Les `<button>` qui sont en réalité des **cartes cliquables, cellules de calendrier, chips/toggles de filtre et onglets** (≈120, souvent avec classes calculées) ne sont pas des CTA : ils restent bruts. Pour un nouveau toggle, suivre le patron `aria-pressed` + `focus-visible`. Un composant `Chip` pourra être extrait si le motif se répète.
