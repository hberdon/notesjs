import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/authStore'

/**
 * Guards any route that requires an authenticated session.
 *
 * Loading guard is MANDATORY — it prevents a session flash where an
 * authenticated user briefly sees the /login redirect before getSession()
 * resolves.
 *
 * Render behaviour:
 *   loading === true  → show spinner (session check in-flight)
 *   session === null  → redirect to /login
 *   session exists    → render <Outlet /> (child route)
 */
export default function ProtectedRoute() {
  const { loading, session, isGuest } = useAuthStore()

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
        aria-label="Loading"
        role="status"
      >
        <div>Loading…</div>
      </div>
    )
  }

  if (!session && !isGuest) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
