// Promotes an existing user to admin. LOCAL / OPS USE ONLY — never exposed through the app UI.
//
//   node --env-file=.env.local scripts/make-admin.mjs user@example.com --yes
//
// Needs SUPABASE_SERVICE_ROLE_KEY (Project Settings → API) in .env.local. The service role key bypasses
// RLS: keep it out of git, out of NEXT_PUBLIC_* variables and out of Vercel's "Preview" scope if possible.
import { createClient } from '@supabase/supabase-js'

const [email, ...flags] = process.argv.slice(2)
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!email || !email.includes('@')) {
  console.error('Usage: node --env-file=.env.local scripts/make-admin.mjs <email> --yes')
  process.exit(1)
}
if (!url || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in the environment.')
  process.exit(1)
}

const host = new URL(url).host
if (!flags.includes('--yes')) {
  console.error(`About to grant ADMIN to ${email} on ${host}. Re-run with --yes to confirm.`)
  process.exit(1)
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })

const { data: user, error: findError } = await supabase
  .from('users').select('id, email, role').ilike('email', email).maybeSingle()
if (findError) { console.error('Lookup failed:', findError.message); process.exit(1) }
if (!user) { console.error(`No user with email ${email}. They must sign up (and confirm their email) first.`); process.exit(1) }
if (user.role === 'admin') { console.log(`${user.email} is already an admin.`); process.exit(0) }

const { error } = await supabase.from('users').update({ role: 'admin' }).eq('id', user.id)
if (error) { console.error('Update failed:', error.message); process.exit(1) }

console.log(`OK — ${user.email} (was ${user.role}) is now admin on ${host}.`)
