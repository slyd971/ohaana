# Audit Design — Ohaana (revue du code, branche `feat/seo-quickwins`)

> Contexte supposé : MVP en phase de dev (données démo = intentionnelles, non signalées). Audit basé sur le code (`globals.css`, `components/ui`, Hero, ServiceCard, shells) — pas sur un rendu visuel. À confirmer : prod / staging ?

## Score

| Axe | Score |
|---|---|
| Identité & cohérence (tokens, typo, palette) | 8/10 🟢 |
| Accessibilité (contraste, tailles, focus) | 5/10 🟡 |
| Cohérence des composants | 6/10 🟡 |
| Mobile / touch | 7/10 🟢 |
| Performance perçue (fonts, images) | 6/10 🟡 |
| **Global** | **6.4/10** 🟡 |

## Forces
- Système de tokens propre (Tailwind v4 `@theme`) : palette sable/vert profond/corail/turquoise, Fraunces (titres) + Inter (corps) — identité « lifestyle premium » cohérente.
- Hero lisible : un H1, une barre de recherche Où/Quand/Quoi, vert profond (11.5:1) sur coconut.
- Focus visible global, `aria-label` sur les boutons icône (favoris), `viewportFit: cover`, `themeColor`, `next/image` pour les cartes.

## 🔴 Problèmes prioritaires

### 1. Contrastes insuffisants (WCAG AA = 4.5:1 texte, 3:1 grands éléments)
| Combinaison | Ratio | Usage |
|---|---|---|
| `turquoise` sur coconut | **2.18** | eyebrow du Hero, 74 occurrences de `text-turquoise` |
| Badge turquoise (`turquoise/10`) | **2.07** | `Badge` variante turquoise |
| `stone` sur coconut / sand / mist | 3.13 / 2.79 / 2.53 | **311** occurrences de `text-stone` (placeholders, métadonnées) |
| `coral` texte sur coconut | 3.25 | liens/erreurs, Badge coral (2.97) |
| `coconut` sur bouton `coral` | 3.25 | variante `coral` du Button |

**Fix (quick win, tokens)** — assombrir les variantes *texte* sans toucher aux fonds :
```css
:root {
  --stone: #6B6B70;          /* 5.2:1 sur coconut */
  --turquoise-text: #0E7C77; /* 4.9:1 — pour texte/eyebrow */
  --coral-text: #C8422D;     /* 4.6:1 — pour texte/liens */
}
@theme inline {
  --color-turquoise-text: var(--turquoise-text);
  --color-coral-text: var(--coral-text);
}
```
Puis `text-turquoise` → `text-turquoise-text` (eyebrow, Badge) ; bouton `coral` : fond `#C8422D` ou texte charcoal.

### 2. Micro-typo illisible : 84 usages de `text-[9–11px]`
52× `text-[11px]`, 30× `text-[10px]`, 1× `text-[9px]`. Sous 12px, surtout en `stone` (cf. 1) → illisible en plein soleil sur mobile (usage touristique en extérieur). Fixer un plancher `text-xs` (12px) et ajouter une échelle (`--text-caption`) dans le thème.

### 3. Boutons non standardisés
**146** `<button` bruts contre **12** fichiers utilisant `ui/Button`. Conséquence : hauteurs, rayons (`rounded-full/xl/2xl`), états hover/disabled/focus divergents. Exemple : le CTA principal du Hero est un bouton ad hoc (`hover:bg-coral`), alors que `Button` primary passe à `deep-green-light`.
→ Migrer au moins les CTA (Hero, réservation, paiement) vers `Button`, et le Hero doit utiliser `variant="primary"`.

## 🟡 Améliorations importantes

4. **Touch targets** : favori carte `h-8 w-8` (32px), boutons burger des shells `p-1.5` (~32px), `Button size="sm"` `h-9` (36px). Cible ≥ 44px : garder le visuel, agrandir la zone (`before:absolute before:-inset-2`).
5. **Rayons incohérents** : 5 échelles utilisées (`full` 147, `2xl` 138, `xl` 110, `lg` 41, `3xl` 8) pour les mêmes types de composants. Définir : carte = `2xl`, bouton/input = `xl`, pill/badge = `full`, et s'y tenir.
6. **Couleurs en dur** : `#F5A623` (37×, étoiles), `#C0392B` (15×, erreurs), `#B7791F`, `#0F1923` hors tokens → créer `--star`, `--danger`, `--warning`.
7. **Chargement des polices** : `@import url(fonts.googleapis.com…)` dans `globals.css` = requête bloquante, pas de preload, risque de FOUT/CLS. Passer à `next/font/google` (Fraunces + Inter, `display: swap`, self-hosted) — gain LCP + RGPD (pas de requête vers Google).
8. **Images** : seulement 1 `<img>` brut restant à migrer vers `next/image` ; vérifier `sizes` sur les carrousels (`ServiceRow`) pour éviter de servir du 1200px sur mobile.
9. **Pas de dark mode** (1 occurrence de `dark:`) : acceptable en MVP, mais `themeColor` fixe et fonds clairs seulement → choix à assumer explicitement.
10. **Animations** : framer-motion partout (Hero `y:24`, 0.8s) mais 1 seule prise en compte de `prefers-reduced-motion` → envelopper avec `<MotionConfig reducedMotion="user">` dans le layout (1 ligne).

## 🟢 Plan d'action

**Quick wins (< 1h)**
- [ ] Tokens `--stone`, `--turquoise-text`, `--coral-text` (bloc CSS ci-dessus) — corrige ~400 occurrences d'un coup
- [ ] `<MotionConfig reducedMotion="user">` dans `app/[locale]/layout.tsx`
- [ ] Plancher `text-xs` : remplacer `text-[10px]`/`text-[9px]` (31 occurrences)
- [ ] Tokens `--star` / `--danger`

**Structurel**
- [ ] `next/font` à la place de l'`@import` Google Fonts
- [ ] Migration des CTA vers `ui/Button`, puis des 146 boutons restants par lots (shells, admin, provider)
- [ ] Charte de rayons + touch targets 44px dans `Button`/`ServiceCard`/shells
- [ ] Décision dark mode (oui/non) et documentation du design system (une page `/design` ou Storybook léger)

## Limites de cet audit
Basé sur le code, pas sur un rendu : hiérarchie visuelle réelle, qualité des photos, espacements et responsive restent à valider visuellement. Je peux lancer l'app, faire des captures mobile/desktop de la home, search, fiche prestataire et checkout, et compléter — ou appliquer directement les quick wins.
