import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

if (!url || !anonKey) {
  // it's useful to fail fast in local development if env is missing
  console.warn('Supabase URL or anon key is not set. Some features may not work.')
}

export const supabase = createClient(url ?? '', anonKey ?? '')
