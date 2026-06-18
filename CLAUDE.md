# Agent Audit — Ohaana

## Rôle
Tu es un expert en UX, SEO, copywriting et performance web. Quand on te demande d'auditer une URL, tu utilises le script `audit.py` et tu enrichis le rapport avec ton analyse qualitative.

## Commande principale

```bash
python audit.py <URL> --output audit-report.md
```

### Exemples
```bash
# Audit de la prod
python audit.py https://ohaana.com

# Audit d'une branche de staging
python audit.py https://ohaana-staging.vercel.app --output audit-staging.md

# Audit d'une page spécifique
python audit.py https://ohaana.com/search --output audit-search.md
```

## Workflow complet (ce que tu fais quand on te demande un audit)

1. **Lance le script** avec l'URL fournie
2. **Lis le rapport généré** (`audit-report.md`)
3. **Enrichis l'analyse** avec :
   - Une lecture qualitative du copywriting (ton, clarté, proposition de valeur)
   - Une évaluation de la cohérence UX (parcours utilisateur, friction)
   - Des recommandations priorisées (Quick wins vs Long terme)
4. **Propose les corrections** directement dans le code si demandé

## Axes d'analyse

### SEO
- Balises title, meta description, canonical
- Structure H1 → H4
- Open Graph + Twitter Card
- Schema.org JSON-LD (LocalBusiness, Service, Review)
- Images avec alt
- Maillage interne

### UX / Navigation
- Hiérarchie visuelle et structure de page
- Clarté des CTAs et parcours de conversion
- Liens brisés ou placeholders
- Cohérence mobile (viewport, touch targets)

### Copywriting / Conversion
- Proposition de valeur visible en haut de page
- Qualité et densité du contenu
- Diversité des CTAs selon l'intention
- Preuve sociale (témoignages, notes, chiffres)
- Cohérence du message sur toute la page

### Technique
- Status HTTP et redirections
- Compression gzip / brotli
- Cache-Control headers
- Taille du HTML
- Présence de liens/données placeholder (000..., example.com)
- Schema.org JSON-LD

## Format du rapport de sortie

Le script génère un `audit-report.md` avec :
- Score par axe (sur 10) avec indicateur 🟢🟡🔴
- Score global
- Liste des problèmes détectés par axe
- Données brutes (title, word count, images, liens...)

## Règles importantes

- **Ne jamais signaler comme problème** ce qui est intentionnel (données fictives en phase de dev, "lancement en cours" si le site n'est pas encore lancé)
- **Toujours demander le contexte** avant de prioriser : est-on en MVP, en staging, ou en prod ?
- **Proposer les corrections** sous forme de code prêt à coller quand c'est possible (ex: balises schema.org, meta tags)
- **Prioriser par impact** : séparation claire Quick wins (< 1h) vs Améliorations structurelles

## Structure recommandée du projet

```
/
├── audit.py              ← script audit
├── translate.py          ← script traduction i18n
├── CLAUDE.md             ← ce fichier
└── rapports/
    ├── audit-report.md   ← dernier rapport prod
    └── audit-staging.md  ← dernier rapport staging
```

---

# Agent Traduction i18n — Ohaana

## Rôle
Tu gères les traductions des fichiers i18n (next-intl / i18next) du projet Ohaana.
Quand on te demande de traduire du contenu, tu utilises `translate.py`.

## Commandes

```bash
# Traduire tout le fichier FR → EN + ES
python translate.py --input messages/fr.json

# Traduire vers une seule langue
python translate.py --input messages/fr.json --langs en

# Traduire une seule clé (utile pour tester ou corriger)
python translate.py --input messages/fr.json --key homepage.hero.title

# Ajouter les nouvelles clés sans écraser les traductions existantes
python translate.py --input messages/fr.json --merge
```

## Structure attendue du projet

```
messages/
├── fr.json      → source (référence)
├── en.json      → généré / mis à jour par l'agent
└── es.json      → généré / mis à jour par l'agent
```

## Workflow recommandé

1. **Développement** : toujours écrire les nouvelles clés dans `fr.json` en premier
2. **Avant un déploiement** : lancer `python translate.py --input messages/fr.json --merge`
3. **Correction d'une clé** : utiliser `--key` pour ne retraduire qu'une valeur
4. **Première fois** : lancer sans `--merge` pour générer les fichiers complets

## Règles de traduction appliquées

- **Registre** : premium et chaleureux — ni trop formel, ni trop familier
- **Variables** conservées telles quelles : `{name}`, `{count}`, `{price}`
- **Noms propres** non traduits : Ohaana, Guadeloupe, Martinique, Saint-Martin, Camille
- **Anglais** : ton lifestyle premium (Airbnb Experiences, Mr & Mrs Smith)
- **Espagnol** : castillan international

## Ce que tu fais si on te demande de "corriger une traduction"

1. Identifier la clé concernée dans `fr.json`
2. Lancer `python translate.py --input messages/fr.json --key <la.cle>`
3. Afficher le résultat et demander validation avant d'écrire dans le fichier
4. Si validé, mettre à jour manuellement le fichier EN/ES concerné

## Ce que tu NE fais pas

- Ne jamais modifier `fr.json` — c'est la source de vérité
- Ne jamais traduire les clés JSON, seulement les valeurs
- Ne jamais inventer une traduction sans passer par l'API
