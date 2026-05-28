import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useFileStore } from '@/store/fileStore'
import type { PublicFileResult } from '@/store/fileStore'

type State = 'loading' | 'not_found' | 'expired' | 'ok'

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
  const { token } = useParams<{ token: string }>()
  const getPublicFile = useFileStore((s) => s.getPublicFile)

  const [state, setState]   = useState<State>('loading')
  const [result, setResult] = useState<PublicFileResult | null>(null)

  useEffect(() => {
    if (!token) { setState('not_found'); return }

    void getPublicFile(token).then((res) => {
      if (!res) { setState('not_found'); return }

      // Defense-in-depth: validate expiry on the client too
      if (res.link.expires_at !== null && new Date(res.link.expires_at) < new Date()) {
        setState('expired')
        return
      }

      setResult(res)
      setState('ok')
    })
  }, [token, getPublicFile])

  return (
    <div style={{
      minHeight:   '100vh',
      background:  'var(--bg)',
      color:       'var(--ink)',
      fontFamily:  'var(--font-ui)',
      display:     'flex',
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
        <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--ink)', letterSpacing: '-0.02em' }}>
          notes.js
        </span>
        <span style={{ color: 'var(--border)', fontSize: '1rem' }}>·</span>
        <span style={{ fontSize: '0.821rem', color: 'var(--ink3)' }}>
          archivo compartido
        </span>
      </header>

      {/* Body */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '1.5rem', gap: '1rem', maxWidth: '64rem', width: '100%', margin: '0 auto' }}>

        {state === 'loading' && (
          <span style={{ color: 'var(--ink3)', fontSize: '0.893rem' }}>Cargando…</span>
        )}

        {state === 'not_found' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingTop: '2rem' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>Enlace no encontrado</span>
            <span style={{ fontSize: '0.893rem', color: 'var(--ink3)' }}>
              Este enlace no existe o ha sido revocado.
            </span>
          </div>
        )}

        {state === 'expired' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingTop: '2rem' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>Enlace expirado</span>
            <span style={{ fontSize: '0.893rem', color: 'var(--ink3)' }}>
              Este enlace ya no es válido. El propietario puede crear uno nuevo.
            </span>
          </div>
        )}

        {state === 'ok' && result && (
          <>
            {/* File meta */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 700, fontSize: '1rem' }}>{result.file.name}</span>
              <span style={{
                fontSize:     '0.75rem',
                fontWeight:   600,
                padding:      '0.143rem 0.5rem',
                borderRadius: 999,
                background:   'var(--accentSoft)',
                color:        'var(--accentDeep)',
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
              flex:        1,
              margin:      0,
              padding:     '1rem',
              background:  'var(--chromeD)',
              border:      '1px solid var(--border)',
              borderRadius: 'var(--r-lg)',
              fontFamily:  'var(--font-mono)',
              fontSize:    '0.857rem',
              lineHeight:  1.6,
              color:       'var(--ink)',
              overflowX:   'auto',
              whiteSpace:  'pre',
              tabSize:     2,
            }}>
              {result.file.content || <span style={{ color: 'var(--ink3)' }}>(archivo vacío)</span>}
            </pre>
          </>
        )}
      </main>
    </div>
  )
}
