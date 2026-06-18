#!/usr/bin/env python3
"""
Ohaana — Agent Traduction i18n
Traduit les fichiers JSON (next-intl / i18next) du français vers l'anglais et l'espagnol.

Usage :
  python translate.py --input messages/fr.json
  python translate.py --input messages/fr.json --langs en es
  python translate.py --input messages/fr.json --key homepage.hero.title
"""

import json
import sys
import time
import argparse
from pathlib import Path


# ─── Appel Claude API ────────────────────────────────────────────────────────

def call_claude(prompt: str, system: str) -> str:
    try:
        import os
        import urllib.request
        import json as _json

        api_key = os.environ.get("ANTHROPIC_API_KEY", "")
        if not api_key:
            print("✗ ANTHROPIC_API_KEY non définie. Exportez-la avant de lancer le script.")
            sys.exit(1)

        payload = _json.dumps({
            "model": "claude-sonnet-4-6",
            "max_tokens": 4096,
            "system": system,
            "messages": [{"role": "user", "content": prompt}]
        }).encode("utf-8")

        req = urllib.request.Request(
            "https://api.anthropic.com/v1/messages",
            data=payload,
            headers={
                "Content-Type": "application/json",
                "x-api-key": api_key,
                "anthropic-version": "2023-06-01",
            },
            method="POST"
        )

        with urllib.request.urlopen(req, timeout=60) as resp:
            data = _json.loads(resp.read().decode("utf-8"))
            return data["content"][0]["text"]

    except Exception as e:
        print(f"✗ Erreur API Claude : {e}")
        sys.exit(1)


# ─── Système prompt traduction ───────────────────────────────────────────────

SYSTEM_PROMPT = """Tu es un expert en traduction pour une plateforme de lifestyle premium dans les Caraïbes françaises (Guadeloupe, Martinique, Saint-Martin).

La plateforme s'appelle Ohaana. Elle met en relation des touristes avec des prestataires locaux (chefs à domicile, masseurs, DJs, décorateurs, concierges...).

Règles strictes :
- Traduis avec le registre premium et chaleureux de la marque — jamais trop formel, jamais trop familier
- Conserve les noms propres : Ohaana, Guadeloupe, Martinique, Saint-Martin, Camille
- Conserve les variables i18n telles quelles : {name}, {count}, {price}, {{variable}}
- Conserve les clés JSON exactement (ne traduis que les valeurs)
- Pour l'anglais : ton lifestyle premium (inspiration : Airbnb Experiences, Mr & Mrs Smith)
- Pour l'espagnol : castillan international, pas d'argot régional
- Réponds UNIQUEMENT avec le JSON valide, sans markdown, sans commentaire, sans explication"""


# ─── Helpers JSON ────────────────────────────────────────────────────────────

def flatten(obj: dict, prefix: str = "") -> dict:
    """Aplatit un JSON imbriqué en clés pointées."""
    items = {}
    for k, v in obj.items():
        key = f"{prefix}.{k}" if prefix else k
        if isinstance(v, dict):
            items.update(flatten(v, key))
        else:
            items[key] = v
    return items


def unflatten(flat: dict) -> dict:
    """Reconstruit un JSON imbriqué depuis des clés pointées."""
    result = {}
    for key, value in flat.items():
        parts = key.split(".")
        d = result
        for part in parts[:-1]:
            d = d.setdefault(part, {})
        d[parts[-1]] = value
    return result


def get_nested(obj: dict, key_path: str):
    """Récupère une valeur par chemin pointé."""
    parts = key_path.split(".")
    d = obj
    for part in parts:
        if isinstance(d, dict) and part in d:
            d = d[part]
        else:
            return None
    return d


# ─── Traduction par batch ────────────────────────────────────────────────────

BATCH_SIZE = 40  # clés par appel API


def translate_batch(batch: dict, lang: str, lang_name: str) -> dict:
    prompt = f"""Traduis ce JSON du français vers l'{lang_name}.
Réponds UNIQUEMENT avec le JSON traduit (même structure, mêmes clés).

{json.dumps(batch, ensure_ascii=False, indent=2)}"""

    response = call_claude(prompt, SYSTEM_PROMPT)

    # Nettoyage au cas où Claude ajoute des backticks
    response = response.strip()
    if response.startswith("```"):
        response = response.split("\n", 1)[1]
        response = response.rsplit("```", 1)[0]

    try:
        return json.loads(response)
    except json.JSONDecodeError as e:
        print(f"⚠️  Erreur parsing JSON batch ({lang}) : {e}")
        print(f"Réponse brute : {response[:200]}")
        return {}


def translate_file(source: dict, lang: str, lang_name: str) -> dict:
    flat = flatten(source)
    keys = list(flat.keys())
    total = len(keys)
    translated_flat = {}

    print(f"  → {total} clés à traduire en {lang_name}...")

    for i in range(0, total, BATCH_SIZE):
        batch_keys = keys[i:i + BATCH_SIZE]
        batch = {k: flat[k] for k in batch_keys}

        print(f"     Batch {i // BATCH_SIZE + 1}/{(total + BATCH_SIZE - 1) // BATCH_SIZE}...", end=" ")
        result_flat = translate_batch(batch, lang, lang_name)

        result_flat_merged = flatten(result_flat) if any(isinstance(v, dict) for v in result_flat.values()) else result_flat
        translated_flat.update(result_flat_merged)
        print("✓")

        if i + BATCH_SIZE < total:
            time.sleep(0.5)

    return unflatten(translated_flat)


# ─── Traduction d'une clé unique ─────────────────────────────────────────────

def translate_key(source: dict, key_path: str, lang: str, lang_name: str) -> str:
    value = get_nested(source, key_path)
    if value is None:
        print(f"✗ Clé '{key_path}' introuvable dans le fichier source")
        sys.exit(1)

    prompt = f"""Traduis cette valeur du français vers l'{lang_name}.
Clé : {key_path}
Valeur : {value}

Réponds UNIQUEMENT avec la traduction, sans guillemets ni explication."""

    return call_claude(prompt, SYSTEM_PROMPT).strip()


# ─── Merge avec fichier existant ─────────────────────────────────────────────

def merge_translations(existing: dict, new: dict) -> dict:
    """Fusionne en gardant les traductions existantes, ajoutant les nouvelles."""
    merged = existing.copy()
    flat_existing = flatten(existing)
    flat_new = flatten(new)

    added = 0
    for k, v in flat_new.items():
        if k not in flat_existing:
            parts = k.split(".")
            d = merged
            for part in parts[:-1]:
                d = d.setdefault(part, {})
            d[parts[-1]] = v
            added += 1

    print(f"  → {added} nouvelle(s) clé(s) ajoutée(s), {len(flat_existing)} existante(s) conservées")
    return merged


# ─── Main ────────────────────────────────────────────────────────────────────

LANG_NAMES = {
    "en": "anglais",
    "es": "espagnol",
    "pt": "portugais brésilien",
}


def main():
    parser = argparse.ArgumentParser(description="Agent traduction i18n Ohaana")
    parser.add_argument("--input", required=True, help="Fichier source FR (ex: messages/fr.json)")
    parser.add_argument("--langs", nargs="+", default=["en", "es"], help="Langues cibles (défaut: en es)")
    parser.add_argument("--key", help="Traduire une seule clé (ex: homepage.hero.title)")
    parser.add_argument("--merge", action="store_true", help="Fusionner avec les fichiers existants (garde les traductions déjà faites)")
    args = parser.parse_args()

    source_path = Path(args.input)
    if not source_path.exists():
        print(f"✗ Fichier introuvable : {source_path}")
        sys.exit(1)

    with open(source_path, "r", encoding="utf-8") as f:
        source = json.load(f)

    output_dir = source_path.parent
    print(f"\n🌐 Agent Traduction Ohaana")
    print(f"📄 Source : {source_path} ({len(flatten(source))} clés)\n")

    if args.key:
        print(f"🔑 Traduction de la clé : {args.key}\n")
        for lang in args.langs:
            lang_name = LANG_NAMES.get(lang, lang)
            result = translate_key(source, args.key, lang, lang_name)
            print(f"  [{lang}] {result}")
        return

    for lang in args.langs:
        lang_name = LANG_NAMES.get(lang, lang)
        output_path = output_dir / f"{lang}.json"

        print(f"🤖 Traduction → {lang_name.upper()} ({lang})")

        translated = translate_file(source, lang, lang_name)

        if args.merge and output_path.exists():
            print(f"  🔀 Fusion avec {output_path}...")
            with open(output_path, "r", encoding="utf-8") as f:
                existing = json.load(f)
            translated = merge_translations(existing, translated)

        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(translated, f, ensure_ascii=False, indent=2)

        print(f"  ✓ Fichier généré : {output_path}\n")

    print("🎉 Traduction terminée !")


if __name__ == "__main__":
    main()
