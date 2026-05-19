import { create } from 'zustand'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  isGuest: boolean
  setUser: (user: User | null) => void
  setSession: (session: Session | null) => void
  setLoading: (loading: boolean) => void
  setGuest: (value: boolean) => void
}

export const useAuthStore = create<AuthState>((set) => {
  // Initialize session on store creation
  supabase.auth.getSession().then(({ data: { session } }) => {
    set({
      session,
      user: session?.user ?? null,
      loading: false,
    })
  })

  // Subscribe to auth state changes
  supabase.auth.onAuthStateChange((_event, session) => {
    set({
      session,
      user: session?.user ?? null,
      loading: false,
    })
  })

  return {
    user: null,
    session: null,
    loading: true,
    isGuest: false,
    setUser: (user) => set({ user }),
    setSession: (session) => set({ session }),
    setLoading: (loading) => set({ loading }),
    setGuest: (value) => set({ isGuest: value }),
  }
})
