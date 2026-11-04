// Supabase public configuration. Supports the new "publishable" key name and the legacy anon key.
// NEXT_PUBLIC_* must be referenced literally so Next.js can inline them in the browser bundle.
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
export const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
