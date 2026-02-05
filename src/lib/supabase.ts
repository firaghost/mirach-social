import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Factory to create a server-side client with the service role key on demand.
// Avoids initializing the admin client during client-side module evaluation.
export function createSupabaseAdmin() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) {
    throw new Error(
      'Missing SUPABASE_SERVICE_ROLE_KEY in environment. Set it in .env.local for server-side operations.'
    )
  }
  return createClient(supabaseUrl, key)
}
