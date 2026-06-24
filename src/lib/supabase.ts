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
 * Auth uses the PKCE flow (recommended for SPAs): OAuth returns a `?code`
 * query param that AuthCallback exchanges manually via exchangeCodeForSession().
 *
 * detectSessionInUrl is OFF on purpose — with PKCE the SDK would otherwise
 * auto-consume the `?code` before AuthCallback's manual exchange runs, causing
 * an "auth code already used" error. The manual exchange is the single owner
 * of the code.
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    detectSessionInUrl: false,
    persistSession: true,
    autoRefreshToken: true,
    flowType: 'pkce',
  },
})
