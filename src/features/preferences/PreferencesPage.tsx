// PreferencesPage — user settings screen

import { useState, useRef, useEffect } from 'react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import type { UserIdentity } from '@supabase/supabase-js'
import { useAuthStore } from '@/features/auth/authStore'
import { useThemeStore } from '@/store/themeStore'
import { useAuth } from '@/features/auth/useAuth'
import { N2G } from '@/shared/components/N2G'
import { supabase } from '@/lib/supabase'
import type { Theme } from '@/shared/types'

// ── Types ─────────────────────────────────────────────────────────────────────

type Section = 'cuenta' | 'editor'

// ── Helpers ───────────────────────────────────────────────────────────────────

function getInitials(email: string | null | undefined): string {
  if (!email) return '?'
  const [local] = email.split('@')
  const parts = local.split(/[._\-+]/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return local.slice(0, 2).toUpperCase()
}

// ── Google colored SVG icon ───────────────────────────────────────────────────

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
      <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
    </svg>
  )
}

// ── EmailProviderIcon ─────────────────────────────────────────────────────────

function EmailProviderIcon() {
  return (
    <span
      style={{
        width:          18,
        height:         18,
        borderRadius:   '50%',
        background:     '#6b7280',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        flexShrink:     0,
      }}
    >
      <N2G name="chev-right" size={11} stroke={2.5} color="#fff" />
    </span>
  )
}

// ── AvatarMenu (full — same structure as TabBar, Preferencias disabled) ───────

interface AvatarMenuDropdownProps {
  open: boolean
  onClose: () => void
  email: string
  fullName: string
  avatarUrl?: string
}

function AvatarMenuDropdown({ open, onClose, email, fullName }: AvatarMenuDropdownProps) {
  const theme    = useThemeStore((s) => s.theme)
  const setTheme = useThemeStore((s) => s.setTheme)
  const { signOut } = useAuth()

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
      {/* Header */}
      <div style={{ padding: '0.714rem 0.857rem 0.643rem' }}>
        <div style={{ fontSize: '0.893rem', fontWeight: 700, color: '#111827', lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {fullName}
        </div>
        <div style={{ fontSize: '0.786rem', color: '#6b7280', lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {email}
        </div>
      </div>

      <MenuDivider />

      {/* Preferencias + Novedades */}
      <div style={{ padding: '0.286rem 0' }}>
        <MenuRowItem icon="settings" label="Preferencias" disabled onClick={() => { /* already here */ }} />
        <MenuRowItem icon="bell"     label="Novedades"    onClick={onClose} />
      </div>

      <MenuDivider />

      {/* Tema */}
      <div style={{ padding: '0.286rem 0' }}>
        <MenuSectionLabel>Tema</MenuSectionLabel>
        {THEMES.map(({ id, label }) => (
          <ThemeRowItem
            key={id}
            label={label}
            active={theme === id}
            onClick={() => setTheme(id)}
          />
        ))}
      </div>

      <MenuDivider />

      {/* Cerrar sesión */}
      <div style={{ padding: '0.286rem 0' }}>
        <MenuRowItem icon="log-out" label="Cerrar sesión" onClick={handleSignOut} />
      </div>
    </div>
  )
}

// ── Shared menu sub-components ────────────────────────────────────────────────

function MenuDivider() {
  return <div style={{ height: 1, background: '#e5e7eb', margin: '0.143rem 0' }} />
}

function MenuSectionLabel({ children }: { children: ReactNode }) {
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

function MenuRowItem({
  label, icon, disabled, onClick,
}: {
  label: string; icon: string; disabled?: boolean; onClick: () => void
}) {
  const [hovered, setHovered] = useState(false)
  const color = disabled ? '#9ca3af' : '#374151'

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => { if (!disabled) setHovered(true)  }}
      onMouseLeave={() => setHovered(false)}
      style={{
        display:    'flex',
        alignItems: 'center',
        gap:        '0.571rem',
        width:      '100%',
        padding:    '0.357rem 0.857rem',
        background: hovered ? '#f7f7f9' : 'transparent',
        border:     'none',
        cursor:     disabled ? 'default' : 'pointer',
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

function ThemeRowItem({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
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
        background: hovered ? '#f7f7f9' : 'transparent',
        border:     'none',
        cursor:     'pointer',
        fontFamily: 'var(--font-ui)',
      }}
    >
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
      <span style={{ fontSize: '0.857rem', fontWeight: active ? 600 : 400, color: active ? '#111827' : '#374151', lineHeight: 1 }}>
        {label}
      </span>
    </button>
  )
}

// ── TopBar ────────────────────────────────────────────────────────────────────

function TopBar({ email, avatarUrl, fullName }: { email: string; avatarUrl?: string; fullName: string }) {
  const initials = getInitials(email)
  const [menuOpen, setMenuOpen] = useState(false)
  const rightRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    function handleMouseDown(e: MouseEvent) {
      if (rightRef.current && !rightRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [menuOpen])

  return (
    <div
      style={{
        display:      'flex',
        alignItems:   'center',
        height:       '2.143rem',
        background:   '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        flexShrink:   0,
        fontFamily:   'var(--font-ui)',
        userSelect:   'none',
      }}
    >
      {/* Brand */}
      <div
        style={{
          display:     'flex',
          alignItems:  'center',
          gap:         '0.571rem',
          padding:     '0 0.857rem',
          height:      '100%',
          borderRight: '1px solid #e5e7eb',
          flexShrink:  0,
        }}
      >
        <span style={{ fontSize: '1.143rem', fontWeight: 800, letterSpacing: -0.4, color: '#111827', lineHeight: 1 }}>
          notes<span style={{ color: '#10b981' }}>.js</span>
        </span>
        <span
          style={{
            fontSize:      '0.714rem',
            fontWeight:    700,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            color:         '#6b7280',
            border:        '1px solid #d1d5db',
            borderRadius:  999,
            padding:       '1px 0.429rem',
            lineHeight:    1,
          }}
        >
          FREE
        </span>
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Right: email + avatar */}
      <div
        ref={rightRef}
        style={{
          display:    'flex',
          alignItems: 'center',
          gap:        '0.571rem',
          padding:    '0 0.857rem',
          height:     '100%',
          borderLeft: '1px solid #e5e7eb',
          flexShrink: 0,
          position:   'relative',
        }}
      >
        {email && (
          <span style={{ fontSize: '0.821rem', color: '#6b7280', whiteSpace: 'nowrap' }}>
            {email}
          </span>
        )}
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          style={{
            width:        '1.429rem',
            height:       '1.429rem',
            borderRadius: '50%',
            background:   'linear-gradient(135deg, #10b981, #047857)',
            border:       menuOpen ? '2px solid #10b981' : '2px solid transparent',
            padding:      0,
            cursor:       'pointer',
            overflow:     'hidden',
            display:      'flex',
            alignItems:   'center',
            justifyContent: 'center',
            transition:   'border-color 120ms',
          }}
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt={email} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontSize: '0.643rem', fontWeight: 700, color: 'white', lineHeight: 1 }}>
              {initials}
            </span>
          )}
        </button>

        <AvatarMenuDropdown
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          email={email}
          fullName={fullName}
          avatarUrl={avatarUrl}
        />
      </div>
    </div>
  )
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

interface SidebarProps {
  activeSection: Section
  onSectionChange: (s: Section) => void
  onBack: () => void
}

function Sidebar({ activeSection, onSectionChange, onBack }: SidebarProps) {
  const NAV: Array<{ id: Section; label: string; icon: string }> = [
    { id: 'cuenta', label: 'Cuenta', icon: 'eye' },
    { id: 'editor', label: 'Editor', icon: 'type' },
  ]

  return (
    <aside
      style={{
        width:         '16.429rem',
        flexShrink:    0,
        background:    '#ffffff',
        borderRight:   '1px solid #e5e7eb',
        display:       'flex',
        flexDirection: 'column',
        padding:       '0.857rem 0',
        fontFamily:    'var(--font-ui)',
      }}
    >
      {/* Back link */}
      <button
        type="button"
        onClick={onBack}
        style={{
          display:      'flex',
          alignItems:   'center',
          gap:          '0.429rem',
          padding:      '0.429rem 1rem',
          background:   'transparent',
          border:       'none',
          cursor:       'pointer',
          fontSize:     '0.893rem',
          color:        '#6b7280',
          fontFamily:   'var(--font-ui)',
          marginBottom: '0.857rem',
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#374151' }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#6b7280' }}
      >
        <span style={{ display: 'flex', transform: 'rotate(180deg)' }}>
          <N2G name="chev-right" size={13} stroke={2.5} color="currentColor" />
        </span>
        Volver al editor
      </button>

      {/* Section label */}
      <span
        style={{
          display:       'block',
          padding:       '0 1rem 0.429rem',
          fontSize:      '0.714rem',
          fontWeight:    700,
          letterSpacing: '0.8px',
          textTransform: 'uppercase',
          color:         '#9ca3af',
          lineHeight:    1,
        }}
      >
        Ajustes
      </span>

      {/* Nav items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '0 0.571rem' }}>
        {NAV.map(({ id, label, icon }) => {
          const active = activeSection === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSectionChange(id)}
              style={{
                display:      'flex',
                alignItems:   'center',
                gap:          '0.571rem',
                padding:      '0.429rem 0.571rem',
                background:   active ? '#ecfdf5' : 'transparent',
                border:       'none',
                borderRadius: '0.357rem',
                cursor:       'pointer',
                fontFamily:   'var(--font-ui)',
                fontSize:     '0.893rem',
                fontWeight:   active ? 600 : 400,
                color:        active ? '#065f46' : '#374151',
                textAlign:    'left',
              }}
              onMouseEnter={(e) => {
                if (!active) (e.currentTarget as HTMLButtonElement).style.background = '#f7f7f9'
              }}
              onMouseLeave={(e) => {
                if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
              }}
            >
              <N2G name={icon} size={15} stroke={1.8} color={active ? '#10b981' : '#9ca3af'} />
              {label}
            </button>
          )
        })}
      </div>
    </aside>
  )
}

// ── Form primitives ───────────────────────────────────────────────────────────

function FormRow({ label, sub, children }: { label: string; sub?: string; children: ReactNode }) {
  return (
    <div
      style={{
        display:             'grid',
        gridTemplateColumns: '12rem 1fr',
        alignItems:          'start',
        padding:             '1rem 1.143rem',
        gap:                 '1rem',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.214rem', paddingTop: '0.429rem' }}>
        <span style={{ fontSize: '0.893rem', fontWeight: 600, color: '#111827', lineHeight: 1.3 }}>
          {label}
        </span>
        {sub && (
          <span style={{ fontSize: '0.786rem', color: '#6b7280', lineHeight: 1.4 }}>
            {sub}
          </span>
        )}
      </div>
      <div>{children}</div>
    </div>
  )
}

function RowDivider() {
  return <div style={{ height: 1, background: '#e5e7eb', margin: '0 1.143rem' }} />
}

function Input({
  value, onChange, disabled, readOnly, suffix,
}: {
  value: string; onChange?: (v: string) => void
  disabled?: boolean; readOnly?: boolean; suffix?: ReactNode
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
      <input
        type="text"
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        disabled={disabled}
        readOnly={readOnly}
        style={{
          width:        '100%',
          padding:      '0.429rem 0.714rem',
          paddingRight: suffix ? '7rem' : '0.714rem',
          fontSize:     '0.893rem',
          fontFamily:   'var(--font-ui)',
          color:        '#111827',
          background:   disabled || readOnly ? '#f9fafb' : '#ffffff',
          border:       '1px solid #e5e7eb',
          borderRadius: '0.357rem',
          outline:      'none',
          boxSizing:    'border-box',
        }}
        onFocus={(e) => { if (!readOnly && !disabled) e.currentTarget.style.borderColor = '#10b981' }}
        onBlur={(e) => { e.currentTarget.style.borderColor = '#e5e7eb' }}
      />
      {suffix && (
        <div style={{ position: 'absolute', right: '0.571rem' }}>
          {suffix}
        </div>
      )}
    </div>
  )
}

// ── PageHeading ───────────────────────────────────────────────────────────────

function PageHeading({ section }: { section: string }) {
  return (
    <h1
      style={{
        display:    'flex',
        alignItems: 'baseline',
        gap:        '0.429rem',
        fontSize:   '1.5rem',
        fontWeight: 800,
        color:      '#111827',
        margin:     '0 0 0.286rem',
        lineHeight: 1.2,
        fontFamily: 'var(--font-ui)',
      }}
    >
      <span style={{ color: '#9ca3af', fontWeight: 600 }}>Preferencias</span>
      <span style={{ color: '#d1d5db', fontWeight: 400, fontSize: '1.25rem' }}>›</span>
      <span>{section}</span>
    </h1>
  )
}

// ── Connected account row ─────────────────────────────────────────────────────

function IdentityRow({ identity }: { identity: UserIdentity }) {
  const isGoogle = identity.provider === 'google'
  const name     = (identity.identity_data?.full_name as string | undefined) ?? ''
  const email    = (identity.identity_data?.email    as string | undefined) ?? ''
  const sub      = [name, email].filter(Boolean).join(' · ')

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.857rem', padding: '0.857rem 1.143rem' }}>
      <div style={{ flexShrink: 0 }}>
        {isGoogle ? <GoogleIcon /> : <EmailProviderIcon />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.893rem', fontWeight: 600, color: '#111827', lineHeight: 1.3 }}>
          {isGoogle ? 'Google' : 'Email'}
        </div>
        {sub && (
          <div style={{ fontSize: '0.786rem', color: '#6b7280', lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {sub}
          </div>
        )}
      </div>
      <button
        type="button"
        style={{
          width:          '1.714rem',
          height:         '1.714rem',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          background:     'transparent',
          border:         '1px solid #e5e7eb',
          borderRadius:   '0.286rem',
          cursor:         'pointer',
          flexShrink:     0,
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#f7f7f9' }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
      >
        <N2G name="rename" size={13} stroke={1.8} color="#6b7280" />
      </button>
    </div>
  )
}

// ── Cuenta section ────────────────────────────────────────────────────────────

interface CuentaProps {
  firstName: string; setFirstName: (v: string) => void
  lastName:  string; setLastName:  (v: string) => void
  email: string
  username:  string; setUsername:  (v: string) => void
  saving: boolean; onSave: () => void
  identities: UserIdentity[]
}

function CuentaSection({
  firstName, setFirstName, lastName, setLastName,
  email, username, setUsername, saving, onSave, identities,
}: CuentaProps) {
  return (
    <div style={{ maxWidth: '50rem' }}>
      <PageHeading section="Cuenta" />
      <p style={{ fontSize: '0.893rem', color: '#6b7280', margin: '0 0 1.714rem', lineHeight: 1.5 }}>
        Gestiona tu perfil, los proveedores conectados y cómo se ve notes.js para ti.
      </p>

      <h2 style={{ fontSize: '1.071rem', fontWeight: 700, color: '#111827', margin: '0 0 0.357rem', lineHeight: 1.3 }}>
        Información del perfil
      </h2>
      <p style={{ fontSize: '0.821rem', color: '#6b7280', margin: '0 0 0.857rem', lineHeight: 1.5 }}>
        Esto es lo que verán otros usuarios cuando compartas notas con ellos.
      </p>

      <div
        style={{
          background:   '#ffffff',
          border:       '1px solid #e5e7eb',
          borderRadius: '0.571rem',
          overflow:     'hidden',
          marginBottom: '2rem',
        }}
      >
        <FormRow label="Nombre">
          <Input value={firstName} onChange={setFirstName} />
        </FormRow>
        <RowDivider />
        <FormRow label="Apellidos">
          <Input value={lastName} onChange={setLastName} />
        </FormRow>
        <RowDivider />
        <FormRow label="Email principal" sub="Lo usamos para notificaciones y recuperación de cuenta.">
          <Input
            value={email}
            readOnly
            suffix={
              <span
                style={{
                  fontSize:      '0.714rem',
                  fontWeight:    700,
                  letterSpacing: '0.6px',
                  textTransform: 'uppercase',
                  color:         '#10b981',
                  border:        '1px solid #10b981',
                  borderRadius:  '0.286rem',
                  padding:       '2px 0.429rem',
                  lineHeight:    1,
                  whiteSpace:    'nowrap',
                }}
              >
                Verificado
              </span>
            }
          />
        </FormRow>
        <RowDivider />
        <FormRow
          label="Nombre de usuario"
          sub={`Aparece en URLs de notas públicas: notes.js/u/${username || '…'}`}
        >
          <Input value={username} onChange={setUsername} />
        </FormRow>

        <div
          style={{
            display:        'flex',
            justifyContent: 'flex-end',
            padding:        '0.857rem 1.143rem',
            borderTop:      '1px solid #e5e7eb',
          }}
        >
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            style={{
              padding:      '0.429rem 1.143rem',
              fontSize:     '0.893rem',
              fontWeight:   600,
              fontFamily:   'var(--font-ui)',
              color:        '#ffffff',
              background:   saving ? '#6ee7b7' : '#10b981',
              border:       'none',
              borderRadius: '0.357rem',
              cursor:       saving ? 'default' : 'pointer',
              transition:   'background 120ms',
            }}
            onMouseEnter={(e) => { if (!saving) (e.currentTarget as HTMLButtonElement).style.background = '#059669' }}
            onMouseLeave={(e) => { if (!saving) (e.currentTarget as HTMLButtonElement).style.background = '#10b981' }}
          >
            {saving ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </div>

      <h2 style={{ fontSize: '1.071rem', fontWeight: 700, color: '#111827', margin: '0 0 0.357rem', lineHeight: 1.3 }}>
        Cuentas conectadas
      </h2>
      <p style={{ fontSize: '0.821rem', color: '#6b7280', margin: '0 0 0.857rem', lineHeight: 1.5 }}>
        Proveedores con los que puedes iniciar sesión. Puedes vincular más en cualquier momento.
      </p>

      <div
        style={{
          background:   '#ffffff',
          border:       '1px solid #e5e7eb',
          borderRadius: '0.571rem',
          overflow:     'hidden',
        }}
      >
        {identities.length === 0 ? (
          <div style={{ padding: '1.143rem', fontSize: '0.893rem', color: '#9ca3af' }}>
            No hay cuentas conectadas.
          </div>
        ) : (
          identities.map((identity, i) => (
            <div key={identity.id ?? i}>
              {i > 0 && <RowDivider />}
              <IdentityRow identity={identity} />
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// ── Editor section ────────────────────────────────────────────────────────────

function EditorSection() {
  return (
    <div style={{ maxWidth: '50rem' }}>
      <PageHeading section="Editor" />
      <p style={{ fontSize: '0.893rem', color: '#6b7280', margin: '0 0 1.714rem', lineHeight: 1.5 }}>
        Configuración del editor de código.
      </p>
      <div
        style={{
          background:   '#ffffff',
          border:       '1px solid #e5e7eb',
          borderRadius: '0.571rem',
          padding:      '2rem',
          textAlign:    'center',
          color:        '#9ca3af',
          fontSize:     '0.893rem',
        }}
      >
        Próximamente
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PreferencesPage() {
  const user     = useAuthStore((s) => s.user)
  const navigate = useNavigate()

  const [section, setSection] = useState<Section>('cuenta')
  const [saving, setSaving]   = useState(false)

  const email     = user?.email ?? ''
  const fullName  = (user?.user_metadata?.full_name as string | undefined) ?? ''
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined
  const identities: UserIdentity[] = user?.identities ?? []

  const nameParts = fullName.trim().split(/\s+/)
  const [firstName, setFirstName] = useState(nameParts[0] ?? '')
  const [lastName,  setLastName]  = useState(nameParts.slice(1).join(' '))
  const [username,  setUsername]  = useState(
    (user?.user_metadata?.username as string | undefined) ?? email.split('@')[0] ?? '',
  )

  async function handleSave() {
    setSaving(true)
    try {
      await supabase.auth.updateUser({
        data: { full_name: `${firstName} ${lastName}`.trim(), username },
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'var(--font-ui)' }}>
      <TopBar email={email} avatarUrl={avatarUrl} fullName={fullName} />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar
          activeSection={section}
          onSectionChange={setSection}
          onBack={() => navigate('/editor')}
        />

        <main
          style={{
            flex:       1,
            overflowY:  'auto',
            background: '#ffffff',
            padding:    '2rem 2.5rem',
          }}
        >
          {section === 'cuenta' ? (
            <CuentaSection
              firstName={firstName} setFirstName={setFirstName}
              lastName={lastName}   setLastName={setLastName}
              email={email}
              username={username}   setUsername={setUsername}
              saving={saving}       onSave={handleSave}
              identities={identities}
            />
          ) : (
            <EditorSection />
          )}
        </main>
      </div>
    </div>
  )
}
