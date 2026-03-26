declare module 'next/server'
declare module 'react/jsx-runtime'
declare module '@/lib/supabase' {
  import type { SupabaseClient } from '@supabase/supabase-js'
  export function getSupabase(): SupabaseClient<any, any, any>
}
declare module 'stripe' {
  const Stripe: any
  export default Stripe
}
