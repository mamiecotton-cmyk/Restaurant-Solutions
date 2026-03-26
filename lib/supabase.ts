import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

let supabaseClient: ReturnType<typeof createClient> | null = null

export function getSupabase() {
  if (supabaseClient) {
    return supabaseClient
  }

  if (!url || !anonKey) {
    throw new Error('Supabase URL or anon key is not set.')
  }

  supabaseClient = createClient(url, anonKey)
  return supabaseClient
}
