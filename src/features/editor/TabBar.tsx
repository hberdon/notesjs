// TabBar — V3 redesign
// Design reference: design/design_handoff_notesjs_v3/README.md § "V3TabBar"

import { useState, useRef, useEffect } from 'react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/authStore'
import { useThemeStore, getEffectiveTheme } from '@/store/themeStore'
import { useAuth } from '@/features/auth/useAuth'
import { FormatPill } from '@/shared/components/FormatPill'
import { N2G } from '@/shared/components/N2G'
import type { Tab } from '@/shared/types'
import type { Theme } from '@/shared/types'

// ── Helpers ───────────────────────────────────────────────────────────────────

function getExt(filename: string): string {
  const dot = filename.lastIndexOf('.')
  if (dot === -1 || dot === filename.length - 1) return 'txt'
  return filename.slice(dot + 1).toLowerCase()
}

function getInitials(email: string | null | undefined): string {
  if (!email) return '?'
  const [local] = email.split('@')
  const parts = local.split(/[._\-+]/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return local.slice(0, 2).toUpperCase()
}

// ── AvatarMenu ────────────────────────────────────────────────────────────────

interface AvatarMenuProps {
  open: boolean
  onClose: () => void
}

function AvatarMenu({ open, onClose }: AvatarMenuProps) {
  const user = useAuthStore((s) => s.user)
  const theme = useThemeStore((s) => s.theme)
  const setTheme = useThemeStore((s) => s.setTheme)
  const { signOut } = useAuth()
  const navigate = useNavigate()

  const email = user?.email ?? null
  const fullName = (user?.user_metadata?.full_name as string | undefined) ?? email ?? 'Usuario'
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined
  const initials = getInitials(email)

  const THEMES: Array<{ id: Theme; label: string }> = [
    { id: 'dark', label: 'Oscuro' },
    { id: 'light', label: 'Claro' },
    { id: 'auto', label: 'Auto' },
  ]

  async function handleSignOut() {
    onClose()
    try { await signOut() } catch { /* ignore */ }
  }

  if (!open) return null

  return (
    <div
      style={{
        position: 'absolute',
        top: '100%',
        right: 0,
        width: '15rem',
        background: 'var(--bg)',
        borderTop: '2px solid #10b981',
        borderRadius: '0.429rem 0 0.429rem 0.429rem',
        boxShadow: '0 10px 24px -8px rgba(15,23,42,0.22), 0 2px 4px rgba(15,23,42,0.05)',
        zIndex: 200,
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      {/* ── Header: name + email + plan chip ── */}
      <div style={{ padding: '0.714rem 0.857rem 0.643rem' }}>
        <div style={{ fontSize: '0.893rem', fontWeight: 700, color: 'var(--ink)', lineHeight: 1.3, fontFamily: 'var(--font-ui)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {fullName}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.429rem', marginTop: '0.143rem' }}>
          <span style={{ fontSize: '0.786rem', color: 'var(--ink3)', lineHeight: 1.3, fontFamily: 'var(--font-ui)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1, minWidth: 0 }}>
            {email}
          </span>
          <span
            style={{
              fontSize:      '0.607rem',
              fontWeight:    700,
              textTransform: 'uppercase',
              letterSpacing: '0.4px',
              color:         'var(--muted)',
              border:        '1px solid var(--borderD)',
              borderRadius:  999,
              padding:       '1px 0.357rem',
              lineHeight:    1.4,
              userSelect:    'none',
              flexShrink:    0,
              fontFamily:    'var(--font-ui)',
            }}
          >
            FREE
          </span>
        </div>
      </div>

      {/* ── Divider ── */}
      <Divider />

      {/* ── Account section ── */}
      <div style={{ padding: '0.286rem 0' }}>
        <MenuRow icon="settings" label="Preferencias" onClick={() => { onClose(); navigate('/preferences') }} />
        <MenuRow icon="bell" label="Novedades" onClick={onClose} />
      </div>

      {/* ── Divider ── */}
      <Divider />

      {/* ── Theme section ── */}
      <div style={{ padding: '0.286rem 0' }}>
        <SectionLabel>Tema</SectionLabel>
        {THEMES.map(({ id, label }) => (
          <ThemeRow
            key={id}
            label={label}
            active={theme === id}
            onClick={() => setTheme(id)}
          />
        ))}
      </div>

      {/* ── Divider ── */}
      <Divider />

      {/* ── Sign out ── */}
      <div style={{ padding: '0.286rem 0' }}>
        <MenuRow icon="log-out" label="Cerrar sesión" onClick={handleSignOut} />
      </div>
    </div>
  )
}

// ── ThemeRow ──────────────────────────────────────────────────────────────────

function ThemeRow({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  const [hovered, setHovered] = useState(false)

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.571rem',
        width: '100%',
        padding: '0.357rem 0.857rem',
        background: hovered ? 'var(--chrome)' : 'transparent',
        border: 'none',
        cursor: 'pointer',
        textAlign: 'left',
        fontFamily: 'var(--font-ui)',
      }}
    >
      {/* Active dot */}
      <span
        style={{
          width: '0.429rem',
          height: '0.429rem',
          borderRadius: '50%',
          background: active ? '#10b981' : 'transparent',
          border: active ? 'none' : '1.5px solid #d1d5db',
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontSize: '0.857rem',
          fontWeight: active ? 600 : 400,
          color: active ? 'var(--ink)' : 'var(--ink2)',
          lineHeight: 1,
        }}
      >
        {label}
      </span>
    </button>
  )
}

// ── MenuRow ───────────────────────────────────────────────────────────────────

function MenuRow({ label, icon, danger, onClick }: { label: string; icon: string; danger?: boolean; onClick: () => void }) {
  const [hovered, setHovered] = useState(false)
  const color = danger ? '#dc2626' : 'var(--ink2)'
  const bg = hovered ? (danger ? '#fef2f2' : 'var(--chrome)') : 'transparent'

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.571rem',
        width: '100%',
        padding: '0.357rem 0.857rem',
        background: bg,
        border: 'none',
        cursor: 'pointer',
        textAlign: 'left',
        fontFamily: 'var(--font-ui)',
        color,
      }}
    >
      <N2G name={icon} size={14} stroke={2} color={color} />
      <span style={{ fontSize: '0.857rem', fontWeight: 500, lineHeight: 1 }}>{label}</span>
    </button>
  )
}

// ── Divider ───────────────────────────────────────────────────────────────────

function Divider() {
  return (
    <div style={{ height: 1, background: 'var(--border)', margin: '0.143rem 0' }} />
  )
}

// ── SectionLabel ──────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        padding: '0.357rem 0.857rem 0.143rem',
        fontSize: '0.714rem',
        fontWeight: 700,
        letterSpacing: '0.6px',
        textTransform: 'uppercase',
        color: 'var(--muted)',
        lineHeight: 1,
        fontFamily: 'var(--font-ui)',
        userSelect: 'none',
      }}
    >
      {children}
    </div>
  )
}

// ── Theme SVG icons ───────────────────────────────────────────────────────────

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

// ── ThemeToggleButton ─────────────────────────────────────────────────────────

function ThemeToggleButton() {
  const theme = useThemeStore((s) => s.theme)
  const setTheme = useThemeStore((s) => s.setTheme)
  const [hovered, setHovered] = useState(false)

  const isDark = getEffectiveTheme(theme) === 'dark'
  const title = isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'
  const iconColor = hovered ? 'var(--accent)' : 'var(--ink3)'

  function toggle() {
    setTheme(isDark ? 'light' : 'dark')
  }

  return (
    <button
      type="button"
      title={title}
      onClick={toggle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '1.714rem',
        height: '1.714rem',
        background: hovered ? 'var(--chrome)' : 'transparent',
        border: '0px solid var(--border)',
        borderRadius: '20px',
        cursor: 'pointer',
        transition: 'background 120ms',
        flexShrink: 0,
      }}
    >
      {isDark
        ? <SunIcon color={iconColor} />
        : <MoonIcon color={iconColor} />
      }
    </button>
  )
}

// ── GuestLoginButton ──────────────────────────────────────────────────────────

function GuestLoginButton() {
  const navigate = useNavigate()
  const [hovered, setHovered] = useState(false)

  return (
    <button
      type="button"
      onClick={() => navigate('/login')}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.286rem',
        padding: '0.286rem 0.714rem',
        background: hovered ? 'var(--accentSoft)' : 'transparent',
        border: '1px solid var(--accentBorder)',
        borderRadius: 'var(--r-pill)',
        cursor: 'pointer',
        fontSize: '0.821rem',
        fontWeight: 700,
        color: 'var(--accentDeep)',
        fontFamily: 'var(--font-ui)',
        whiteSpace: 'nowrap',
        transition: 'background 120ms',
        lineHeight: 1,
      }}
    >
      Iniciar sesión →
    </button>
  )
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface TabBarProps {
  tabs: Tab[]
  activeTabId: string | null
  onSelectTab: (id: string) => void
  onCloseTab: (id: string) => void
  onNewTab: () => void
  isGuest?: boolean
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function TabBar({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onNewTab,
  isGuest = false,
}: TabBarProps) {
  const user = useAuthStore((s) => s.user)
  const [hoveredTabId, setHoveredTabId] = useState<string | null>(null)
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false)
  const [avatarImgError, setAvatarImgError] = useState(false)
  const rightZoneRef = useRef<HTMLDivElement>(null)

  const email = user?.email ?? null
  const initials = getInitials(email)
  const avatarUrl = (user?.user_metadata?.avatar_url ?? user?.user_metadata?.picture) as string | undefined
  const fullName = (user?.user_metadata?.full_name as string | undefined) ?? email?.split('@')[0] ?? 'Usuario'
  const firstName = fullName.split(' ')[0]

  // Close avatar menu on click outside — only relevant in auth mode
  useEffect(() => {
    if (isGuest) return
    if (!avatarMenuOpen) return
    function handleMouseDown(e: MouseEvent) {
      if (rightZoneRef.current && !rightZoneRef.current.contains(e.target as Node)) {
        setAvatarMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [isGuest, avatarMenuOpen])

  return (
    <div
      role="tablist"
      style={{
        display: 'flex',
        alignItems: 'stretch',
        height: '3rem',
        background: 'linear-gradient(to right, rgba(16,185,129,0.07), transparent), repeating-linear-gradient(45deg, rgba(0,0,0,0.04), rgba(0,0,0,0.04) 1px, transparent 1px, transparent 12px)',
        flexShrink: 0,
        fontFamily: 'var(--font-ui)',
        position: 'relative',
      }}
    >
      {/* ── Left zone: logo ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0,
          gap: '0.714rem',
          padding: '0 1rem 0 1rem',
        }}
      >
        <img src="/images/logo-drop-t.png" alt="notes.js" style={{ width: '1.857rem', height: 'auto', display: 'block', flexShrink: 0 }} />
        <span style={{ fontSize: '1.357rem', fontWeight: 800, letterSpacing: -0.5, color: 'var(--ink)', lineHeight: 1, whiteSpace: 'nowrap', userSelect: 'none' }}>
          notes<span style={{ color: '#10b981' }}>.js</span>
        </span>
      </div>

      {/* ── Center zone: scrollable tabs + new-tab button ── */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'flex-end',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex',
            overflowX: 'auto',
            scrollbarWidth: 'none',
            height: '2.143rem',
            flex: 1,
          }}
        >
          {tabs.map((tab, index) => {
            const isActive = tab.id === activeTabId
            const isHovered = hoveredTabId === tab.id
            const isLast = index === tabs.length - 1

            return (
              <div
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => onSelectTab(tab.id)}
                onMouseEnter={() => setHoveredTabId(tab.id)}
                onMouseLeave={() => setHoveredTabId(null)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.429rem',
                  padding: '0 0.714rem',
                  height: '2.143rem',
                  maxWidth: '14.286rem',
                  minWidth: '5.714rem',
                  cursor: 'pointer',
                  flexShrink: 0,
                  userSelect: 'none',
                  position: 'relative',
                  background: isActive ? 'var(--bg)' : 'var(--chromeDD)',
                  borderTop: '1px solid var(--borderD)',
                  borderLeft: '1px solid var(--borderD)',
                  borderRight: isLast ? '1px solid var(--borderD)' : 'none',
                  borderRadius: index === 0 && isLast ? '0.357rem 0.357rem 0 0'
                    : index === 0 ? '0.357rem 0 0 0'
                    : isLast    ? '0 0.357rem 0 0'
                    : 0,
                  marginLeft: index === 0 ? '0.857rem' : 0,
                  boxSizing: 'border-box',
                  opacity: isActive ? 1 : 0.7,
                }}
              >
                <FormatPill ext={tab.language} size="s" />

                <span
                  style={{
                    fontSize: '0.821rem',
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? 'var(--ink)' : 'var(--ink3)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    flex: 1,
                    minWidth: 0,
                    lineHeight: 1,
                  }}
                >
                  {tab.filename}
                </span>

                {tab.isDirty && !(isHovered || isActive) && (
                  <span
                    title="Cambios sin guardar"
                    style={{
                      width: '0.429rem',
                      height: '0.429rem',
                      borderRadius: '0.214rem',
                      background: '#f59e0b',
                      flexShrink: 0,
                      display: 'inline-block',
                    }}
                  />
                )}

                {(isHovered || isActive) && (
                  <button
                    aria-label={`Cerrar ${tab.filename}`}
                    title={`Cerrar ${tab.filename}`}
                    onClick={(e) => { e.stopPropagation(); onCloseTab(tab.id) }}
                    onMouseEnter={(e) => {
                      const btn = e.currentTarget as HTMLButtonElement
                      btn.style.background = '#fee2e2'
                      btn.style.color = '#dc2626'
                    }}
                    onMouseLeave={(e) => {
                      const btn = e.currentTarget as HTMLButtonElement
                      btn.style.background = 'none'
                      btn.style.color = '#9ca3af'
                    }}
                    style={{
                      width: '1rem',
                      height: '1rem',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#9ca3af',
                      padding: 0,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      lineHeight: 1,
                      fontSize: '0.714rem',
                    }}
                  >
                    <N2G name="x" size={12} stroke={2} />
                  </button>
                )}

                {isActive && (
                  <span
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: 2,
                      background: '#10b981',
                    }}
                  />
                )}
              </div>
            )
          })}

          {/* New-tab button */}
          <button
            aria-label="Nuevo documento"
            title="Nuevo documento (⌘T)"
            onClick={onNewTab}
            style={{
              width: '2.143rem',
              height: '2.143rem',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#9ca3af',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1rem',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#10b981' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#9ca3af' }}
          >
            <N2G name="plus" size={17} stroke={2} />
          </button>
        </div>
      </div>

      {/* ── Right zone: email + avatar + menu ── */}
      <div
        ref={rightZoneRef}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.571rem',
          flexShrink: 0,
          padding: '0 0.857rem',
          background: 'var(--bg)',
          borderLeft: isGuest ? 'none' : '1px solid var(--border)',
          position: 'relative',
        }}
      >
        {isGuest ? (
          <>
            <ThemeToggleButton />
            <GuestLoginButton />
          </>
        ) : (
          <>
            <span
              style={{
                fontSize: '0.821rem',
                color: 'var(--ink2)',
                whiteSpace: 'nowrap',
                userSelect: 'none',
              }}
            >
              Hola, <strong style={{ color: 'var(--ink)', fontWeight: 700 }}>{firstName}</strong>
            </span>

            {/* Avatar — clickable */}
            <button
              type="button"
              aria-label="Menú de cuenta"
              onClick={() => setAvatarMenuOpen((v) => !v)}
              style={{
                width: '1.714rem',
                height: '1.714rem',
                borderRadius: '50%',
                background: '#10b981',
                border: 'none',
                boxShadow: avatarMenuOpen ? '0 0 0 2px #10b981' : 'none',
                padding: 0,
                cursor: 'pointer',
                flexShrink: 0,
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'box-shadow 120ms',
              }}
            >
              {avatarUrl && !avatarImgError ? (
                <img
                  src={avatarUrl}
                  alt={email ?? 'Usuario'}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={() => setAvatarImgError(true)}
                />
              ) : (
                <span style={{ fontSize: '0.857rem', fontWeight: 500, color: 'white', userSelect: 'none', lineHeight: 1 }}>
                  {firstName[0]?.toUpperCase() ?? '?'}
                </span>
              )}
            </button>

            {/* Dropdown */}
            <AvatarMenu open={avatarMenuOpen} onClose={() => setAvatarMenuOpen(false)} />
          </>
        )}
      </div>
    </div>
  )
}
