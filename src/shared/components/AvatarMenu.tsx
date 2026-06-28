import { useState, useRef, useEffect } from 'react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/authStore'
import { useThemeStore } from '@/store/themeStore'
import { useI18nStore } from '@/store/i18nStore'
import { useAuth } from '@/features/auth/useAuth'
import { N2G } from '@/shared/components/N2G'
import type { Theme } from '@/shared/types'
import type { Lang } from '@/i18n/types'

// ── Primitives ────────────────────────────────────────────────────────────────

function Divider() {
  return <div style={{ height: 1, background: 'var(--border)', margin: '0.143rem 0' }} />
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        padding:       '0.357rem 0.857rem 0.143rem',
        fontSize:      '0.714rem',
        fontWeight:    700,
        letterSpacing: '0.6px',
        textTransform: 'uppercase',
        color:         'var(--muted)',
        lineHeight:    1,
        fontFamily:    'var(--font-ui)',
        userSelect:    'none',
      }}
    >
      {children}
    </div>
  )
}

function SelectRow({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  const [hovered, setHovered] = useState(false)
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
        background: hovered ? 'var(--chrome)' : 'transparent',
        border:     'none',
        cursor:     'pointer',
        textAlign:  'left',
        fontFamily: 'var(--font-ui)',
      }}
    >
      <span
        style={{
          width:        '0.429rem',
          height:       '0.429rem',
          borderRadius: '50%',
          background:   active ? 'var(--accent)' : 'transparent',
          border:       active ? 'none' : '1.5px solid var(--borderD)',
          flexShrink:   0,
        }}
      />
      <span style={{ fontSize: '0.857rem', fontWeight: active ? 600 : 400, color: active ? 'var(--ink)' : 'var(--ink2)', lineHeight: 1 }}>
        {label}
      </span>
    </button>
  )
}

function MenuRow({ label, icon, danger, disabled, onClick }: { label: string; icon: string; danger?: boolean; disabled?: boolean; onClick: () => void }) {
  const [hovered, setHovered] = useState(false)
  const color = danger ? 'var(--err)' : disabled ? 'var(--muted)' : 'var(--ink2)'
  const bg    = hovered && !disabled ? (danger ? '#fef2f2' : 'var(--chrome)') : 'transparent'

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => { if (!disabled) setHovered(true) }}
      onMouseLeave={() => setHovered(false)}
      style={{
        display:    'flex',
        alignItems: 'center',
        gap:        '0.571rem',
        width:      '100%',
        padding:    '0.357rem 0.857rem',
        background: bg,
        border:     'none',
        cursor:     disabled ? 'default' : 'pointer',
        textAlign:  'left',
        fontFamily: 'var(--font-ui)',
        color,
        opacity:    disabled ? 0.5 : 1,
      }}
    >
      <N2G name={icon} size={14} stroke={2} color={color} />
      <span style={{ fontSize: '0.857rem', fontWeight: 500, lineHeight: 1 }}>{label}</span>
    </button>
  )
}

// ── AvatarMenu ────────────────────────────────────────────────────────────────

interface AvatarMenuProps {
  open: boolean
  onClose: () => void
  /** Disable the Preferences nav item (e.g. when already on that page) */
  disablePreferences?: boolean
}

export function AvatarMenu({ open, onClose, disablePreferences }: AvatarMenuProps) {
  const user     = useAuthStore((s) => s.user)
  const theme    = useThemeStore((s) => s.theme)
  const setTheme = useThemeStore((s) => s.setTheme)
  const t        = useI18nStore((s) => s.t)
  const lang     = useI18nStore((s) => s.lang)
  const setLang  = useI18nStore((s) => s.setLang)
  const { signOut } = useAuth()
  const navigate = useNavigate()

  const email    = user?.email ?? null
  const fullName = (user?.user_metadata?.full_name as string | undefined) ?? email ?? 'Usuario'

  const THEMES: Array<{ id: Theme; label: string }> = [
    { id: 'dark',  label: t.avatar.temaOscuro },
    { id: 'light', label: t.avatar.temaClaro  },
    { id: 'auto',  label: t.avatar.temaAuto   },
  ]

  const LANGS: Array<{ id: Lang; label: string }> = [
    { id: 'es', label: t.lang.es },
    { id: 'en', label: t.lang.en },
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
        background:   'var(--bg)',
        borderTop:    '2px solid var(--accent)',
        borderRadius: '0.429rem 0 0.429rem 0.429rem',
        boxShadow:    'var(--sh-sheet)',
        zIndex:       200,
        overflow:     'hidden',
        userSelect:   'none',
      }}
    >
      <div style={{ padding: '0.714rem 0.857rem 0.643rem' }}>
        <div style={{ fontSize: '0.893rem', fontWeight: 700, color: 'var(--ink)', lineHeight: 1.3, fontFamily: 'var(--font-ui)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {fullName}
        </div>
        <div style={{ fontSize: '0.786rem', color: 'var(--ink3)', lineHeight: 1.3, fontFamily: 'var(--font-ui)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '0.143rem' }}>
          {email}
        </div>
      </div>

      <Divider />

      <div style={{ padding: '0.286rem 0' }}>
        <MenuRow icon="settings" label={t.avatar.preferencias} disabled={disablePreferences} onClick={() => { onClose(); navigate('/preferences') }} />
        <MenuRow icon="bell"     label={t.avatar.novedades}    onClick={onClose} />
      </div>

      <Divider />

      <div style={{ padding: '0.286rem 0' }}>
        <SectionLabel>{t.avatar.secTema}</SectionLabel>
        {THEMES.map(({ id, label }) => (
          <SelectRow key={id} label={label} active={theme === id} onClick={() => setTheme(id)} />
        ))}
      </div>

      <Divider />

      <div style={{ padding: '0.286rem 0' }}>
        <SectionLabel>{t.avatar.secIdioma}</SectionLabel>
        {LANGS.map(({ id, label }) => (
          <SelectRow key={id} label={label} active={lang === id} onClick={() => setLang(id)} />
        ))}
      </div>

      <Divider />

      <div style={{ padding: '0.286rem 0' }}>
        <MenuRow icon="log-out" label={t.avatar.cerrarSesion} danger onClick={handleSignOut} />
      </div>
    </div>
  )
}

// ── AvatarButton — clickable circle + dropdown ────────────────────────────────

interface AvatarButtonProps {
  avatarUrl?: string
  firstName: string
  email: string
  disablePreferences?: boolean
  /** Optional greeting text rendered to the left of the avatar circle inside the button. */
  greeting?: string
}

export function AvatarButton({ avatarUrl, firstName, email, disablePreferences, greeting }: AvatarButtonProps) {
  const [open, setOpen]         = useState(false)
  const [imgError, setImgError] = useState(false)
  const wrapperRef              = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleMouseDown(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [open])

  return (
    <div ref={wrapperRef} style={{ position: 'relative', flexShrink: 0, height: '100%', display: 'flex', alignItems: 'center' }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          display:        'inline-flex',
          alignItems:     'center',
          gap:            '0.5rem',
          height:         '100%',
          padding:        greeting ? '0 0.571rem' : '0',
          background:     open ? 'var(--chrome)' : 'transparent',
          border:         'none',
          cursor:         'pointer',
          transition:     'background 120ms',
          flexShrink:     0,
        }}
      >
        {greeting && (
          <span style={{ fontSize: '0.821rem', color: 'var(--ink2)', whiteSpace: 'nowrap', userSelect: 'none', lineHeight: 1 }}>
            {greeting}
          </span>
        )}
        <div
          style={{
            width:          '1.714rem',
            height:         '1.714rem',
            borderRadius:   '50%',
            background:     '#10b981',
            boxShadow:      open ? '0 0 0 2px #10b981' : 'none',
            overflow:       'hidden',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            transition:     'box-shadow 120ms',
            flexShrink:     0,
          }}
        >
          {avatarUrl && !imgError ? (
            <img src={avatarUrl} alt={email} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={() => setImgError(true)} />
          ) : (
            <span style={{ fontSize: '0.857rem', fontWeight: 500, color: 'white', userSelect: 'none', lineHeight: 1 }}>
              {firstName[0]?.toUpperCase() ?? '?'}
            </span>
          )}
        </div>
      </button>
      <AvatarMenu open={open} onClose={() => setOpen(false)} disablePreferences={disablePreferences} />
    </div>
  )
}
