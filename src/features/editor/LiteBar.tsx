import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { N2G } from '@/shared/components/N2G'
import { formatBytes } from '@/shared/utils'
import { GUEST_MAX_BYTES } from '@/lib/guestDb'
import { getActiveEditorView } from './useEditorView'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface LiteBarProps {
  activeTabId:  string | null
  activeFilename: string
  onNewTab:     () => void
  onOpenFile:   () => void
  onFormat:     () => void
  usedBytes:    number
}

// ── Action button ─────────────────────────────────────────────────────────────

interface ActionBtnProps {
  icon:    string
  label:   string
  onClick: () => void
}

function ActionBtn({ icon, label, onClick }: ActionBtnProps) {
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
        gap:        '0.357rem',
        height:     '2.143rem',
        padding:    '0 0.857rem',
        fontSize:   '0.893rem',
        fontWeight: 600,
        fontFamily: 'var(--font-ui)',
        color:      hovered ? '#111827' : '#374151',
        background: hovered ? '#f7f7f9' : 'transparent',
        border:     'none',
        cursor:     'pointer',
        whiteSpace: 'nowrap',
        flexShrink: 0,
        lineHeight: 1,
      }}
    >
      <N2G name={icon} size={14} stroke={1.8} color={hovered ? '#111827' : '#374151'} />
      {label}
    </button>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function LiteBar({
  activeTabId,
  activeFilename,
  onNewTab,
  onOpenFile,
  onFormat,
  usedBytes,
}: LiteBarProps) {
  const navigate = useNavigate()
  const [ctaHovered, setCtaHovered] = useState(false)

  function handleDownload() {
    if (!activeTabId) return
    const content = getActiveEditorView()?.state.doc.toString() ?? ''
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = activeFilename
    a.click()
    URL.revokeObjectURL(url)
  }

  const usageRatio  = usedBytes / GUEST_MAX_BYTES
  const storageWarn = usageRatio > 0.8
  const storageText = `${formatBytes(usedBytes)} de ${formatBytes(GUEST_MAX_BYTES)}`

  return (
    <div
      style={{
        display:      'flex',
        alignItems:   'center',
        height:       '2.143rem',
        minHeight:    '2.143rem',
        background:   '#ffffff',
        borderTop:    '1px solid #e5e7eb',
        borderBottom: '1px solid #e5e7eb',
        flexShrink:   0,
        userSelect:   'none',
        paddingLeft:  '0.286rem',
      }}
    >
      {/* ── Left: action buttons ── */}
      <div style={{ display: 'flex', alignItems: 'stretch', height: '100%', flex: 1 }}>
        <ActionBtn icon="file-new"    label="Nuevo"      onClick={onNewTab}      />
        <ActionBtn icon="folder-open" label="Abrir"      onClick={onOpenFile}    />
        <ActionBtn icon="download"    label="Descargar"  onClick={handleDownload} />
        <ActionBtn icon="format"      label="Formatear"  onClick={onFormat}      />
      </div>

      {/* ── Right: storage indicator + cloud CTA ── */}
      <div
        style={{
          display:    'flex',
          alignItems: 'center',
          gap:        '0.857rem',
          padding:    '0 0.857rem',
          flexShrink: 0,
        }}
      >
        {/* Storage indicator — only show when something is stored */}
        {usedBytes > 0 && (
          <span
            style={{
              display:    'inline-flex',
              alignItems: 'center',
              gap:        '0.286rem',
              fontSize:   '0.786rem',
              fontFamily: 'var(--font-ui)',
              color:      storageWarn ? 'var(--warn)' : 'var(--ink3)',
              whiteSpace: 'nowrap',
            }}
          >
            <N2G
              name="hard-drive"
              size={12}
              stroke={2}
              color={storageWarn ? 'var(--warn)' : 'var(--ink3)'}
            />
            {storageText}
          </span>
        )}

        {/* Divider */}
        <div style={{ width: 1, height: '1rem', background: '#e5e7eb', flexShrink: 0 }} />

        {/* Cloud CTA */}
        <button
          type="button"
          onClick={() => navigate('/login')}
          onMouseEnter={() => setCtaHovered(true)}
          onMouseLeave={() => setCtaHovered(false)}
          style={{
            display:      'inline-flex',
            alignItems:   'center',
            gap:          '0.286rem',
            padding:      '0.25rem 0.714rem',
            background:   ctaHovered ? '#d1fae5' : 'var(--accentSoft)',
            border:       '1px solid var(--accentBorder)',
            borderRadius: 'var(--r-pill)',
            cursor:       'pointer',
            fontSize:     '0.786rem',
            fontWeight:   700,
            color:        'var(--accentDeep)',
            fontFamily:   'var(--font-ui)',
            whiteSpace:   'nowrap',
            transition:   'background 120ms',
            lineHeight:   1,
          }}
        >
          <N2G name="cloud-up" size={12} stroke={2} color="var(--accentDeep)" />
          Guardar en la nube
        </button>
      </div>
    </div>
  )
}
