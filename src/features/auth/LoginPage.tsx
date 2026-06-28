import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from './useAuth'
import { useAuthStore } from './authStore'
import { useI18nStore } from '@/store/i18nStore'

// ── Icons ─────────────────────────────────────────────────────────────────────

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}

function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#24292e" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.342-3.369-1.342-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836c.85.004 1.705.114 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
    </svg>
  )
}

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m5 12 4 4 10-10" />
    </svg>
  )
}

function Spinner({ dark }: { dark?: boolean }) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: '0.929rem',
        height: '0.929rem',
        border: `2px solid ${dark ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.35)'}`,
        borderTopColor: dark ? '#374151' : 'white',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
        flexShrink: 0,
      }}
    />
  )
}

// ── OAuth button ──────────────────────────────────────────────────────────────

interface OAuthButtonProps {
  label: string
  icon: React.ReactNode
  disabled?: boolean
  loading?: boolean
  onClick: () => void
}

function OAuthButton({ label, icon, disabled, loading, onClick }: OAuthButtonProps) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%',
        padding: '0.643rem 1rem',
        border: `1px solid ${hovered ? '#d1d5db' : '#e5e7eb'}`,
        borderRadius: '0.5rem',
        background: hovered ? '#f9fafb' : '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.571rem',
        fontSize: '0.929rem',
        fontWeight: 600,
        color: '#111827',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'var(--font-ui)',
        opacity: disabled ? 0.6 : 1,
        transition: 'background 120ms, border-color 120ms',
      }}
    >
      {loading ? <Spinner dark /> : icon}
      {label}
    </button>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function LoginPage() {
  const { user, loading, signInWithEmail, signInWithGoogle, signInWithGitHub } = useAuth()
  const { setGuest } = useAuthStore()
  const navigate = useNavigate()
  const t = useI18nStore((s) => s.t)

  const [email, setEmail]               = useState('')
  const [password, setPassword]         = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError]               = useState<string | null>(null)
  const [loadingProvider, setLoadingProvider] = useState<'google' | 'github' | 'email' | null>(null)

  if (!loading && user) return <Navigate to="/editor" replace />

  const isLoading = loadingProvider !== null

  function handleGuest() {
    setGuest(true)
    navigate('/editor')
  }

  async function handleGoogle() {
    setError(null)
    setLoadingProvider('google')
    try { await signInWithGoogle() }
    catch (err) { setError(err instanceof Error ? err.message : 'Error al iniciar con Google.') }
    finally { setLoadingProvider(null) }
  }

  async function handleGitHub() {
    setError(null)
    setLoadingProvider('github')
    try { await signInWithGitHub() }
    catch (err) { setError(err instanceof Error ? err.message : 'Error al iniciar con GitHub.') }
    finally { setLoadingProvider(null) }
  }

  async function handleEmailSignIn(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoadingProvider('email')
    try { await signInWithEmail(email, password) }
    catch (err) { setError(err instanceof Error ? err.message : 'Credenciales incorrectas.') }
    finally { setLoadingProvider(null) }
  }

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .login-input:focus { border-color: #10b981 !important; box-shadow: 0 0 0 3px rgba(16,185,129,0.12); outline: none; }
        .login-input { transition: border-color 120ms, box-shadow 120ms; }
      `}</style>

      <div
        style={{
          minHeight: '100vh',
          background: 'radial-gradient(circle at 20% 0%, #d1fae5 0%, transparent 45%), radial-gradient(circle at 100% 100%, #dbeafe 0%, transparent 40%), #f7f7f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2.857rem 1.714rem',
          fontFamily: 'var(--font-ui)',
          position: 'relative',
        }}
      >
        {/* Dot pattern */}
        <div
          style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'radial-gradient(#d1d5db 1px, transparent 1px)',
            backgroundSize: '22px 22px',
            opacity: 0.4, zIndex: 0, pointerEvents: 'none',
          }}
        />

        <div
          style={{
            maxWidth: '62.857rem',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* ── Left pitch column ──────────────────────────────────────────── */}
          <div
            style={{
              width: '25.714rem',
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              paddingRight: '4.286rem',
            }}
          >
            {/* Logo + wordmark */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.857rem' }}>
              <img
                src="/images/logo-drop-t.png"
                alt="notes.js"
                style={{ width: 80, height: 'auto', display: 'block' }}
              />
              <span
                style={{
                  fontSize: '2.5rem',
                  fontWeight: 900,
                  letterSpacing: -0.8,
                  color: '#111827',
                  lineHeight: 1,
                  fontFamily: 'var(--font-ui)',
                  position: 'relative',
                  top: 4,
                }}
              >
                notes<span style={{ color: '#10b981' }}>.js</span>
              </span>
            </div>

            {/* Headline */}
            <h1
              style={{
                fontSize: '1.857rem',
                fontWeight: 800,
                color: '#111827',
                letterSpacing: -0.6,
                lineHeight: 1.3,
                margin: 0,
                marginTop: '2rem',
              }}
            >
              {t.login.tagline}
            </h1>

            <p style={{ fontSize: '1rem', color: '#6b7280', lineHeight: 1.6, margin: '0.571rem 0 0' }}>
              {t.login.desc}
            </p>

            {/* Check rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.857rem', marginTop: '1.429rem' }}>
              {[
                { bold: t.login.feat1bold, rest: t.login.feat1rest },
                { bold: t.login.feat2bold, rest: t.login.feat2rest },
                { bold: t.login.feat3bold, rest: t.login.feat3rest },
              ].map(({ bold, rest }) => (
                <div key={bold} style={{ display: 'flex', alignItems: 'center', gap: '0.571rem' }}>
                  <span
                    style={{
                      width: '1.286rem', height: '1.286rem',
                      borderRadius: '0.286rem',
                      background: '#ecfdf5',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <CheckIcon />
                  </span>
                  <span style={{ fontSize: '0.929rem', color: '#374151' }}>
                    <strong style={{ color: '#374151', fontWeight: 600 }}>{bold}</strong>
                    {rest}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right login card ───────────────────────────────────────────── */}
          <div
            style={{
              width: '25.714rem',
              flexShrink: 0,
              background: '#ffffff',
              borderRadius: '0.857rem',
              boxShadow: '0 12px 30px -12px rgba(15,23,42,0.18), 0 2px 4px rgba(15,23,42,0.04)',
              padding: '1.857rem',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Card header */}
            <h2 style={{ fontSize: '1.571rem', fontWeight: 800, color: '#111827', letterSpacing: -0.5, margin: 0 }}>
              {t.login.bienvenido}
            </h2>
            <p style={{ fontSize: '0.929rem', color: '#6b7280', margin: '0.286rem 0 1.286rem', lineHeight: 1.4 }}>
              {t.login.inicia}
            </p>

            {/* Error */}
            {error && (
              <div
                role="alert"
                style={{
                  marginBottom: '1rem',
                  padding: '0.714rem 0.857rem',
                  background: '#fee2e2', color: '#991b1b',
                  borderRadius: '0.429rem',
                  fontSize: '0.893rem', lineHeight: 1.4,
                  border: '1px solid #fecaca',
                }}
              >
                {error}
              </div>
            )}

            {/* OAuth buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.571rem' }}>
              <OAuthButton
                label={t.login.google}
                icon={<GoogleIcon />}
                disabled={isLoading}
                loading={loadingProvider === 'google'}
                onClick={handleGoogle}
              />
              <OAuthButton
                label={t.login.github}
                icon={<GitHubIcon />}
                disabled={isLoading}
                loading={loadingProvider === 'github'}
                onClick={handleGitHub}
              />
            </div>

            {/* Divider */}
            <Divider />

            {/* Email + password form */}
            <form onSubmit={handleEmailSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '0.857rem' }}>
              {/* Email */}
              <div>
                <label
                  htmlFor="login-email"
                  style={{ display: 'block', fontSize: '0.893rem', fontWeight: 500, color: '#374151', marginBottom: '0.357rem' }}
                >
                  {t.login.emailLabel}
                </label>
                <input
                  id="login-email"
                  type="email"
                  className="login-input"
                  placeholder={t.login.emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    padding: '0.571rem 0.714rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.429rem',
                    fontSize: '0.929rem',
                    color: '#111827',
                    background: '#ffffff',
                    fontFamily: 'var(--font-ui)',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Password */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.357rem' }}>
                  <label
                    htmlFor="login-password"
                    style={{ fontSize: '0.893rem', fontWeight: 500, color: '#374151' }}
                  >
                    {t.login.password}
                  </label>
                  <a
                    href="#"
                    style={{ fontSize: '0.821rem', color: '#10b981', fontWeight: 500, textDecoration: 'none' }}
                  >
                    {t.login.olvide}
                  </a>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    className="login-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    style={{
                      width: '100%',
                      padding: '0.571rem 2.286rem 0.571rem 0.714rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.429rem',
                      fontSize: '0.929rem',
                      color: '#111827',
                      background: '#ffffff',
                      fontFamily: 'var(--font-ui)',
                      boxSizing: 'border-box',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    style={{
                      position: 'absolute', right: '0.571rem', top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', padding: '0.143rem',
                      cursor: 'pointer', display: 'flex', alignItems: 'center',
                    }}
                  >
                    <EyeIcon open={showPassword} />
                  </button>
                </div>
              </div>

              {/* Sign in button */}
              <SignInButton loading={loadingProvider === 'email'} disabled={isLoading} />
            </form>

            {/* Guest divider + button */}
            <Divider />
            <GuestButton disabled={isLoading} onClick={handleGuest} />

            {/* Footer */}
            <p style={{ fontSize: '0.821rem', color: '#6b7280', textAlign: 'center', margin: '0.857rem 0 0', lineHeight: 1.5 }}>
              {t.login.noTienes}{' '}
              <a href="#" style={{ color: '#047857', textDecoration: 'none', fontWeight: 600 }}>
                {t.login.registro}
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Divider() {
  const t = useI18nStore((s) => s.t)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.571rem', margin: '1rem 0' }}>
      <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
      <span style={{ fontSize: '0.786rem', fontWeight: 600, color: '#9ca3af' }}>{t.login.o}</span>
      <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
    </div>
  )
}

function SignInButton({ loading, disabled }: { loading: boolean; disabled: boolean }) {
  const t = useI18nStore((s) => s.t)
  const [hovered, setHovered] = useState(false)
  return (
    <button
      type="submit"
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%',
        padding: '0.714rem',
        background: hovered && !disabled ? '#059669' : '#10b981',
        color: 'white',
        border: 'none',
        borderRadius: '0.5rem',
        fontSize: '0.964rem',
        fontWeight: 700,
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'var(--font-ui)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        opacity: disabled && !loading ? 0.6 : 1,
        transition: 'background 120ms',
      }}
    >
      {loading && <Spinner />}
      {t.login.iniciar}
    </button>
  )
}

function GuestButton({ disabled, onClick }: { disabled: boolean; onClick: () => void }) {
  const t = useI18nStore((s) => s.t)
  const [hovered, setHovered] = useState(false)
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%',
        padding: '0.643rem 1rem',
        borderRadius: '0.5rem',
        border: `1.5px dashed ${hovered ? '#9ca3af' : '#d1d5db'}`,
        background: hovered ? '#f9fafb' : 'transparent',
        color: hovered ? '#374151' : '#6b7280',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.143rem',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'var(--font-ui)',
        opacity: disabled ? 0.6 : 1,
        transition: 'background 120ms, border-color 120ms, color 120ms',
      }}
    >
      <span style={{ fontSize: '0.929rem', fontWeight: 700, lineHeight: 1 }}>{t.login.invitado}</span>
      <span style={{ fontSize: '0.821rem', fontWeight: 500, color: hovered ? '#6b7280' : '#9ca3af', lineHeight: 1 }}>
        {t.login.invitadoSub}
      </span>
    </button>
  )
}
