// CompartirSheet — 300px @ left 208px
// Design reference: design/design_handoff_notesjs_v3/README.md § I — Compartir

import { useState, useEffect } from 'react'
import type { ExpiryOption, SharePermission, PublicLink } from '@/shared/types'
import { useFileStore } from '@/store/fileStore'
import { useI18nStore } from '@/store/i18nStore'
import { MenuSheet, MDivider } from './MenuPrimitives'
import { N2G } from '@/shared/components/N2G'

export interface CompartirSheetProps {
  left: number
  fileId: string | null
}

function expiryToMs(opt: ExpiryOption): number | null {
  if (opt === null) return null
  const map: Record<NonNullable<ExpiryOption>, number> = {
    '1h':  1 * 60 * 60 * 1000,
    '1d':  24 * 60 * 60 * 1000,
    '7d':  7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000,
  }
  return map[opt]
}

export function CompartirSheet({ left, fileId }: CompartirSheetProps) {
  const t                = useI18nStore((s) => s.t)
  const createPublicLink = useFileStore((s) => s.createPublicLink)
  const revokePublicLink = useFileStore((s) => s.revokePublicLink)
  const getPublicLink    = useFileStore((s) => s.getPublicLink)

  const [link,           setLink]           = useState<PublicLink | null>(null)
  const [loading,        setLoading]        = useState(false)
  const [expiry,         setExpiry]         = useState<ExpiryOption>('7d')
  const [permission,     setPermission]     = useState<SharePermission>('view')
  const [password,       setPassword]       = useState('')
  const [showPassword,   setShowPassword]   = useState(false)
  const [usePassword,    setUsePassword]    = useState(false)
  const [copied,         setCopied]         = useState(false)
  const [showExpiry,     setShowExpiry]     = useState(false)

  // Load existing link on mount
  useEffect(() => {
    if (!fileId) return
    void getPublicLink(fileId).then(setLink)
  }, [fileId, getPublicLink])

  async function handleCreate() {
    if (!fileId) return
    setLoading(true)
    try {
      const ms = expiryToMs(expiry)
      const expiresAt = ms !== null
        ? new Date(Date.now() + ms).toISOString()
        : null
      const created = await createPublicLink(fileId, {
        expiresAt,
        passwordHash: usePassword && password ? password : null,
        permission,
      })
      setLink(created)
    } finally {
      setLoading(false)
    }
  }

  async function handleRevoke() {
    if (!link) return
    setLoading(true)
    try {
      await revokePublicLink(link.id)
      setLink(null)
    } finally {
      setLoading(false)
    }
  }

  async function handleCopy() {
    if (!link) return
    const url = `${window.location.origin}/s/${link.token}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const expiryKeys: Array<ExpiryOption> = ['1h', '1d', '7d', '30d', null]

  return (
    <MenuSheet width="21.429rem" left={left}>
      <div style={{ padding: '0.286rem 0.857rem 0.571rem', display: 'flex', flexDirection: 'column', gap: '0.429rem' }}>

        {/* Header */}
        <div>
          <span style={{ fontSize: '0.786rem', fontWeight: 700, color: 'var(--ink3)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
            {t.compartir.titulo}
          </span>
          <p style={{ fontSize: '0.786rem', color: 'var(--ink3)', marginTop: '0.214rem', lineHeight: 1.4 }}>
            {t.compartir.desc}
          </p>
        </div>

        <MDivider />

        {link ? (
          /* ── Link exists ── */
          <>
            {/* URL row */}
            <div
              style={{
                display:      'flex',
                alignItems:   'center',
                gap:          '0.429rem',
                background:   '#f7f7f9',
                border:       '1px solid var(--border)',
                borderRadius: '0.357rem',
                padding:      '0.357rem 0.571rem',
              }}
            >
              <span
                style={{
                  flex:         1,
                  fontFamily:   'var(--font-mono)',
                  fontSize:     '0.821rem',
                  color:        'var(--ink2)',
                  overflow:     'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace:   'nowrap',
                }}
              >
                {window.location.origin}/s/{link.token}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                style={{
                  background:   'none',
                  border:       'none',
                  cursor:       'pointer',
                  fontSize:     11,
                  fontWeight:   700,
                  color:        copied ? 'var(--accent)' : 'var(--accentDeep)',
                  padding:      '0 2px',
                  flexShrink:   0,
                  fontFamily:   'var(--font-ui)',
                }}
              >
                {copied ? t.compartir.copiado : t.compartir.copiar}
              </button>
            </div>

            {/* Revoke */}
            <button
              type="button"
              disabled={loading}
              onClick={handleRevoke}
              style={{
                height:       '1.857rem',
                padding:      '0 0.714rem',
                fontSize:     '0.821rem',
                fontWeight:   600,
                fontFamily:   'var(--font-ui)',
                color:        'var(--err)',
                background:   'transparent',
                border:       '1px solid var(--err)',
                borderRadius: 'var(--r-sm)',
                cursor:       loading ? 'default' : 'pointer',
                opacity:      loading ? 0.5 : 1,
                alignSelf:    'flex-start',
              }}
            >
              {t.compartir.revocar}
            </button>
          </>
        ) : (
          /* ── No link yet ── */
          <>
            {/* Caducidad */}
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  display:     'flex',
                  alignItems:  'center',
                  justifyContent: 'space-between',
                  height:      26,
                  padding:     '0 2px',
                }}
              >
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)' }}>
                  {t.compartir.caducidad}
                </span>
                <button
                  type="button"
                  onClick={() => setShowExpiry(!showExpiry)}
                  style={{
                    display:      'inline-flex',
                    alignItems:   'center',
                    gap:          '0.286rem',
                    padding:      '0.143rem 0.571rem',
                    fontSize:     '0.821rem',
                    fontWeight:   600,
                    fontFamily:   'var(--font-ui)',
                    color:        'var(--ink2)',
                    background:   'var(--chromeD)',
                    border:       '1px solid var(--border)',
                    borderRadius: 'var(--r-pill)',
                    cursor:       'pointer',
                  }}
                >
                  {t.compartir.expiry[expiry === null ? 'null' : expiry]}
                  <N2G name="chev-down" size={11} stroke={2} color="var(--ink3)" />
                </button>
              </div>

              {/* Expiry popover */}
              {showExpiry && (
                <div
                  style={{
                    position:   'absolute',
                    right:      0,
                    top:        30,
                    background: 'var(--bg)',
                    border:     '1px solid var(--border)',
                    borderTop:  '2px solid var(--accent)',
                    borderRadius: 'var(--r-lg)',
                    boxShadow:  'var(--sh-sheet)',
                    padding:    '3px 0',
                    zIndex:     101,
                    minWidth:   130,
                  }}
                >
                  {expiryKeys.map((opt) => {
                    const key = opt === null ? 'null' : opt
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => { setExpiry(opt); setShowExpiry(false) }}
                        style={{
                          display:    'block',
                          width:      '100%',
                          padding:    '5px 12px',
                          fontSize:   12,
                          fontWeight: expiry === opt ? 700 : 500,
                          fontFamily: 'var(--font-ui)',
                          color:      expiry === opt ? 'var(--accentDeep)' : 'var(--ink)',
                          background: expiry === opt ? 'var(--accentSoft)' : 'transparent',
                          border:     'none',
                          textAlign:  'left',
                          cursor:     'pointer',
                        }}
                      >
                        {t.compartir.expiry[key]}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Proteger con contraseña */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div
                style={{
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'space-between',
                  padding:        '0 2px',
                }}
              >
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)' }}>
                  {t.compartir.password}
                </span>
                {/* Mini toggle */}
                <button
                  type="button"
                  onClick={() => setUsePassword(!usePassword)}
                  style={{
                    display:        'inline-flex',
                    alignItems:     'center',
                    width:          '1.857rem',
                    height:         '1rem',
                    borderRadius:   999,
                    background:     usePassword ? 'var(--accent)' : 'var(--chromeDD)',
                    transition:     'background 150ms ease',
                    padding:        '0 0.143rem',
                    border:         'none',
                    cursor:         'pointer',
                    justifyContent: usePassword ? 'flex-end' : 'flex-start',
                    flexShrink:     0,
                  }}
                >
                  <span
                    style={{
                      width:        '0.714rem',
                      height:       '0.714rem',
                      borderRadius: '50%',
                      background:   '#fff',
                      boxShadow:    '0 1px 2px rgba(0,0,0,0.18)',
                    }}
                  />
                </button>
              </div>

              {usePassword && (
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t.compartir.passPlaceholder}
                    style={{
                      width:        '100%',
                      height:       '2rem',
                      padding:      '0 2.286rem 0 0.643rem',
                      fontSize:     '0.857rem',
                      fontFamily:   'var(--font-ui)',
                      color:        'var(--ink)',
                      background:   'var(--chromeD)',
                      border:       '1.5px solid var(--border)',
                      borderRadius: 'var(--r-md)',
                      outline:      'none',
                      boxSizing:    'border-box',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position:   'absolute',
                      right:      6,
                      top:        '50%',
                      transform:  'translateY(-50%)',
                      background: 'none',
                      border:     'none',
                      cursor:     'pointer',
                      padding:    0,
                      color:      'var(--ink3)',
                      display:    'flex',
                    }}
                  >
                    <N2G name="eye" size={13} stroke={1.6} />
                  </button>
                </div>
              )}
            </div>

            {/* Permisos */}
            <div style={{ display: 'flex', gap: '0.429rem' }}>
              {(['view', 'view+download'] as SharePermission[]).map((perm) => (
                <button
                  key={perm}
                  type="button"
                  onClick={() => setPermission(perm)}
                  style={{
                    padding:      '0.214rem 0.643rem',
                    fontSize:     '0.821rem',
                    fontWeight:   700,
                    fontFamily:   'var(--font-ui)',
                    borderRadius: 999,
                    cursor:       'pointer',
                    border:       permission === perm
                      ? '1px solid #10b981'
                      : '1px solid #e5e7eb',
                    background:   permission === perm ? '#ecfdf5' : 'transparent',
                    color:        permission === perm ? '#047857' : '#6b7280',
                    whiteSpace:   'nowrap',
                    display:      'inline-flex',
                    alignItems:   'center',
                  }}
                >
                  {perm === 'view' && permission === perm && (
                    <span style={{ fontSize: 9, marginRight: 2 }}>✓</span>
                  )}
                  {perm === 'view' ? t.compartir.verSolo : t.compartir.verDescargar}
                </button>
              ))}
            </div>

            <MDivider />

            {/* CTA */}
            <button
              type="button"
              disabled={loading || !fileId}
              onClick={handleCreate}
              style={{
                display:      'flex',
                alignItems:   'center',
                justifyContent: 'center',
                gap:          '0.286rem',
                width:        '100%',
                fontSize:     '0.893rem',
                fontWeight:   800,
                fontFamily:   'var(--font-ui)',
                color:        '#fff',
                background:   'var(--accent)',
                border:       '1px solid #047857',
                borderRadius: '0.357rem',
                padding:      '0.5rem 0.714rem',
                cursor:       loading || !fileId ? 'default' : 'pointer',
                opacity:      loading || !fileId ? 0.6 : 1,
              }}
            >
              {loading ? t.compartir.creando : (
                <>
                  <N2G name="share" size={11} stroke={2} color="#fff" />
                  {t.compartir.crear}
                </>
              )}
            </button>
            <span style={{ fontSize: '0.75rem', color: 'var(--ink3)', textAlign: 'center', marginTop: '0.357rem' }}>
              {t.compartir.nota}
            </span>
          </>
        )}
      </div>
    </MenuSheet>
  )
}
