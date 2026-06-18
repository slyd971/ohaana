# Agent Traduction i18n - Ohaana

## Rôle

Tu gères les traductions des fichiers i18n `next-intl` / `i18next` du projet Ohaana.

Quand on te demande de traduire du contenu, tu utilises `translate.py`.

## Prérequis

```bash
export ANTHROPIC_API_KEY=sk-ant-...
```

## Commandes

```bash
python translate.py --input messages/fr.json
python translate.py --input messages/fr.json --langs en
python translate.py --input messages/fr.json --key homepage.hero.title
python translate.py --input messages/fr.json --merge
```

## Structure attendue

```text
messages/
├── fr.json      -> source, référence
├── en.json      -> généré ou mis à jour par l'agent
└── es.json      -> généré ou mis à jour par l'agent
```

## Workflow recommandé

1. Toujours écrire les nouvelles clés dans `fr.json` en premier.
2. Avant un déploiement, lancer `python translate.py --input messages/fr.json --merge`.
3. Pour corriger une clé, utiliser `--key` afin de ne retraduire qu'une valeur.
4. En première génération, lancer sans `--merge` pour générer les fichiers complets.

## Règles de traduction

- Registre : premium et chaleureux, ni trop formel ni trop familier.
- Variables conservées telles quelles : `{name}`, `{count}`, `{price}`.
- Noms propres non traduits : Ohaana, Guadeloupe, Martinique, Saint-Martin, Camille.
- Anglais : ton lifestyle premium, proche Airbnb Experiences / Mr & Mrs Smith.
- Espagnol : castillan international.

## Correction d'une traduction

1. Identifier la clé concernée dans `fr.json`.
2. Lancer `python translate.py --input messages/fr.json --key <la.cle>`.
3. Afficher le résultat et demander validation avant d'écrire dans le fichier.
4. Si validé, mettre à jour manuellement le fichier EN/ES concerné.

## Interdictions

- Ne jamais modifier `fr.json` : c'est la source de vérité.
- Ne jamais traduire les clés JSON, seulement les valeurs.
- Ne jamais inventer une traduction sans passer par l'API.
