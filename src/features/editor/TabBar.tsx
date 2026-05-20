// TabBar — V3 redesign
// Design reference: design/design_handoff_notesjs_v3/README.md § "V3TabBar"

import { useState, useRef, useEffect } from 'react'
import type { ReactNode } from 'react'
import { useAuthStore } from '@/features/auth/authStore'
import { useThemeStore } from '@/store/themeStore'
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
  const user        = useAuthStore((s) => s.user)
  const theme       = useThemeStore((s) => s.theme)
  const setTheme    = useThemeStore((s) => s.setTheme)
  const { signOut } = useAuth()

  const email     = user?.email ?? null
  const fullName  = (user?.user_metadata?.full_name as string | undefined) ?? email ?? 'Usuario'
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined
  const initials  = getInitials(email)

  const THEMES: Array<{ id: Theme; label: string }> = [
    { id: 'dark',  label: 'Oscuro' },
    { id: 'light', label: 'Claro'  },
    { id: 'auto',  label: 'Auto'   },
  ]

  async function handleSignOut() {
    onClose()
    try { await signOut() } catch { /* ignore */ }
  }

  if (!open) return null

  return (
    <div
      style={{
        position:     'absolute',
        top:          '100%',
        right:        0,
        width:        '15rem',
        background:   '#ffffff',
        borderTop:    '2px solid #10b981',
        borderRadius: '0.429rem 0 0.429rem 0.429rem',
        boxShadow:    '0 10px 24px -8px rgba(15,23,42,0.22), 0 2px 4px rgba(15,23,42,0.05)',
        zIndex:       200,
        overflow:     'hidden',
        userSelect:   'none',
      }}
    >
      {/* ── Header: name + email ── */}
      <div style={{ padding: '0.714rem 0.857rem 0.643rem' }}>
        <div style={{ fontSize: '0.893rem', fontWeight: 700, color: '#111827', lineHeight: 1.3, fontFamily: 'var(--font-ui)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {fullName}
        </div>
        <div style={{ fontSize: '0.786rem', color: '#6b7280', lineHeight: 1.3, fontFamily: 'var(--font-ui)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {email}
        </div>
      </div>

      {/* ── Divider ── */}
      <Divider />

      {/* ── Account section ── */}
      <div style={{ padding: '0.286rem 0' }}>
        <MenuRow icon="settings" label="Preferencias"  onClick={onClose} />
        <MenuRow icon="bell"     label="Novedades"      onClick={onClose} />
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
        display:     'flex',
        alignItems:  'center',
        gap:         '0.571rem',
        width:       '100%',
        padding:     '0.357rem 0.857rem',
        background:  hovered ? '#f7f7f9' : 'transparent',
        border:      'none',
        cursor:      'pointer',
        textAlign:   'left',
        fontFamily:  'var(--font-ui)',
      }}
    >
      {/* Active dot */}
      <span
        style={{
          width:        '0.429rem',
          height:       '0.429rem',
          borderRadius: '50%',
          background:   active ? '#10b981' : 'transparent',
          border:       active ? 'none' : '1.5px solid #d1d5db',
          flexShrink:   0,
        }}
      />
      <span
        style={{
          fontSize:   '0.857rem',
          fontWeight: active ? 600 : 400,
          color:      active ? '#111827' : '#374151',
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
  const color = danger ? '#dc2626' : '#374151'
  const bg    = hovered ? (danger ? '#fef2f2' : '#f7f7f9') : 'transparent'

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display:    'flex',
        alignItems: 'center',
        gap:        '0.571rem',
        width:      '100%',
        padding:    '0.357rem 0.857rem',
        background: bg,
        border:     'none',
        cursor:     'pointer',
        textAlign:  'left',
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
    <div style={{ height: 1, background: '#e5e7eb', margin: '0.143rem 0' }} />
  )
}

// ── SectionLabel ──────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        padding:       '0.357rem 0.857rem 0.143rem',
        fontSize:      '0.714rem',
        fontWeight:    700,
        letterSpacing: '0.6px',
        textTransform: 'uppercase',
        color:         '#9ca3af',
        lineHeight:    1,
        fontFamily:    'var(--font-ui)',
        userSelect:    'none',
      }}
    >
      {children}
    </div>
  )
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface TabBarProps {
  tabs: Tab[]
  activeTabId: string | null
  onSelectTab: (id: string) => void
  onCloseTab: (id: string) => void
  onNewTab: () => void
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function TabBar({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onNewTab,
}: TabBarProps) {
  const user  = useAuthStore((s) => s.user)
  const [hoveredTabId,   setHoveredTabId]   = useState<string | null>(null)
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false)
  const rightZoneRef = useRef<HTMLDivElement>(null)

  const email    = user?.email ?? null
  const initials = getInitials(email)
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined

  // Close on click outside
  useEffect(() => {
    if (!avatarMenuOpen) return
    function handleMouseDown(e: MouseEvent) {
      if (rightZoneRef.current && !rightZoneRef.current.contains(e.target as Node)) {
        setAvatarMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [avatarMenuOpen])

  return (
    <div
      role="tablist"
      style={{
        display:    'flex',
        alignItems: 'center',
        height:     '2.143rem',
        background: '#eef0f3',
        flexShrink: 0,
        fontFamily: 'var(--font-ui)',
        position:   'relative',
      }}
    >
      {/* ── Left zone: logo + plan chip ── */}
      <div
        style={{
          display:     'flex',
          alignItems:  'center',
          gap:         '0.571rem',
          flexShrink:  0,
          padding:     '0 0.857rem',
          height:      '2.143rem',
          background:  '#ffffff',
          borderRight: '1px solid #e5e7eb',
        }}
      >
        {/* App name */}
        <span style={{ fontSize: '1.143rem', fontWeight: 800, letterSpacing: -0.4, color: '#111827', lineHeight: 1, whiteSpace: 'nowrap', userSelect: 'none' }}>
          notes<span style={{ color: '#10b981' }}>.js</span>
        </span>

        {/* FREE plan chip */}
        <span
          style={{
            fontSize:      '0.714rem',
            fontWeight:    700,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            color:         '#6b7280',
            background:    'transparent',
            border:        '1px solid #d1d5db',
            borderRadius:  999,
            padding:       '1px 0.429rem',
            lineHeight:    1,
            userSelect:    'none',
            marginLeft:    '0.286rem',
          }}
        >
          FREE
        </span>
      </div>

      {/* ── Center zone: scrollable tabs + new-tab button ── */}
      <div
        style={{
          flex:     1,
          display:  'flex',
          height:   '2.143rem',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display:       'flex',
            overflowX:     'auto',
            scrollbarWidth:'none',
            height:        '2.143rem',
            flex:          1,
          }}
        >
          {tabs.map((tab) => {
            const isActive  = tab.id === activeTabId
            const isHovered = hoveredTabId === tab.id

            return (
              <div
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => onSelectTab(tab.id)}
                onMouseEnter={() => setHoveredTabId(tab.id)}
                onMouseLeave={() => setHoveredTabId(null)}
                style={{
                  display:    'flex',
                  alignItems: 'center',
                  gap:        '0.429rem',
                  padding:    '0 0.714rem',
                  height:     '2.143rem',
                  maxWidth:   '14.286rem',
                  minWidth:   '5.714rem',
                  cursor:     'pointer',
                  flexShrink: 0,
                  userSelect: 'none',
                  position:   'relative',
                  background: isActive ? '#ffffff' : 'transparent',
                  borderRight:'1px solid #e5e7eb',
                  boxSizing:  'border-box',
                }}
              >
                <FormatPill ext={getExt(tab.filename)} size="s" />

                <span
                  style={{
                    fontSize:     '0.821rem',
                    fontWeight:   isActive ? 600 : 400,
                    color:        isActive ? '#111827' : '#374151',
                    overflow:     'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace:   'nowrap',
                    flex:         1,
                    minWidth:     0,
                    lineHeight:   1,
                  }}
                >
                  {tab.filename}
                </span>

                {tab.isDirty && !(isHovered || isActive) && (
                  <span
                    title="Cambios sin guardar"
                    style={{
                      width:        '0.429rem',
                      height:       '0.429rem',
                      borderRadius: '0.214rem',
                      background:   '#f59e0b',
                      flexShrink:   0,
                      display:      'inline-block',
                    }}
                  />
                )}

                {(isHovered || isActive) && (
                  <button
                    aria-label={`Cerrar ${tab.filename}`}
                    title={`Cerrar ${tab.filename}`}
                    onClick={(e) => { e.stopPropagation(); onCloseTab(tab.id) }}
                    style={{
                      width:      '1rem',
                      height:     '1rem',
                      background: 'none',
                      border:     'none',
                      cursor:     'pointer',
                      color:      '#9ca3af',
                      padding:    0,
                      borderRadius: 2,
                      display:    'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      lineHeight: 1,
                      fontSize:   '0.714rem',
                    }}
                  >
                    <N2G name="x" size={12} stroke={2} />
                  </button>
                )}

                {isActive && (
                  <span
                    style={{
                      position:   'absolute',
                      bottom:     0,
                      left:       0,
                      right:      0,
                      height:     2,
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
              width:      '2.143rem',
              height:     '2.143rem',
              background: 'transparent',
              border:     'none',
              cursor:     'pointer',
              color:      '#9ca3af',
              flexShrink: 0,
              display:    'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize:   '1rem',
            }}
            onMouseEnter={(e) => {
              ;(e.currentTarget as HTMLButtonElement).style.background = '#e5e7eb'
              ;(e.currentTarget as HTMLButtonElement).style.color = '#374151'
            }}
            onMouseLeave={(e) => {
              ;(e.currentTarget as HTMLButtonElement).style.background = 'transparent'
              ;(e.currentTarget as HTMLButtonElement).style.color = '#9ca3af'
            }}
          >
            <N2G name="plus" size={17} stroke={2} />
          </button>
        </div>
      </div>

      {/* ── Right zone: email + avatar + menu ── */}
      <div
        ref={rightZoneRef}
        style={{
          display:    'flex',
          alignItems: 'center',
          gap:        '0.571rem',
          flexShrink: 0,
          padding:    '0 0.857rem',
          height:     '2.143rem',
          background: '#ffffff',
          borderLeft: '1px solid #e5e7eb',
          position:   'relative',
        }}
      >
        {email && (
          <span
            style={{
              fontSize:   '0.821rem',
              color:      '#6b7280',
              whiteSpace: 'nowrap',
              userSelect: 'none',
            }}
          >
            {email}
          </span>
        )}

        {/* Avatar — clickable */}
        <button
          type="button"
          aria-label="Menú de cuenta"
          onClick={() => setAvatarMenuOpen((v) => !v)}
          style={{
            width:        '1.429rem',
            height:       '1.429rem',
            borderRadius: '0.714rem',
            background:   'linear-gradient(135deg, #10b981, #047857)',
            border:       avatarMenuOpen ? '2px solid #10b981' : '2px solid transparent',
            padding:      0,
            cursor:       'pointer',
            flexShrink:   0,
            overflow:     'hidden',
            display:      'flex',
            alignItems:   'center',
            justifyContent: 'center',
            transition:   'border-color 120ms',
          }}
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt={email ?? 'Usuario'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span
              style={{
                fontSize:   '0.643rem',
                fontWeight: 700,
                color:      'white',
                userSelect: 'none',
                lineHeight: 1,
              }}
            >
              {initials}
            </span>
          )}
        </button>

        {/* Dropdown */}
        <AvatarMenu open={avatarMenuOpen} onClose={() => setAvatarMenuOpen(false)} />
      </div>
    </div>
  )
}
