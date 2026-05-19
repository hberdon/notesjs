import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

/**
 * Handles the OAuth redirect callback.
 *
 * Supabase's `detectSessionInUrl: true` (set in supabase.ts) automatically
 * exchanges the `?code` parameter for a session when the page loads.
 * This component just waits for `onAuthStateChange` to fire and then
 * navigates to /editor.
 *
 * On error, it navigates to /login with an error query param so LoginPage
 * can surface a user-facing message.
 */
export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    // exchangeCodeForSession handles the PKCE code exchange.
    // The URL's ?code param is extracted here manually for cases where
    // detectSessionInUrl may not have fired yet on initial render.
    const code = new URLSearchParams(window.location.search).get('code')

    if (!code) {
      navigate('/login?error=missing_code', { replace: true })
      return
    }

    supabase.auth
      .exchangeCodeForSession(code)
      .then(({ error }) => {
        if (error) {
          const message = encodeURIComponent(error.message)
          navigate(`/login?error=${message}`, { replace: true })
        } else {
          navigate('/editor', { replace: true })
        }
      })
      .catch(() => {
        navigate('/login?error=callback_failed', { replace: true })
      })
  }, [navigate])

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
      }}
      aria-label="Loading"
    >
      <div>Signing you in…</div>
    </div>
  )
}
