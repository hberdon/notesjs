import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

if (!supabaseUrl) {
  throw new Error(
    '[notesjs] Missing env variable: VITE_SUPABASE_URL\n' +
      'Copy .env.example to .env.local and fill in your Supabase project URL.',
  )
}

if (!supabaseAnonKey) {
  throw new Error(
    '[notesjs] Missing env variable: VITE_SUPABASE_ANON_KEY\n' +
      'Copy .env.example to .env.local and fill in your Supabase anon key.',
  )
}

/**
 * Singleton Supabase client typed against the Database schema.
 * Import this everywhere — never call createClient() a second time.
 *
 * Auth is configured for redirect-based OAuth (detectSessionInUrl: true)
 * so the /auth/callback route can exchange the ?code param automatically.
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    detectSessionInUrl: true,
    persistSession: true,
    autoRefreshToken: true,
    flowType: 'implicit',
  },
})
