#!/usr/bin/env python3
"""
Ohaana — Agent d'audit complet
Usage : python audit.py <URL> [--output rapport.md]
"""

import sys
import json
import argparse
import urllib.request
import urllib.error
from datetime import datetime
from html.parser import HTMLParser
import re


# ─── Parser HTML minimaliste ────────────────────────────────────────────────

class SiteParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.title = ""
        self.meta = {}
        self.headings = []          # (level, text)
        self.links = []             # href
        self.images = []            # (src, alt)
        self.text_blocks = []       # texte visible
        self.ctas = []              # boutons / liens CTA
        self._in_title = False
        self._current_tag = ""
        self._current_heading = None
        self._skip_tags = {"script", "style", "noscript"}
        self._in_skip = False

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        self._current_tag = tag

        if tag in self._skip_tags:
            self._in_skip = True

        if tag == "title":
            self._in_title = True

        if tag == "meta":
            name = attrs.get("name") or attrs.get("property") or attrs.get("http-equiv", "")
            content = attrs.get("content", "")
            if name:
                self.meta[name.lower()] = content

        if tag in ("h1", "h2", "h3", "h4"):
            self._current_heading = tag

        if tag == "a":
            href = attrs.get("href", "")
            text = attrs.get("aria-label", "")
            if href:
                self.links.append(href)

        if tag == "img":
            self.images.append({
                "src": attrs.get("src", ""),
                "alt": attrs.get("alt", ""),
            })

        if tag == "button" or (tag == "a" and attrs.get("class", "")):
            label = attrs.get("aria-label", "")
            if label:
                self.ctas.append(label)

    def handle_endtag(self, tag):
        if tag in self._skip_tags:
            self._in_skip = False
        if tag == "title":
            self._in_title = False
        if tag in ("h1", "h2", "h3", "h4"):
            self._current_heading = None

    def handle_data(self, data):
        data = data.strip()
        if not data or self._in_skip:
            return
        if self._in_title:
            self.title += data
        if self._current_heading:
            self.headings.append((self._current_heading, data))
        if len(data) > 20:
            self.text_blocks.append(data)


# ─── Fetch ───────────────────────────────────────────────────────────────────

def fetch(url: str) -> tuple[str, int, dict]:
    req = urllib.request.Request(url, headers={"User-Agent": "OhaanaAuditBot/1.0"})
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            return resp.read().decode("utf-8", errors="replace"), resp.status, dict(resp.headers)
    except urllib.error.HTTPError as e:
        return "", e.code, {}
    except Exception as e:
        return "", 0, {}


# ─── Analyses ────────────────────────────────────────────────────────────────

def audit_seo(parser: SiteParser, url: str) -> dict:
    issues = []
    score = 10

    # Title
    title = parser.title.strip()
    if not title:
        issues.append("❌ Balise <title> absente")
        score -= 2
    elif len(title) > 60:
        issues.append(f"⚠️  Title trop long ({len(title)} car.) — idéal < 60")
        score -= 1
    elif len(title) < 30:
        issues.append(f"⚠️  Title trop court ({len(title)} car.) — idéal > 30")
        score -= 0.5

    # Meta description
    desc = parser.meta.get("description", "")
    if not desc:
        issues.append("❌ Meta description absente")
        score -= 2
    elif len(desc) > 160:
        issues.append(f"⚠️  Meta description trop longue ({len(desc)} car.) — idéal < 160")
        score -= 0.5

    # Canonical
    canonical = parser.meta.get("canonical", "")
    if not canonical:
        issues.append("⚠️  Pas de balise canonical détectée")
        score -= 1

    # H1
    h1s = [h for h in parser.headings if h[0] == "h1"]
    if not h1s:
        issues.append("❌ Aucun H1 sur la page")
        score -= 2
    elif len(h1s) > 1:
        issues.append(f"⚠️  Plusieurs H1 ({len(h1s)}) — un seul recommandé")
        score -= 1

    # Images sans alt
    imgs_no_alt = [i for i in parser.images if not i["alt"]]
    if imgs_no_alt:
        issues.append(f"⚠️  {len(imgs_no_alt)} image(s) sans attribut alt")
        score -= min(2, len(imgs_no_alt) * 0.5)

    # OG tags
    og_tags = ["og:title", "og:description", "og:image"]
    for tag in og_tags:
        if tag not in parser.meta:
            issues.append(f"⚠️  Meta {tag} absente")
            score -= 0.5

    # Schema.org (détection basique via json-ld)
    # (non parseable sans accès au HTML brut — signalé comme à vérifier)
    issues.append("ℹ️  Schema.org (JSON-LD) : à vérifier manuellement dans le <head>")

    score = max(0, round(score, 1))
    return {"score": score, "issues": issues, "title": title, "description": desc}


def audit_ux(parser: SiteParser) -> dict:
    issues = []
    score = 10

    # Structure des titres
    levels = [int(h[0][1]) for h in parser.headings]
    if levels:
        for i in range(1, len(levels)):
            if levels[i] - levels[i-1] > 1:
                issues.append(f"⚠️  Saut de niveau de titre (H{levels[i-1]} → H{levels[i]}) — hiérarchie incohérente")
                score -= 0.5
                break

    # Liens internes vs externes
    internal = [l for l in parser.links if l.startswith("/") or "ohaana" in l]
    external = [l for l in parser.links if l.startswith("http") and "ohaana" not in l]
    if len(internal) < 3:
        issues.append("⚠️  Peu de liens internes — renforcer le maillage")
        score -= 1

    # Images
    if len(parser.images) == 0:
        issues.append("⚠️  Aucune image détectée")
        score -= 1

    # Liens brisés évidents
    broken = [l for l in parser.links if "0000000000" in l or "example.com" in l]
    if broken:
        issues.append(f"❌ {len(broken)} lien(s) placeholder détecté(s) : {broken[:3]}")
        score -= 2

    score = max(0, round(score, 1))
    return {
        "score": score,
        "issues": issues,
        "internal_links": len(internal),
        "external_links": len(external),
        "images": len(parser.images),
    }


def audit_copy(parser: SiteParser) -> dict:
    issues = []
    score = 10

    all_text = " ".join(parser.text_blocks)
    word_count = len(all_text.split())

    if word_count < 300:
        issues.append(f"⚠️  Contenu textuel faible ({word_count} mots) — enrichir pour le SEO et la conversion")
        score -= 2

    # CTA vérification
    cta_keywords = ["réserver", "explorer", "découvrir", "commencer", "essayer", "contacter", "demander"]
    found_ctas = [kw for kw in cta_keywords if kw in all_text.lower()]
    if not found_ctas:
        issues.append("⚠️  Aucun CTA clair détecté dans le texte")
        score -= 2
    elif len(found_ctas) == 1:
        issues.append("ℹ️  Un seul type de CTA — diversifier pour différents stades d'intention")
        score -= 0.5

    # Proposition de valeur dans les premiers blocs
    first_blocks = " ".join(parser.text_blocks[:5]).lower()
    value_signals = ["authentique", "premium", "local", "privé", "sur mesure", "caraïbe", "exclusif"]
    found_value = [v for v in value_signals if v in first_blocks]
    if not found_value:
        issues.append("⚠️  Proposition de valeur peu visible en haut de page")
        score -= 1

    # Preuve sociale
    social_proof = ["avis", "témoignage", "client", "étoile", "note", "recommande"]
    found_proof = [s for s in social_proof if s in all_text.lower()]
    if not found_proof:
        issues.append("ℹ️  Peu de signaux de preuve sociale détectés")
        score -= 0.5

    score = max(0, round(score, 1))
    return {
        "score": score,
        "issues": issues,
        "word_count": word_count,
        "ctas_found": found_ctas,
    }


def audit_technique(html: str, headers: dict, status: int) -> dict:
    issues = []
    score = 10

    # Status HTTP
    if status != 200:
        issues.append(f"❌ Status HTTP {status} (attendu 200)")
        score -= 3

    # HTTPS
    # (vérifié via l'URL passée, non via header ici)

    # Compression
    encoding = headers.get("Content-Encoding", "")
    if "gzip" not in encoding and "br" not in encoding:
        issues.append("⚠️  Pas de compression gzip/brotli détectée")
        score -= 1

    # Cache headers
    cache = headers.get("Cache-Control", "")
    if not cache:
        issues.append("⚠️  Pas de Cache-Control header")
        score -= 0.5

    # Viewport meta
    if "viewport" not in html.lower():
        issues.append("❌ Meta viewport absente — site non responsive")
        score -= 2

    # Charset
    if "charset" not in html.lower()[:500]:
        issues.append("⚠️  Charset non déclaré en début de document")
        score -= 0.5

    # Taille HTML
    size_kb = len(html.encode("utf-8")) / 1024
    if size_kb > 500:
        issues.append(f"⚠️  HTML volumineux ({size_kb:.0f} KB) — vérifier le rendu SSR/SSG")
        score -= 1

    # Liens placeholder
    placeholders = re.findall(r'href="[^"]*0{7,}[^"]*"', html)
    if placeholders:
        issues.append(f"❌ {len(placeholders)} lien(s) placeholder (000...) dans le HTML")
        score -= 1

    # Schema.org JSON-LD
    if "application/ld+json" not in html:
        issues.append("⚠️  Pas de Schema.org JSON-LD détecté")
        score -= 1

    score = max(0, round(score, 1))
    return {
        "score": score,
        "issues": issues,
        "html_size_kb": round(size_kb, 1),
        "http_status": status,
        "compression": encoding or "aucune",
    }


# ─── Rapport Markdown ────────────────────────────────────────────────────────

def generate_report(url: str, seo: dict, ux: dict, copy: dict, tech: dict) -> str:
    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    avg = round((seo["score"] + ux["score"] + copy["score"] + tech["score"]) / 4, 1)

    def emoji_score(s):
        if s >= 8: return "🟢"
        if s >= 6: return "🟡"
        return "🔴"

    lines = [
        f"# Audit Ohaana — {now}",
        f"\n**URL auditée :** {url}",
        f"\n## Synthèse globale\n",
        f"| Axe | Score | Statut |",
        f"|-----|-------|--------|",
        f"| SEO | {seo['score']}/10 | {emoji_score(seo['score'])} |",
        f"| UX / Navigation | {ux['score']}/10 | {emoji_score(ux['score'])} |",
        f"| Copywriting | {copy['score']}/10 | {emoji_score(copy['score'])} |",
        f"| Technique | {tech['score']}/10 | {emoji_score(tech['score'])} |",
        f"| **Score global** | **{avg}/10** | {emoji_score(avg)} |",
        f"\n---\n",
    ]

    sections = [
        ("SEO", seo),
        ("UX / Navigation", ux),
        ("Copywriting / Conversion", copy),
        ("Technique", tech),
    ]

    for name, data in sections:
        lines.append(f"## {emoji_score(data['score'])} {name} — {data['score']}/10\n")
        for issue in data["issues"]:
            lines.append(f"- {issue}")
        lines.append("")

    # Détails
    lines += [
        "---\n",
        "## Données brutes\n",
        f"- **Title** : {seo.get('title', 'N/A')}",
        f"- **Meta description** : {seo.get('description', 'N/A')[:100]}{'...' if len(seo.get('description',''))>100 else ''}",
        f"- **Mots sur la page** : {copy.get('word_count', 0)}",
        f"- **Images** : {ux.get('images', 0)}",
        f"- **Liens internes** : {ux.get('internal_links', 0)}",
        f"- **Liens externes** : {ux.get('external_links', 0)}",
        f"- **Taille HTML** : {tech.get('html_size_kb', 0)} KB",
        f"- **Compression** : {tech.get('compression', 'N/A')}",
        f"- **Status HTTP** : {tech.get('http_status', 'N/A')}",
        f"\n---",
        f"\n*Généré par l'agent audit Ohaana — {now}*",
    ]

    return "\n".join(lines)


# ─── Main ────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Agent audit complet pour Ohaana")
    parser.add_argument("url", help="URL à auditer (ex: https://ohaana.vercel.app)")
    parser.add_argument("--output", default="audit-report.md", help="Fichier de sortie (.md)")
    args = parser.parse_args()

    url = args.url
    print(f"🔍 Audit en cours : {url}")

    html, status, headers = fetch(url)
    if not html:
        print(f"❌ Impossible de charger la page (status {status})")
        sys.exit(1)

    print("✅ Page chargée — analyse en cours...")

    site = SiteParser()
    site.feed(html)

    seo  = audit_seo(site, url)
    ux   = audit_ux(site)
    copy = audit_copy(site)
    tech = audit_technique(html, headers, status)

    report = generate_report(url, seo, ux, copy, tech)

    with open(args.output, "w", encoding="utf-8") as f:
        f.write(report)

    print(f"\n📄 Rapport généré : {args.output}")
    avg = round((seo["score"] + ux["score"] + copy["score"] + tech["score"]) / 4, 1)
    print(f"📊 Score global : {avg}/10")


if __name__ == "__main__":
    main()
