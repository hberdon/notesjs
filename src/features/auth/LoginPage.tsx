// LoginPage — V3 redesign
// Design reference: design/design_handoff_notesjs_v3/README.md § "A — Login"

import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from './useAuth'
import { useAuthStore } from './authStore'

// ── Google "G" icon (simplified brand mark) ───────────────────────────────────

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="rgba(255,255,255,0.9)"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="rgba(255,255,255,0.9)"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="rgba(255,255,255,0.9)"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="rgba(255,255,255,0.9)"
      />
    </svg>
  )
}

// ── GitHub icon ───────────────────────────────────────────────────────────────

function GitHubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="white" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.342-3.369-1.342-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836c.85.004 1.705.114 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
    </svg>
  )
}

// ── Email icon ────────────────────────────────────────────────────────────────

function EmailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ink2)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m2 7 10 7 10-7" />
    </svg>
  )
}

// ── CheckIcon ─────────────────────────────────────────────────────────────────

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m5 12 4 4 10-10" />
    </svg>
  )
}

// ── Spinner ───────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <span
      style={{
        display: 'inline-block',
        width: '0.929rem',
        height: '0.929rem',
        border: '2px solid rgba(255,255,255,0.35)',
        borderTopColor: 'white',
        borderRadius: '50%',
        animation: 'tabbar-spin 0.7s linear infinite',
        flexShrink: 0,
      }}
    />
  )
}

// ── Auth button variants ──────────────────────────────────────────────────────

interface AuthButtonProps {
  label: string
  sub?: string
  icon: React.ReactNode
  variant: 'primary' | 'dark' | 'default'
  disabled?: boolean
  loading?: boolean
  onClick: () => void
}

function AuthButton({ label, sub, icon, variant, disabled, loading, onClick }: AuthButtonProps) {
  const [hovered, setHovered] = useState(false)

  const isLight = variant === 'default'

  const bgNormal = isLight ? '#ffffff' : variant === 'dark' ? '#24292e' : undefined
  const bgHover  = isLight ? '#f7f7f9' : variant === 'dark' ? '#2f363d' : undefined

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%',
        padding: '0.786rem 1rem',
        borderRadius: '0.5rem',
        border: isLight
          ? `1px solid ${hovered ? '#d1d5db' : '#e5e7eb'}`
          : variant === 'dark'
            ? '1px solid #1b1f23'
            : '1px solid transparent',
        background: isLight
          ? (hovered ? bgHover : bgNormal)
          : variant === 'dark'
            ? (hovered ? bgHover : bgNormal)
            : undefined,
        display: 'flex',
        alignItems: 'center',
        gap: '0.857rem',
        fontSize: '0.964rem',
        fontWeight: 700,
        color: isLight ? '#111827' : '#ffffff',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'var(--font-ui)',
        boxShadow: variant === 'primary'
          ? '0 1px 0 rgba(0,0,0,0.04), 0 1px 2px rgba(16,185,129,0.25)'
          : '0 1px 0 rgba(0,0,0,0.02)',
        marginBottom: '0.571rem',
        opacity: disabled ? 0.6 : 1,
        transition: 'background 120ms ease, border-color 120ms ease',
      }}
    >
      {/* Icon chip */}
      <span
        style={{
          width: '1.571rem',
          height: '1.571rem',
          borderRadius: '0.286rem',
          background: isLight ? '#f7f7f9' : 'rgba(255,255,255,0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {loading ? <Spinner /> : icon}
      </span>

      {/* Label + sub */}
      <span style={{ flex: 1, textAlign: 'left' }}>
        <span
          style={{
            display: 'block',
            fontSize: '0.964rem',
            fontWeight: 700,
            lineHeight: 1.2,
          }}
        >
          {label}
        </span>
        {sub && (
          <span
            style={{
              display: 'block',
              fontSize: '0.821rem',
              fontWeight: 500,
              opacity: isLight ? 1 : 0.8,
              color: isLight ? '#6b7280' : undefined,
              lineHeight: 1.2,
            }}
          >
            {sub}
          </span>
        )}
      </span>
    </button>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function LoginPage() {
  const { user, loading, signInWithEmail, signInWithGoogle, signInWithGitHub } = useAuth()
  const { setGuest } = useAuthStore()
  const navigate = useNavigate()

  const [error, setError] = useState<string | null>(null)
  const [loadingProvider, setLoadingProvider] = useState<'google' | 'github' | 'email' | null>(null)

  // Already authenticated — go straight to editor
  if (!loading && user) {
    return <Navigate to="/editor" replace />
  }

  const isLoading = loadingProvider !== null

  function handleGuest() {
    setGuest(true)
    navigate('/editor')
  }

  async function handleGoogle() {
    setError(null)
    setLoadingProvider('google')
    try {
      await signInWithGoogle()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar con Google.')
    } finally {
      setLoadingProvider(null)
    }
  }

  async function handleGitHub() {
    setError(null)
    setLoadingProvider('github')
    try {
      await signInWithGitHub()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar con GitHub.')
    } finally {
      setLoadingProvider(null)
    }
  }

  async function handleEmail() {
    setError(null)
    setLoadingProvider('email')
    try {
      // Email sign-in requires a form — for now open a prompt flow
      // The full email form would be a separate view; this triggers the flow
      await signInWithEmail('', '')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar con email.')
    } finally {
      setLoadingProvider(null)
    }
  }

  return (
    <>
      {/* Spin keyframe */}
      <style>{`
        @keyframes tabbar-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div
        style={{
          minHeight: '100vh',
          background: 'radial-gradient(circle at 20% 0%, #ecfdf5 0%, transparent 40%), radial-gradient(circle at 100% 100%, #e0f2fe 0%, transparent 35%), #f7f7f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2.857rem 1.714rem',
          fontFamily: 'var(--font-ui)',
          position: 'relative',
        }}
      >
        {/* Dot pattern overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(#d1d5db 1px, transparent 1px)',
            backgroundSize: '22px 22px',
            opacity: 0.25,
            zIndex: 0,
            pointerEvents: 'none',
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
          {/* ── Left column: pitch ──────────────────────────────────────── */}
          <div
            style={{
              width: '25.714rem',
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              paddingRight: '4.286rem',
            }}
          >
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.571rem' }}>
              {/* Icon */}
              <div
                style={{
                  width: '2.571rem',
                  height: '2.571rem',
                  background: 'linear-gradient(135deg, #10b981, #047857)',
                  borderRadius: '0.571rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span
                  style={{
                    fontSize: '1.286rem',
                    fontWeight: 900,
                    letterSpacing: -1,
                    color: 'white',
                    fontFamily: '"JetBrains Mono", "Fira Code", ui-monospace, monospace',
                    lineHeight: 1,
                  }}
                >
                  nj
                </span>
              </div>
              {/* App name */}
              <span style={{ fontSize: '1.143rem', fontWeight: 800, letterSpacing: -0.3, color: '#111827', lineHeight: 1 }}>
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
              Tu bloc de notas, en cualquier navegador.
            </h1>

            {/* Body */}
            <p
              style={{
                fontSize: '1rem',
                color: '#6b7280',
                lineHeight: 1.6,
                margin: 0,
                marginTop: '0.571rem',
              }}
            >
              Como el Bloc de notas de Windows o Notas de Mac, pero web.{' '}
              <strong style={{ fontWeight: 600, color: '#374151' }}>Sin instalación</strong>
              , abre una pestaña y empieza a escribir. Tus notas te siguen donde inicies sesión.
            </p>

            {/* Check rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.857rem', marginTop: '1.429rem' }}>
              {[
                { bold: 'Cero descargas.', rest: ' funciona en cualquier navegador moderno' },
                { bold: 'Sincroniza al iniciar sesión.', rest: ' tus notas aparecen en cualquier dispositivo' },
                { bold: 'Comparte por enlace.', rest: ' genera un enlace público estilo pastebin' },
              ].map(({ bold, rest }) => (
                <div
                  key={bold}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.571rem',
                  }}
                >
                  {/* Icon box */}
                  <span
                    style={{
                      width: '1.286rem',
                      height: '1.286rem',
                      borderRadius: '0.286rem',
                      background: '#ecfdf5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
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

          {/* ── Right column: login card ──────────────────────────────────── */}
          <div
            style={{
              width: '25.714rem',
              flexShrink: 0,
              background: '#ffffff',
              borderRadius: '0.857rem',
              boxShadow: '0 12px 30px -12px rgba(15,23,42,0.18), 0 2px 4px rgba(15,23,42,0.04)',
              padding: '1.571rem',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Card header */}
            <h2
              style={{
                fontSize: '1.214rem',
                fontWeight: 800,
                color: '#111827',
                letterSpacing: -0.4,
                margin: 0,
                marginBottom: 0,
              }}
            >
              Empieza a escribir
            </h2>
            <p style={{ fontSize: '0.929rem', color: '#6b7280', marginTop: '0.286rem', marginBottom: '1.143rem', lineHeight: 1.4 }}>
              Crea una cuenta o entra como invitado.
            </p>

            {/* Error alert */}
            {error && (
              <div
                role="alert"
                style={{
                  marginBottom: '14px',
                  padding: '0.714rem 0.857rem',
                  background: '#fee2e2',
                  color: '#991b1b',
                  borderRadius: 'var(--r-md)',
                  fontSize: '0.929rem',
                  lineHeight: 1.4,
                  border: '1px solid #fecaca',
                }}
              >
                {error}
              </div>
            )}

            {/* Auth buttons */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <AuthButton
                label="Continuar con Google"
                icon={<GoogleIcon />}
                variant="primary"
                disabled={isLoading}
                loading={loadingProvider === 'google'}
                onClick={handleGoogle}
              />
              <AuthButton
                label="Continuar con GitHub"
                icon={<GitHubIcon />}
                variant="dark"
                disabled={isLoading}
                loading={loadingProvider === 'github'}
                onClick={handleGitHub}
              />
              <AuthButton
                label="Crear cuenta con email"
                sub="email + contraseña"
                icon={<EmailIcon />}
                variant="default"
                disabled={isLoading}
                loading={loadingProvider === 'email'}
                onClick={handleEmail}
              />
            </div>

            {/* Divider */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.571rem',
                marginTop: '0.857rem',
                marginBottom: '0.857rem',
              }}
            >
              <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
              <span
                style={{
                  fontSize: '0.821rem',
                  fontWeight: 600,
                  color: '#9ca3af',
                }}
              >
                O
              </span>
              <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
            </div>

            {/* Guest button */}
            <GuestButton disabled={isLoading} onClick={handleGuest} />

            {/* Fine print */}
            <p
              style={{
                fontSize: '0.786rem',
                color: '#9ca3af',
                textAlign: 'center',
                lineHeight: 1.5,
                marginTop: '0.857rem',
                margin: '0.857rem 0 0',
              }}
            >
              ¿Ya tienes cuenta?{' '}
              <a href="#" style={{ color: '#047857', textDecoration: 'none', fontWeight: 600 }}>
                Inicia sesión →
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

// ── Guest button (extracted to use local hover state) ─────────────────────────

function GuestButton({ disabled, onClick }: { disabled: boolean; onClick: () => void }) {
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
        padding: '0.786rem 1rem',
        borderRadius: '0.5rem',
        border: `1.5px dashed ${hovered ? '#9ca3af' : '#d1d5db'}`,
        background: hovered ? '#f7f7f9' : 'transparent',
        color: hovered ? '#374151' : '#6b7280',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'var(--font-ui)',
        marginBottom: '0.286rem',
        opacity: disabled ? 0.6 : 1,
        transition: 'background 120ms ease, border-color 120ms ease, color 120ms ease',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.143rem' }}>
        <span style={{ fontSize: '0.964rem', fontWeight: 700, lineHeight: 1 }}>Continuar como invitado</span>
        <span style={{ fontSize: '0.821rem', fontWeight: 500, color: hovered ? '#6b7280' : '#9ca3af', lineHeight: 1 }}>
          tus notas se quedan en este navegador
        </span>
      </div>
    </button>
  )
}
