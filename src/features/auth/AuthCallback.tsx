import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

/**
 * Handles the OAuth redirect callback for the PKCE flow.
 *
 * Supabase returns a `?code` query param; we exchange it for a session via
 * exchangeCodeForSession(). No code present means the callback was reached
 * without a valid OAuth redirect.
 */
export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')

    if (!code) {
      // Surface the real reason instead of masking everything as missing_code.
      // Supabase appends ?error=...&error_description=... to the callback when the
      // provider exchange fails (bad GitHub callback URL, missing email scope,
      // redirect not allowlisted, etc.).
      const reason =
        params.get('error_description') || params.get('error') || 'missing_code'
      console.error('[AuthCallback] no code in callback URL →', window.location.href)
      navigate(`/login?error=${encodeURIComponent(reason)}`, { replace: true })
      return
    }

    supabase.auth
      .exchangeCodeForSession(code)
      .then(({ error }) => {
        if (error) {
          navigate(`/login?error=${encodeURIComponent(error.message)}`, { replace: true })
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
