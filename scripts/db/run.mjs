// Validates supabase/migrations + seed.sql + supabase/tests/*.sql on an in-memory Postgres (PGlite).
// Usage: node scripts/db/run.mjs [--no-tests] [--no-seed]
import { PGlite } from '@electric-sql/pglite'
import { uuid_ossp } from '@electric-sql/pglite/contrib/uuid_ossp'
import { pg_trgm } from '@electric-sql/pglite/contrib/pg_trgm'
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const args = new Set(process.argv.slice(2))

const db = new PGlite({ extensions: { uuid_ossp, pg_trgm } })

async function runFile(path, label) {
  const sql = readFileSync(path, 'utf8')
  try {
    await db.exec(sql)
    console.log(`  ok   ${label}`)
  } catch (e) {
    console.error(`  FAIL ${label}\n       ${e.message}`)
    process.exit(1)
  }
}

console.log('Stubs')
await runFile(join(root, 'scripts/db/stubs.sql'), 'scripts/db/stubs.sql')

console.log('Migrations')
const migDir = join(root, 'supabase/migrations')
for (const f of readdirSync(migDir).filter((f) => f.endsWith('.sql')).sort()) {
  await runFile(join(migDir, f), f)
}

if (!args.has('--no-seed') && existsSync(join(root, 'supabase/seed.sql'))) {
  console.log('Seed')
  await runFile(join(root, 'supabase/seed.sql'), 'supabase/seed.sql')
}

if (!args.has('--no-tests')) {
  console.log('Tests')
  const testDir = join(root, 'supabase/tests')
  for (const f of readdirSync(testDir).filter((f) => f.endsWith('.sql')).sort()) {
    await runFile(join(testDir, f), f)
  }
}
if (!args.has('--no-tests')) {
  const r = await db.query('select count(*)::int as n from t.log')
  console.log(`\n${r.rows[0].n} security assertions passed.`)
}
console.log('All database checks passed.')
await db.close()
