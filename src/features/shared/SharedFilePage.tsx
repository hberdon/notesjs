import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useFileStore } from '@/store/fileStore'
import type { SharedFileResult } from '@/store/fileStore'

type PageState = 'loading' | 'not_found' | 'needs_password' | 'wrong_password' | 'ok'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

function downloadFile(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export default function SharedFilePage() {
  const { token }        = useParams<{ token: string }>()
  const getSharedFile    = useFileStore((s) => s.getSharedFile)

  const [state,    setState]    = useState<PageState>('loading')
  const [result,   setResult]   = useState<Extract<SharedFileResult, { status: 'ok' }> | null>(null)
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!token) { setState('not_found'); return }

    void getSharedFile(token).then((res) => {
      if (!res)                           { setState('not_found');      return }
      if (res.status === 'needs_password') { setState('needs_password'); return }
      if (res.status === 'ok')             { setResult(res); setState('ok') }
    })
  }, [token, getSharedFile])

  // Focus password input when prompt appears
  useEffect(() => {
    if (state === 'needs_password' || state === 'wrong_password') {
      inputRef.current?.focus()
    }
  }, [state])

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!token || !password.trim()) return
    setSubmitting(true)
    try {
      const res = await getSharedFile(token, password)
      if (!res)                            { setState('not_found') }
      else if (res.status === 'wrong_password') { setState('wrong_password') }
      else if (res.status === 'ok')        { setResult(res); setState('ok') }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{
      minHeight:     '100vh',
      background:    'var(--bg)',
      color:         'var(--ink)',
      fontFamily:    'var(--font-ui)',
      display:       'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <header style={{
        height:       '3rem',
        display:      'flex',
        alignItems:   'center',
        padding:      '0 1.25rem',
        borderBottom: '1px solid var(--border)',
        gap:          '0.5rem',
        flexShrink:   0,
      }}>
        <img src="/images/logo-drop-t.png" alt="notes.js" style={{ width: '1.857rem', height: 'auto', display: 'block', flexShrink: 0 }} />
        <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--ink)', letterSpacing: '-0.02em' }}>
          notes.js
        </span>
        <span style={{ color: 'var(--border)', fontSize: '1rem' }}>·</span>
        <span style={{ fontSize: '0.821rem', color: 'var(--ink3)' }}>
          archivo compartido
        </span>
      </header>

      {/* Body */}
      <main style={{
        flex:          1,
        display:       'flex',
        flexDirection: 'column',
        padding:       '1.5rem',
        gap:           '1rem',
        maxWidth:      '64rem',
        width:         '100%',
        margin:        '0 auto',
      }}>

        {state === 'loading' && (
          <span style={{ color: 'var(--ink3)', fontSize: '0.893rem' }}>Cargando…</span>
        )}

        {state === 'not_found' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingTop: '2rem' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>Enlace no encontrado</span>
            <span style={{ fontSize: '0.893rem', color: 'var(--ink3)' }}>
              Este enlace no existe, ha caducado o ha sido revocado.
            </span>
          </div>
        )}

        {(state === 'needs_password' || state === 'wrong_password') && (
          <div style={{
            display:        'flex',
            flexDirection:  'column',
            alignItems:     'center',
            justifyContent: 'center',
            flex:           1,
            paddingTop:     '3rem',
          }}>
            <form
              onSubmit={handlePasswordSubmit}
              style={{
                display:       'flex',
                flexDirection: 'column',
                gap:           '0.857rem',
                width:         '100%',
                maxWidth:      '22rem',
                padding:       '1.714rem',
                background:    'var(--chromeD)',
                border:        '1px solid var(--border)',
                borderRadius:  'var(--r-lg)',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.286rem' }}>
                <span style={{ fontSize: '1rem', fontWeight: 700 }}>Archivo protegido</span>
                <span style={{ fontSize: '0.821rem', color: 'var(--ink3)', lineHeight: 1.4 }}>
                  Introduce la contraseña para acceder al contenido.
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.357rem' }}>
                <input
                  ref={inputRef}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Contraseña…"
                  style={{
                    height:       '2.286rem',
                    padding:      '0 0.714rem',
                    fontSize:     '0.893rem',
                    fontFamily:   'var(--font-ui)',
                    color:        'var(--ink)',
                    background:   'var(--bg)',
                    border:       state === 'wrong_password'
                      ? '1.5px solid var(--err)'
                      : '1.5px solid var(--border)',
                    borderRadius: 'var(--r-md)',
                    outline:      'none',
                    boxSizing:    'border-box',
                    width:        '100%',
                  }}
                />
                {state === 'wrong_password' && (
                  <span style={{ fontSize: '0.786rem', color: 'var(--err)' }}>
                    Contraseña incorrecta.
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting || !password.trim()}
                style={{
                  height:       '2.286rem',
                  fontSize:     '0.893rem',
                  fontWeight:   700,
                  fontFamily:   'var(--font-ui)',
                  color:        '#fff',
                  background:   'var(--accent)',
                  border:       '1px solid #047857',
                  borderRadius: 'var(--r-md)',
                  cursor:       submitting || !password.trim() ? 'default' : 'pointer',
                  opacity:      submitting || !password.trim() ? 0.6 : 1,
                }}
              >
                {submitting ? 'Verificando…' : 'Acceder'}
              </button>
            </form>
          </div>
        )}

        {state === 'ok' && result && (
          <>
            {/* File meta */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 700, fontSize: '1rem' }}>{result.file.name}</span>
              <span style={{
                fontSize:      '0.75rem',
                fontWeight:    600,
                padding:       '0.143rem 0.5rem',
                borderRadius:  999,
                background:    'var(--accentSoft)',
                color:         'var(--accentDeep)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}>
                {result.file.language}
              </span>
              <span style={{ fontSize: '0.786rem', color: 'var(--ink3)', marginLeft: 'auto' }}>
                {result.link.expires_at
                  ? `Caduca ${formatDate(result.link.expires_at)}`
                  : 'Sin caducidad'
                }
              </span>
              {result.link.permission === 'view+download' && (
                <button
                  type="button"
                  onClick={() => downloadFile(result.file.name, result.file.content)}
                  style={{
                    display:      'inline-flex',
                    alignItems:   'center',
                    gap:          '0.286rem',
                    padding:      '0.286rem 0.714rem',
                    fontSize:     '0.821rem',
                    fontWeight:   700,
                    fontFamily:   'var(--font-ui)',
                    color:        'var(--accentDeep)',
                    background:   'var(--accentSoft)',
                    border:       '1px solid var(--accent)',
                    borderRadius: 'var(--r-sm)',
                    cursor:       'pointer',
                  }}
                >
                  Descargar
                </button>
              )}
            </div>

            {/* Content */}
            <pre style={{
              flex:         1,
              margin:       0,
              padding:      '1rem',
              background:   'var(--chromeD)',
              border:       '1px solid var(--border)',
              borderRadius: 'var(--r-lg)',
              fontFamily:   'var(--font-mono)',
              fontSize:     '0.857rem',
              lineHeight:   1.6,
              color:        'var(--ink)',
              overflowX:    'auto',
              whiteSpace:   'pre',
              tabSize:      2,
            }}>
              {result.file.content || <span style={{ color: 'var(--ink3)' }}>(archivo vacío)</span>}
            </pre>
          </>
        )}
      </main>
    </div>
  )
}
