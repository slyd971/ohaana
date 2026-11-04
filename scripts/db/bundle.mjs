// Concatenates supabase/migrations/*.sql (and optionally seed.sql) into ONE file to paste in the
// Supabase SQL editor when you do not use the CLI.  node scripts/db/bundle.mjs [--with-seed]
import { readFileSync, readdirSync, mkdirSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const dir = join(root, 'supabase/migrations')
const parts = readdirSync(dir).filter((f) => f.endsWith('.sql')).sort()
  .map((f) => `-- ===== ${f} =====\n${readFileSync(join(dir, f), 'utf8')}`)
if (process.argv.includes('--with-seed')) parts.push(`-- ===== seed.sql (demo data) =====\n${readFileSync(join(root, 'supabase/seed.sql'), 'utf8')}`)

const outDir = join(root, 'supabase/.generated')
mkdirSync(outDir, { recursive: true })
const out = join(outDir, process.argv.includes('--with-seed') ? 'schema-and-seed.sql' : 'schema.sql')
writeFileSync(out, parts.join('\n\n'))
console.log(`Wrote ${out} (${parts.length} parts)`)
