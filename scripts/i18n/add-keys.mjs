// Ajoute des clés à messages/<lang>.json sans toucher aux clés existantes.
// Usage : node scripts/i18n/add-keys.mjs <lang> <fichier-de-clés.json>
// Le fichier de clés est un objet imbriqué { namespace: { clé: "texte" } }. Une clé déjà présente n'est jamais écrasée.
import { readFileSync, writeFileSync } from 'node:fs'

const [lang, file] = process.argv.slice(2)
if (!['fr', 'en', 'es'].includes(lang) || !file) {
  console.error('Usage: node scripts/i18n/add-keys.mjs <fr|en|es> <keys.json>')
  process.exit(1)
}
const target = `messages/${lang}.json`
const current = JSON.parse(readFileSync(target, 'utf8'))
const incoming = JSON.parse(readFileSync(file, 'utf8'))

let added = 0
let kept = 0
function merge(into, from) {
  for (const [k, v] of Object.entries(from)) {
    if (v && typeof v === 'object') {
      if (typeof into[k] !== 'object' || into[k] === null) into[k] = {}
      merge(into[k], v)
    } else if (k in into) kept += 1
    else {
      into[k] = v
      added += 1
    }
  }
}
merge(current, incoming)
writeFileSync(target, JSON.stringify(current, null, 2) + '\n')
console.log(`${target}: ${added} clé(s) ajoutée(s), ${kept} déjà présente(s) conservée(s)`)
