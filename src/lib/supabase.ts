import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

let _publicClient: ReturnType<typeof createClient> | null = null

export function getPublicSupabase(): any {
  if (_publicClient) return _publicClient
  if (!supabaseUrl || !supabaseAnonKey) {
    // Do not throw at module evaluation time — return null so callers can handle missing config.
    return null
  }
  _publicClient = createClient(supabaseUrl, supabaseAnonKey)
  return _publicClient
}

// Factory to create a server-side client with the service role key on demand.
// Avoids initializing the admin client during client-side module evaluation.
export function createSupabaseAdmin(): any {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) {
    throw new Error(
      'Missing SUPABASE_SERVICE_ROLE_KEY in environment. Set it in .env.local for server-side operations.'
    )
  }
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key)
}
