#!/usr/bin/env python3
"""
Traduit les titres et descriptions des services Ohaana (seed.ts) vers l'espagnol.
Injecte les champs title_es et description_es directement dans seed.ts.

Usage :
  python translate_services.py
"""

import os
import re
import json
import sys
import urllib.request

# ─── Config ────────────────────────────────────────────────────────────────────

SEED_PATH = "lib/data/seed.ts"
API_KEY   = os.environ.get("ANTHROPIC_API_KEY", "")
MODEL     = "claude-sonnet-4-6"

SYSTEM_PROMPT = """Tu es un traducteur expert pour Ohaana, marketplace premium d'expériences caribéennes.
Traduis du français vers le castillan international (es).

Règles :
- Registre premium, chaleureux, lifestyle — ton Airbnb Experiences
- Conserve les noms propres : Ohaana, Guadeloupe, Martinique, Saint-Martin, Marcus, Madeleine, Camille, Keisha, Clarisse, etc.
- Conserve les termes créoles emblématiques : accras, colombo, ti-punch, bokits, boudins créoles
- Ne traduis pas les noms de techniques : balinais, shiatsu, knotless, cornrows
- Réponds UNIQUEMENT avec du JSON valide, aucun texte autour"""

# ─── Extract services from seed.ts ────────────────────────────────────────────

def extract_services(content: str) -> list[dict]:
    """Extract id, title_fr, description_fr from seed.ts using regex."""
    # Match each service block
    pattern = re.compile(
        r"id:\s*'(s-\d+)'[^{]*?"
        r"title_fr:\s*'((?:[^'\\]|\\.)*)'\s*,\s*\n\s*"
        r"title_en:\s*'(?:[^'\\]|\\.)*'\s*,\s*\n\s*"
        r"description_fr:\s*'((?:[^'\\]|\\.)*)'",
        re.DOTALL
    )
    services = []
    seen_ids = set()
    for m in pattern.finditer(content):
        sid = m.group(1)
        if sid in seen_ids:
            continue
        seen_ids.add(sid)
        services.append({
            "id": sid,
            "title_fr": m.group(2).replace("\\'", "'"),
            "description_fr": m.group(3).replace("\\'", "'"),
        })
    return services

# ─── Claude API call ───────────────────────────────────────────────────────────

def translate_batch(services: list[dict]) -> list[dict]:
    """Translate a list of {id, title_fr, description_fr} to ES via Claude."""
    payload_input = [
        {"id": s["id"], "title_fr": s["title_fr"], "description_fr": s["description_fr"]}
        for s in services
    ]

    prompt = f"""Traduis chaque objet du tableau ci-dessous vers l'espagnol (castillan international).
Pour chaque objet, retourne : id, title_es, description_es.
Réponds UNIQUEMENT avec un tableau JSON valide.

{json.dumps(payload_input, ensure_ascii=False, indent=2)}"""

    data = json.dumps({
        "model": MODEL,
        "max_tokens": 8192,
        "system": SYSTEM_PROMPT,
        "messages": [{"role": "user", "content": prompt}]
    }).encode("utf-8")

    req = urllib.request.Request(
        "https://api.anthropic.com/v1/messages",
        data=data,
        headers={
            "Content-Type": "application/json",
            "x-api-key": API_KEY,
            "anthropic-version": "2023-06-01",
        },
        method="POST"
    )

    with urllib.request.urlopen(req, timeout=120) as resp:
        body = json.loads(resp.read().decode("utf-8"))
        raw = body["content"][0]["text"].strip()
        # Strip markdown code fences if present
        if raw.startswith("```"):
            raw = re.sub(r"^```[a-z]*\n?", "", raw)
            raw = re.sub(r"\n?```$", "", raw.strip())
        return json.loads(raw)

# ─── Patch seed.ts ─────────────────────────────────────────────────────────────

def escape_ts(s: str) -> str:
    """Escape single quotes for TypeScript string literals."""
    return s.replace("\\", "\\\\").replace("'", "\\'")

def patch_seed(content: str, translations: list[dict]) -> str:
    """Inject title_es and description_es after title_en and description_en."""
    for t in translations:
        sid = t["id"]
        title_es = escape_ts(t["title_es"])
        desc_es  = escape_ts(t["description_es"])

        # Pattern: find the block for this service id and inject ES fields
        # We look for description_en: '...' followed by a newline, and insert
        # title_es + description_es after title_en, description_en

        # Inject title_es after title_en
        title_pattern = re.compile(
            r"(id:\s*'" + re.escape(sid) + r"'.*?title_en:\s*'(?:[^'\\]|\\.)*')(,)",
            re.DOTALL
        )
        def title_replacer(m):
            if f"title_es:" in content[m.start():m.end() + 200]:
                return m.group(0)  # already patched
            return m.group(1) + m.group(2) + f"\n    title_es: '{title_es}',"
        content = title_pattern.sub(title_replacer, content, count=1)

        # Inject description_es after description_en
        desc_pattern = re.compile(
            r"(id:\s*'" + re.escape(sid) + r"'.*?description_en:\s*'(?:[^'\\]|\\.)*')(,)",
            re.DOTALL
        )
        def desc_replacer(m):
            if f"description_es:" in content[m.start():m.end() + 300]:
                return m.group(0)
            return m.group(1) + m.group(2) + f"\n    description_es: '{desc_es}',"
        content = desc_pattern.sub(desc_replacer, content, count=1)

    return content

# ─── Main ──────────────────────────────────────────────────────────────────────

def main():
    if not API_KEY:
        print("✗ ANTHROPIC_API_KEY non définie.")
        sys.exit(1)

    print(f"→ Lecture de {SEED_PATH}…")
    with open(SEED_PATH, "r", encoding="utf-8") as f:
        content = f.read()

    # Check if already patched
    if "title_es:" in content:
        already = content.count("title_es:")
        total   = content.count("title_fr:")
        if already >= total:
            print(f"✓ Déjà traduit ({already} services). Rien à faire.")
            return
        print(f"→ {already}/{total} services déjà traduits — on complète.")

    services = extract_services(content)
    # Filter out already-translated
    already_ids = set(re.findall(r"id:\s*'(s-\d+)'.*?title_es:", content, re.DOTALL))
    to_translate = [s for s in services if s["id"] not in already_ids]

    print(f"→ {len(to_translate)} services à traduire…")
    if not to_translate:
        print("✓ Tout est déjà traduit.")
        return

    # Translate in one batch (all services fit in context)
    print("→ Appel Claude API…")
    translations = translate_batch(to_translate)
    print(f"✓ {len(translations)} traductions reçues.")

    print("→ Injection dans seed.ts…")
    patched = patch_seed(content, translations)

    with open(SEED_PATH, "w", encoding="utf-8") as f:
        f.write(patched)

    print(f"✓ seed.ts mis à jour avec {len(translations)} traductions ES.")
    print("\nPense à mettre à jour ServiceCard.tsx pour utiliser title_es / description_es.")

if __name__ == "__main__":
    main()
