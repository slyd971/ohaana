import { SUPABASE_URL, SUPABASE_KEY } from '@/lib/supabase/config'

// Demo mode bypasses ALL authentication (investor demo only). Opt-in: NEXT_PUBLIC_DEMO_MODE=true.
export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

export const SUPABASE_CONFIGURED = Boolean(SUPABASE_URL && SUPABASE_KEY)
