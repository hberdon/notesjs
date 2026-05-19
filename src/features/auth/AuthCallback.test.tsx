import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

// ── vi.hoisted ensures mock fns exist before vi.mock factory runs ─────────────
const {
  mockNavigate,
  mockExchangeCodeForSession,
  mockGetSession,
  mockOnAuthStateChange,
} = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockExchangeCodeForSession: vi.fn(),
  mockGetSession: vi.fn(),
  mockOnAuthStateChange: vi.fn(),
}))

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      exchangeCodeForSession: mockExchangeCodeForSession,
      getSession: mockGetSession,
      onAuthStateChange: mockOnAuthStateChange,
    },
  },
}))

import AuthCallback from './AuthCallback'

// ─────────────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks()
  mockGetSession.mockResolvedValue({ data: { session: null } })
  mockOnAuthStateChange.mockReturnValue({
    data: { subscription: { unsubscribe: vi.fn() } },
  })
})

function setLocationSearch(search: string) {
  Object.defineProperty(window, 'location', {
    value: { ...window.location, search },
    writable: true,
    configurable: true,
  })
}

function renderCallback(search = '?code=valid-code') {
  setLocationSearch(search)
  return render(
    <MemoryRouter>
      <AuthCallback />
    </MemoryRouter>,
  )
}

describe('AuthCallback', () => {
  it('renders a loading state while processing', () => {
    mockExchangeCodeForSession.mockReturnValue(new Promise(() => {})) // never resolves
    renderCallback('?code=some-code')

    expect(screen.getByText(/signing you in/i)).toBeInTheDocument()
  })

  it('navigates to /editor on successful code exchange', async () => {
    mockExchangeCodeForSession.mockResolvedValue({ error: null })

    renderCallback('?code=valid-code')

    await waitFor(() => {
      expect(mockExchangeCodeForSession).toHaveBeenCalledWith('valid-code')
      expect(mockNavigate).toHaveBeenCalledWith('/editor', { replace: true })
    })
  })

  it('navigates to /login?error=... when exchangeCodeForSession returns an error', async () => {
    const err = new Error('Exchange failed')
    mockExchangeCodeForSession.mockResolvedValue({ error: err })

    renderCallback('?code=bad-code')

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        expect.stringContaining('/login?error='),
        { replace: true },
      )
    })
  })

  it('navigates to /login?error=missing_code when code param is absent', async () => {
    renderCallback('') // no ?code

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login?error=missing_code', { replace: true })
    })
    expect(mockExchangeCodeForSession).not.toHaveBeenCalled()
  })

  it('navigates to /login?error=callback_failed when exchange throws', async () => {
    mockExchangeCodeForSession.mockRejectedValue(new Error('Network error'))

    renderCallback('?code=valid-code')

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login?error=callback_failed', { replace: true })
    })
  })
})
