import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

/**
 * Handles the OAuth redirect callback for both implicit and PKCE flows.
 *
 * - Implicit flow: Supabase returns #access_token in the hash.
 *   detectSessionInUrl:true processes it automatically before this component mounts.
 *   We just call getSession() to confirm and navigate.
 *
 * - PKCE flow: Supabase returns ?code in the query string.
 *   We exchange it manually with exchangeCodeForSession().
 */
export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('code')

    if (code) {
      // PKCE flow
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
      return
    }

    // Implicit flow — detectSessionInUrl already processed the hash.
    // Session should be available immediately via getSession().
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/editor', { replace: true })
        return
      }

      // Fallback: wait for onAuthStateChange in case the SDK is still processing.
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        subscription.unsubscribe()
        if (session) {
          navigate('/editor', { replace: true })
        } else {
          navigate('/login?error=no_session', { replace: true })
        }
      })
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
