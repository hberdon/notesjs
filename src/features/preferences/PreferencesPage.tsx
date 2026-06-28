// PreferencesPage — user settings screen

import { useState } from 'react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import type { UserIdentity } from '@supabase/supabase-js'
import { useAuthStore } from '@/features/auth/authStore'
import { useI18nStore } from '@/store/i18nStore'
import { N2G } from '@/shared/components/N2G'
import { AppHeader } from '@/shared/components/AppHeader'
import { supabase } from '@/lib/supabase'

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
        background:     'var(--ink3)',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        flexShrink:     0,
      }}
    >
      <N2G name="chev-right" size={11} stroke={2.5} color="var(--bg)" />
    </span>
  )
}



// ── Sidebar ───────────────────────────────────────────────────────────────────

interface SidebarProps {
  activeSection: Section
  onSectionChange: (s: Section) => void
  onBack: () => void
}

function Sidebar({ activeSection, onSectionChange, onBack }: SidebarProps) {
  const t = useI18nStore((s) => s.t)
  const NAV: Array<{ id: Section; label: string; icon: string }> = [
    { id: 'cuenta', label: t.prefs.navCuenta, icon: 'eye'  },
    { id: 'editor', label: t.prefs.navEditor, icon: 'type' },
  ]

  return (
    <aside
      style={{
        width:         '16.429rem',
        flexShrink:    0,
        background:    'var(--chrome)',
        borderRight:   '1px solid var(--border)',
        display:       'flex',
        flexDirection: 'column',
        padding:       '0.857rem 0',
        fontFamily:    'var(--font-ui)',
      }}
    >
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
          color:        'var(--ink3)',
          fontFamily:   'var(--font-ui)',
          marginBottom: '0.857rem',
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--ink2)' }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--ink3)' }}
      >
        <span style={{ display: 'flex', transform: 'rotate(180deg)' }}>
          <N2G name="chev-right" size={13} stroke={2.5} color="currentColor" />
        </span>
        {t.prefs.volver}
      </button>

      <span
        style={{
          display:       'block',
          padding:       '0 1rem 0.429rem',
          fontSize:      '0.714rem',
          fontWeight:    700,
          letterSpacing: '0.8px',
          textTransform: 'uppercase',
          color:         'var(--muted)',
          lineHeight:    1,
        }}
      >
        {t.prefs.ajustes}
      </span>

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
                background:   active ? 'var(--accentSoft)' : 'transparent',
                border:       'none',
                borderRadius: '0.357rem',
                cursor:       'pointer',
                fontFamily:   'var(--font-ui)',
                fontSize:     '0.893rem',
                fontWeight:   active ? 600 : 400,
                color:        active ? 'var(--accent-text)' : 'var(--ink2)',
                textAlign:    'left',
              }}
              onMouseEnter={(e) => {
                if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'var(--chromeD)'
              }}
              onMouseLeave={(e) => {
                if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
              }}
            >
              <N2G name={icon} size={15} stroke={1.8} color={active ? 'var(--accent)' : 'var(--muted)'} />
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
        <span style={{ fontSize: '0.893rem', fontWeight: 600, color: 'var(--ink)', lineHeight: 1.3 }}>
          {label}
        </span>
        {sub && (
          <span style={{ fontSize: '0.786rem', color: 'var(--ink3)', lineHeight: 1.4 }}>
            {sub}
          </span>
        )}
      </div>
      <div>{children}</div>
    </div>
  )
}

function RowDivider() {
  return <div style={{ height: 1, background: 'var(--border)', margin: '0 1.143rem' }} />
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
          color:        'var(--ink)',
          background:   disabled || readOnly ? 'var(--chrome)' : 'var(--bg)',
          border:       '1px solid var(--border)',
          borderRadius: '0.357rem',
          outline:      'none',
          boxSizing:    'border-box',
        }}
        onFocus={(e) => { if (!readOnly && !disabled) e.currentTarget.style.borderColor = 'var(--accent)' }}
        onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)' }}
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
  const t = useI18nStore((s) => s.t)
  return (
    <h1
      style={{
        display:    'flex',
        alignItems: 'baseline',
        gap:        '0.429rem',
        fontSize:   '1.5rem',
        fontWeight: 800,
        color:      'var(--ink)',
        margin:     '0 0 0.286rem',
        lineHeight: 1.2,
        fontFamily: 'var(--font-ui)',
      }}
    >
      <span style={{ color: 'var(--muted)', fontWeight: 600 }}>{t.prefs.heading}</span>
      <span style={{ color: 'var(--borderD)', fontWeight: 400, fontSize: '1.25rem' }}>›</span>
      <span>{section}</span>
    </h1>
  )
}

// ── Connected account row ─────────────────────────────────────────────────────

function IdentityRow({ identity }: { identity: UserIdentity }) {
  const t        = useI18nStore((s) => s.t)
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
        <div style={{ fontSize: '0.893rem', fontWeight: 600, color: 'var(--ink)', lineHeight: 1.3 }}>
          {isGoogle ? t.prefs.identiGoogle : t.prefs.identiEmail}
        </div>
        {sub && (
          <div style={{ fontSize: '0.786rem', color: 'var(--ink3)', lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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
          border:         '1px solid var(--border)',
          borderRadius:   '0.286rem',
          cursor:         'pointer',
          flexShrink:     0,
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--chrome)' }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
      >
        <N2G name="rename" size={13} stroke={1.8} color="var(--ink3)" />
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
  const t = useI18nStore((s) => s.t)
  return (
    <div style={{ maxWidth: '50rem' }}>
      <PageHeading section={t.prefs.cuentaTitulo} />
      <p style={{ fontSize: '0.893rem', color: 'var(--ink3)', margin: '0 0 1.714rem', lineHeight: 1.5 }}>
        {t.prefs.cuentaDesc}
      </p>

      <h2 style={{ fontSize: '1.071rem', fontWeight: 700, color: 'var(--ink)', margin: '0 0 0.357rem', lineHeight: 1.3 }}>
        {t.prefs.perfilTitulo}
      </h2>
      <p style={{ fontSize: '0.821rem', color: 'var(--ink3)', margin: '0 0 0.857rem', lineHeight: 1.5 }}>
        {t.prefs.perfilDesc}
      </p>

      <div
        style={{
          background:   'var(--bg)',
          border:       '1px solid var(--border)',
          borderRadius: '0.571rem',
          overflow:     'hidden',
          marginBottom: '2rem',
        }}
      >
        <FormRow label={t.prefs.nombre}>
          <Input value={firstName} onChange={setFirstName} />
        </FormRow>
        <RowDivider />
        <FormRow label={t.prefs.apellidos}>
          <Input value={lastName} onChange={setLastName} />
        </FormRow>
        <RowDivider />
        <FormRow label={t.prefs.emailLabel} sub={t.prefs.emailSub}>
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
                  color:         'var(--accent)',
                  border:        '1px solid var(--accentBorder)',
                  borderRadius:  '0.286rem',
                  padding:       '2px 0.429rem',
                  lineHeight:    1,
                  whiteSpace:    'nowrap',
                }}
              >
                {t.prefs.emailVerificado}
              </span>
            }
          />
        </FormRow>
        <RowDivider />
        <FormRow
          label={t.prefs.usernameLabel}
          sub={t.prefs.usernameSub.replace('{username}', username || '…')}
        >
          <Input value={username} onChange={setUsername} />
        </FormRow>

        <div
          style={{
            display:        'flex',
            justifyContent: 'flex-end',
            padding:        '0.857rem 1.143rem',
            borderTop:      '1px solid var(--border)',
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
              background:   saving ? 'var(--accentBorder)' : 'var(--accent)',
              border:       'none',
              borderRadius: '0.357rem',
              cursor:       saving ? 'default' : 'pointer',
              transition:   'background 120ms',
            }}
            onMouseEnter={(e) => { if (!saving) (e.currentTarget as HTMLButtonElement).style.background = 'var(--accentDeep)' }}
            onMouseLeave={(e) => { if (!saving) (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent)' }}
          >
            {saving ? t.prefs.guardando : t.prefs.guardar}
          </button>
        </div>
      </div>

      <h2 style={{ fontSize: '1.071rem', fontWeight: 700, color: 'var(--ink)', margin: '0 0 0.357rem', lineHeight: 1.3 }}>
        {t.prefs.cuentasTitulo}
      </h2>
      <p style={{ fontSize: '0.821rem', color: 'var(--ink3)', margin: '0 0 0.857rem', lineHeight: 1.5 }}>
        {t.prefs.cuentasDesc}
      </p>

      <div
        style={{
          background:   'var(--bg)',
          border:       '1px solid var(--border)',
          borderRadius: '0.571rem',
          overflow:     'hidden',
        }}
      >
        {identities.length === 0 ? (
          <div style={{ padding: '1.143rem', fontSize: '0.893rem', color: 'var(--muted)' }}>
            {t.prefs.noConectadas}
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
  const t = useI18nStore((s) => s.t)
  return (
    <div style={{ maxWidth: '50rem' }}>
      <PageHeading section={t.prefs.navEditor} />
      <p style={{ fontSize: '0.893rem', color: 'var(--ink3)', margin: '0 0 1.714rem', lineHeight: 1.5 }}>
        {t.prefs.editorDesc}
      </p>
      <div
        style={{
          background:   'var(--bg)',
          border:       '1px solid var(--border)',
          borderRadius: '0.571rem',
          padding:      '2rem',
          textAlign:    'center',
          color:        'var(--muted)',
          fontSize:     '0.893rem',
        }}
      >
        {t.prefs.editorProx}
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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'var(--font-ui)', background: 'var(--bg)', color: 'var(--ink)' }}>
      <AppHeader disablePreferences />

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
            background: 'var(--chromeD)',
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
