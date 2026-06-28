import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuthStore } from '@/features/auth/authStore'
import { useThemeStore, getEffectiveTheme } from '@/store/themeStore'
import { useI18nStore } from '@/store/i18nStore'
import { AvatarButton } from '@/shared/components/AvatarMenu'

// ── ThemeToggleButton (guest mode) ────────────────────────────────────────────

function SunIcon({ color }: { color: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke={color} width="16" height="16" style={{ flexShrink: 0 }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
    </svg>
  )
}

function MoonIcon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="16" height="16" style={{ flexShrink: 0, color }}>
      <path fillRule="evenodd" clipRule="evenodd" d="M17.715 15.15A6.5 6.5 0 0 1 9 6.035C6.106 6.922 4 9.645 4 12.867c0 3.94 3.153 7.136 7.042 7.136 3.101 0 5.734-2.032 6.673-4.853Z" fill="currentColor" opacity="0.2" />
      <path d="m17.715 15.15.95.316a1 1 0 0 0-1.445-1.185l.495.869ZM9 6.035l.846.534a1 1 0 0 0-1.14-1.49L9 6.035Zm8.221 8.246a5.47 5.47 0 0 1-2.72.718v2a7.47 7.47 0 0 0 3.71-.98l-.99-1.738Zm-2.72.718A5.5 5.5 0 0 1 9 9.5H7a7.5 7.5 0 0 0 7.5 7.5v-2ZM9 9.5c0-1.079.31-2.082.845-2.93L8.153 5.5A7.47 7.47 0 0 0 7 9.5h2Zm-4 3.368C5 10.089 6.815 7.75 9.292 6.99L8.706 5.08C5.397 6.094 3 9.201 3 12.867h2Zm6.042 6.136C7.718 19.003 5 16.268 5 12.867H3c0 4.48 3.588 8.136 8.042 8.136v-2Zm5.725-4.17c-.81 2.433-3.074 4.17-5.725 4.17v2c3.552 0 6.553-2.327 7.622-5.537l-1.897-.632Z" fill="currentColor" />
      <path fillRule="evenodd" clipRule="evenodd" d="M17 3a1 1 0 0 1 1 1 2 2 0 0 0 2 2 1 1 0 1 1 0 2 2 2 0 0 0-2 2 1 1 0 1 1-2 0 2 2 0 0 0-2-2 1 1 0 1 1 0-2 2 2 0 0 0 2-2 1 1 0 0 1 1-1Z" fill="currentColor" />
    </svg>
  )
}

function ThemeToggleButton() {
  const theme    = useThemeStore((s) => s.theme)
  const setTheme = useThemeStore((s) => s.setTheme)
  const t        = useI18nStore((s) => s.t)
  const [hovered, setHovered] = useState(false)
  const isDark    = getEffectiveTheme(theme) === 'dark'
  const iconColor = hovered ? 'var(--accent)' : 'var(--ink3)'

  return (
    <button
      type="button"
      title={isDark ? t.tabbar.temaClaro : t.tabbar.temaOscuro}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display:        'inline-flex',
        alignItems:     'center',
        justifyContent: 'center',
        width:          '1.714rem',
        height:         '1.714rem',
        background:     hovered ? 'var(--chrome)' : 'transparent',
        border:         'none',
        borderRadius:   '20px',
        cursor:         'pointer',
        transition:     'background 120ms',
        flexShrink:     0,
      }}
    >
      {isDark ? <SunIcon color={iconColor} /> : <MoonIcon color={iconColor} />}
    </button>
  )
}

function GuestLoginButton() {
  const navigate = useNavigate()
  const t        = useI18nStore((s) => s.t)
  const [hovered, setHovered] = useState(false)

  return (
    <button
      type="button"
      onClick={() => navigate('/login')}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display:     'inline-flex',
        alignItems:  'center',
        gap:         '0.286rem',
        padding:     '0.286rem 0.714rem',
        background:  hovered ? 'var(--accentSoft)' : 'transparent',
        border:      '1px solid var(--accentBorder)',
        borderRadius:'var(--r-pill)',
        cursor:      'pointer',
        fontSize:    '0.821rem',
        fontWeight:  700,
        color:       'var(--accentDeep)',
        fontFamily:  'var(--font-ui)',
        whiteSpace:  'nowrap',
        transition:  'background 120ms',
        lineHeight:  1,
      }}
    >
      {t.tabbar.login}
    </button>
  )
}

// ── AppHeader ─────────────────────────────────────────────────────────────────

export interface AppHeaderProps {
  /** Content for the middle zone (tabs, breadcrumb, etc). */
  children?: ReactNode
  isGuest?: boolean
  /** Pass true when already on /preferences to disable that nav item in the menu. */
  disablePreferences?: boolean
}

export function AppHeader({ children, isGuest = false, disablePreferences = false }: AppHeaderProps) {
  const user     = useAuthStore((s) => s.user)
  const theme    = useThemeStore((s) => s.theme)
  const isDark   = getEffectiveTheme(theme) === 'dark'
  const t        = useI18nStore((s) => s.t)

  const avatarUrl  = (user?.user_metadata?.avatar_url ?? user?.user_metadata?.picture) as string | undefined
  const fullName   = (user?.user_metadata?.full_name as string | undefined) ?? user?.email?.split('@')[0] ?? 'Usuario'
  const firstName  = fullName.split(' ')[0]
  const email      = user?.email ?? ''

  return (
    <div
      style={{
        display:    'flex',
        alignItems: 'stretch',
        height:     '3rem',
        background: 'linear-gradient(to right, rgba(16,185,129,0.07), transparent), repeating-linear-gradient(45deg, rgba(0,0,0,0.04), rgba(0,0,0,0.04) 1px, transparent 1px, transparent 12px)',
        flexShrink: 0,
        fontFamily: 'var(--font-ui)',
        position:   'relative',
      }}
    >
      {/* ── Left: logo ── */}
      <div
        style={{
          display:    'flex',
          alignItems: 'center',
          flexShrink: 0,
          gap:        '0.714rem',
          padding:    '0 1rem',
        }}
      >
        <img
          src="/images/logo-drop-t.png"
          alt="notes.js"
          style={{ width: '1.857rem', height: 'auto', display: 'block', flexShrink: 0, filter: isDark ? 'invert(1)' : 'none' }}
        />
        <span style={{ fontSize: '1.357rem', fontWeight: 800, letterSpacing: -0.5, color: 'var(--ink)', lineHeight: 1, whiteSpace: 'nowrap', userSelect: 'none' }}>
          notes<span style={{ color: 'var(--accent)' }}>.js</span>
        </span>
      </div>

      {/* ── Middle: slot ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', overflow: 'hidden', minWidth: 0 }}>
        {children}
      </div>

      {/* ── Right: auth zone ── */}
      <div
        style={{
          display:    'flex',
          alignItems: 'center',
          gap:        '0.571rem',
          flexShrink: 0,
          padding:    '0 0.857rem',
          background: 'var(--bg)',
          borderLeft: isGuest ? 'none' : '1px solid var(--border)',
          position:   'relative',
        }}
      >
        {isGuest ? (
          <>
            <ThemeToggleButton />
            <GuestLoginButton />
          </>
        ) : (
          <AvatarButton
            avatarUrl={avatarUrl}
            firstName={firstName}
            email={email}
            disablePreferences={disablePreferences}
            greeting={`${t.tabbar.hola} ${firstName}`}
          />
        )}
      </div>
    </div>
  )
}
