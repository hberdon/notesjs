import { describe, it, expect, beforeEach, vi } from 'vitest'

// ── vi.hoisted ensures mock fns exist before vi.mock factory runs ─────────────
const {
  mockSignInWithPassword,
  mockSignInWithOAuth,
  mockSignOut,
  mockGetSession,
  mockOnAuthStateChange,
} = vi.hoisted(() => ({
  mockSignInWithPassword: vi.fn(),
  mockSignInWithOAuth: vi.fn(),
  mockSignOut: vi.fn(),
  // IMPORTANT: getSession is called at authStore module init — must return a real Promise
  mockGetSession: vi.fn().mockResolvedValue({ data: { session: null } }),
  // onAuthStateChange must return a subscription-like object
  mockOnAuthStateChange: vi.fn().mockReturnValue({
    data: { subscription: { unsubscribe: vi.fn() } },
  }),
}))

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: mockSignInWithPassword,
      signInWithOAuth: mockSignInWithOAuth,
      signOut: mockSignOut,
      getSession: mockGetSession,
      onAuthStateChange: mockOnAuthStateChange,
    },
  },
}))

import { renderHook } from '@testing-library/react'
import { useAuth } from './useAuth'

// ─────────────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks()
  // Re-apply defaults after clearAllMocks()
  mockGetSession.mockResolvedValue({ data: { session: null } })
  mockOnAuthStateChange.mockReturnValue({
    data: { subscription: { unsubscribe: vi.fn() } },
  })
})

describe('useAuth', () => {
  it('exposes signInWithEmail, signInWithGoogle, signInWithGitHub, signOut', () => {
    const { result } = renderHook(() => useAuth())
    expect(typeof result.current.signInWithEmail).toBe('function')
    expect(typeof result.current.signInWithGoogle).toBe('function')
    expect(typeof result.current.signInWithGitHub).toBe('function')
    expect(typeof result.current.signOut).toBe('function')
  })

  describe('signInWithEmail', () => {
    it('calls supabase.auth.signInWithPassword with email and password', async () => {
      mockSignInWithPassword.mockResolvedValue({ data: {}, error: null })

      const { result } = renderHook(() => useAuth())
      await result.current.signInWithEmail('test@example.com', 'password123')

      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
    })

    it('throws when supabase returns an error', async () => {
      mockSignInWithPassword.mockResolvedValue({
        data: {},
        error: new Error('Invalid credentials'),
      })

      const { result } = renderHook(() => useAuth())
      await expect(
        result.current.signInWithEmail('bad@example.com', 'wrong'),
      ).rejects.toThrow('Invalid credentials')
    })
  })

  describe('signInWithGoogle', () => {
    it('calls supabase.auth.signInWithOAuth with provider "google"', async () => {
      mockSignInWithOAuth.mockResolvedValue({ data: {}, error: null })

      const { result } = renderHook(() => useAuth())
      await result.current.signInWithGoogle()

      expect(mockSignInWithOAuth).toHaveBeenCalledWith(
        expect.objectContaining({ provider: 'google' }),
      )
    })

    it('includes a redirectTo option pointing to /auth/callback', async () => {
      mockSignInWithOAuth.mockResolvedValue({ data: {}, error: null })

      const { result } = renderHook(() => useAuth())
      await result.current.signInWithGoogle()

      expect(mockSignInWithOAuth).toHaveBeenCalledWith(
        expect.objectContaining({
          options: expect.objectContaining({
            redirectTo: expect.stringContaining('/auth/callback'),
          }),
        }),
      )
    })
  })

  describe('signInWithGitHub', () => {
    it('calls supabase.auth.signInWithOAuth with provider "github"', async () => {
      mockSignInWithOAuth.mockResolvedValue({ data: {}, error: null })

      const { result } = renderHook(() => useAuth())
      await result.current.signInWithGitHub()

      expect(mockSignInWithOAuth).toHaveBeenCalledWith(
        expect.objectContaining({ provider: 'github' }),
      )
    })
  })

  describe('signOut', () => {
    it('calls supabase.auth.signOut', async () => {
      mockSignOut.mockResolvedValue({ error: null })

      const { result } = renderHook(() => useAuth())
      await result.current.signOut()

      expect(mockSignOut).toHaveBeenCalledTimes(1)
    })

    it('throws when supabase returns an error', async () => {
      mockSignOut.mockResolvedValue({ error: new Error('Sign out failed') })

      const { result } = renderHook(() => useAuth())
      await expect(result.current.signOut()).rejects.toThrow('Sign out failed')
    })
  })
})
