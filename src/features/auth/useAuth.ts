import type { Provider, Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from './authStore'

export interface UseAuthReturn {
  user: User | null
  session: Session | null
  loading: boolean
  signInWithEmail: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signInWithGitHub: () => Promise<void>
  signOut: () => Promise<void>
}

export function useAuth(): UseAuthReturn {
  const { user, session, loading } = useAuthStore()

  async function signInWithEmail(email: string, password: string): Promise<void> {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  async function signInWithOAuth(provider: Provider): Promise<void> {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin + '/auth/callback',
      },
    })
    if (error) throw error
  }

  async function signInWithGoogle(): Promise<void> {
    return signInWithOAuth('google')
  }

  async function signInWithGitHub(): Promise<void> {
    return signInWithOAuth('github')
  }

  async function signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  return {
    user,
    session,
    loading,
    signInWithEmail,
    signInWithGoogle,
    signInWithGitHub,
    signOut,
  }
}
