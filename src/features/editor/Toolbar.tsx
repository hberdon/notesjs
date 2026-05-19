import { useThemeStore } from '@/store/themeStore'
import { useAuthStore } from '@/features/auth/authStore'
import { useAuth } from '@/features/auth/useAuth'

export default function Toolbar() {
  const theme = useThemeStore((s) => s.theme)
  const toggleTheme = useThemeStore((s) => s.toggleTheme)
  const user = useAuthStore((s) => s.user)
  const { signOut } = useAuth()

  const isDark = theme === 'dark'

  async function handleSignOut() {
    try {
      await signOut()
    } catch (err) {
      console.error('[Toolbar] sign out failed:', err)
    }
  }

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        height: '40px',
        background: 'var(--toolbar-bg)',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
      }}
    >
      {/* App name */}
      <span
        style={{
          fontWeight: 700,
          fontSize: '15px',
          color: 'var(--accent)',
          letterSpacing: '0.5px',
        }}
      >
        notesjs
      </span>

      {/* Right-side controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Theme toggle */}
        <button
          aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
          onClick={toggleTheme}
          title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
          style={{
            background: 'none',
            border: '1px solid var(--border)',
            borderRadius: '4px',
            cursor: 'pointer',
            color: 'var(--text-primary)',
            fontSize: '16px',
            padding: '3px 8px',
            lineHeight: 1,
          }}
        >
          {isDark ? '☀️' : '🌙'}
        </button>

        {/* User info + sign out */}
        {user && (
          <>
            <span
              style={{
                fontSize: '13px',
                color: 'var(--text-secondary)',
                maxWidth: '180px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              title={user.email}
            >
              {user.email}
            </span>
            <button
              onClick={handleSignOut}
              style={{
                background: 'none',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                cursor: 'pointer',
                color: 'var(--text-secondary)',
                fontSize: '13px',
                padding: '3px 8px',
              }}
            >
              Sign out
            </button>
          </>
        )}
      </div>
    </header>
  )
}
