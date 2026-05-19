import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

// ── vi.hoisted ensures mock fns exist before vi.mock factory runs ─────────────
// getSession/onAuthStateChange are called at authStore module init time,
// so they must be default-resolved from the moment they're created.
const { mockGetSession, mockOnAuthStateChange } = vi.hoisted(() => ({
  mockGetSession: vi.fn().mockResolvedValue({ data: { session: null } }),
  mockOnAuthStateChange: vi.fn().mockReturnValue({
    data: { subscription: { unsubscribe: vi.fn() } },
  }),
}))

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: mockGetSession,
      onAuthStateChange: mockOnAuthStateChange,
    },
  },
}))

import ProtectedRoute from './ProtectedRoute'
import { useAuthStore } from '@/features/auth/authStore'
import type { Session, User } from '@supabase/supabase-js'

// ─────────────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks()
  mockGetSession.mockResolvedValue({ data: { session: null } })
  mockOnAuthStateChange.mockReturnValue({
    data: { subscription: { unsubscribe: vi.fn() } },
  })
})

function renderProtectedRoute() {
  return render(
    <MemoryRouter initialEntries={['/protected']}>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/protected" element={<div>Protected content</div>} />
        </Route>
        <Route path="/login" element={<div>Login page</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ProtectedRoute', () => {
  it('renders a loading indicator when loading is true', () => {
    useAuthStore.setState({ loading: true, session: null, user: null })

    renderProtectedRoute()

    // ProtectedRoute uses role="status" and aria-label="Loading"
    expect(screen.getByRole('status', { name: /loading/i })).toBeInTheDocument()
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument()
  })

  it('redirects to /login when loading is false and session is null', () => {
    useAuthStore.setState({ loading: false, session: null, user: null })

    renderProtectedRoute()

    expect(screen.getByText('Login page')).toBeInTheDocument()
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument()
  })

  it('renders Outlet content when loading is false and session exists', () => {
    const fakeSession = {
      user: { id: 'user-1', email: 'test@example.com' } as User,
    } as Session

    useAuthStore.setState({ loading: false, session: fakeSession, user: fakeSession.user })

    renderProtectedRoute()

    expect(screen.getByText('Protected content')).toBeInTheDocument()
    expect(screen.queryByText('Login page')).not.toBeInTheDocument()
  })
})
