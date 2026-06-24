import { useState } from 'react'
import { N2G } from '@/shared/components/N2G'
import { formatBytes } from '@/shared/utils'
import { GUEST_MAX_BYTES } from '@/lib/guestDb'
import { getActiveEditorView } from './useEditorView'
import { useUIStore } from '@/store/uiStore'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface LiteBarProps {
  activeTabId:  string | null
  activeFilename: string
  onNewTab:     () => void
  onOpenFile:   () => void
  onFormat:     () => void
  usedBytes:    number
  /** Right-panel toggle — only rendered for panel-capable formats (json/markdown). */
  hasPanel:     boolean
  rightPanel:   'tree' | 'preview' | null
  panelType:    'tree' | 'preview'
  onTogglePanel: (panel: 'tree' | 'preview') => void
}

// ── Icon toggle button ────────────────────────────────────────────────────────

function IconToggleBtn({ icon, active, onClick, title }: { icon: string; active: boolean; onClick: () => void; title?: string }) {
  const [hovered, setHovered] = useState(false)
  const color = hovered ? 'var(--accent)' : active ? 'var(--ink)' : 'var(--ink3)'
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        width:          '1.714rem',
        height:         '2.143rem',
        marginLeft:     '-0.2rem',
        background:     'transparent',
        border:         'none',
        cursor:         'pointer',
        flexShrink:     0,
      }}
    >
      <N2G name={icon} size={13} color={color} />
    </button>
  )
}

// ── Action button ─────────────────────────────────────────────────────────────

interface ActionBtnProps {
  icon:    string
  label:   string
  onClick: () => void
  active?: boolean
}

function ActionBtn({ icon, label, onClick, active = false }: ActionBtnProps) {
  const [hovered, setHovered] = useState(false)
  const lit = active || hovered

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
        fontWeight: active ? 700 : 600,
        fontFamily: 'var(--font-ui)',
        color:      lit ? 'var(--accent)' : 'var(--ink2)',
        background:  hovered ? 'var(--chrome)' : 'transparent',
        border:      'none',
        borderLeft:  '1px solid var(--border)',
        borderRight: '1px solid var(--border)',
        marginRight: '-1px',
        cursor:      'pointer',
        whiteSpace: 'nowrap',
        flexShrink: 0,
        lineHeight: 1,
      }}
    >
      <N2G name={icon} size={16} stroke={1.8} color={lit ? 'var(--accent)' : 'var(--ink2)'} />
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
  hasPanel,
  rightPanel,
  panelType,
  onTogglePanel,
}: LiteBarProps) {
  const [copied, setCopied] = useState(false)
  const showLineNumbers     = useUIStore((s) => s.editorSettings.showLineNumbers)
  const updateEditorSettings = useUIStore((s) => s.updateEditorSettings)

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

  async function handleShare() {
    if (!activeTabId) return
    const content = getActiveEditorView()?.state.doc.toString() ?? ''
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const usageRatio  = usedBytes / GUEST_MAX_BYTES
  const storageWarn = usageRatio > 0.8
  const storageText = `${formatBytes(usedBytes)} de ${formatBytes(GUEST_MAX_BYTES)}`

  // Panel toggle (json → árbol, markdown → vista previa)
  const panelActive = rightPanel !== null
  const panelLabel  = panelType === 'tree' ? 'Vista árbol' : 'Vista previa'
  const panelIcon   = panelType === 'tree' ? 'list-ol' : 'eye'

  return (
    <div
      style={{
        display:      'flex',
        alignItems:   'center',
        height:       '2.143rem',
        minHeight:    '2.143rem',
        background:   'var(--bg)',
        borderTop:    '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        flexShrink:   0,
        userSelect:   'none',
        paddingLeft:  '0.286rem',
      }}
    >
      {/* ── Left: action buttons ── */}
      <div style={{ display: 'flex', alignItems: 'stretch', height: '100%', flex: 1 }}>
        <IconToggleBtn icon="list-ol" active={showLineNumbers} onClick={() => updateEditorSettings({ showLineNumbers: !showLineNumbers })} title="Números de línea" />
        <ActionBtn icon="file-new"    label="Nuevo"      onClick={onNewTab}      />
        <ActionBtn icon="folder-open" label="Abrir"      onClick={onOpenFile}    />
        <ActionBtn icon="download"    label="Descargar"  onClick={handleDownload} />
        <ActionBtn icon="format"      label="Formatear"  onClick={onFormat}      />
        <ActionBtn icon="share"       label={copied ? 'Copiado' : 'Compartir'} onClick={handleShare} />
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
        {/* Panel toggle — only for panel-capable formats (json/markdown) */}
        {hasPanel && (
          <button
            type="button"
            onClick={() => onTogglePanel(panelType)}
            title={panelLabel}
            style={{
              display:      'inline-flex',
              alignItems:   'center',
              gap:          '0.286rem',
              height:       '1.571rem',
              padding:      '0 0.571rem',
              fontSize:     '0.786rem',
              fontWeight:   600,
              fontFamily:   'var(--font-ui)',
              color:        panelActive ? 'var(--accent)' : 'var(--ink2)',
              background:   panelActive ? 'var(--chrome)' : 'transparent',
              border:       '1px solid var(--border)',
              borderRadius: '0.286rem',
              cursor:       'pointer',
              whiteSpace:   'nowrap',
              lineHeight:   1,
            }}
          >
            <N2G name={panelIcon} size={13} stroke={1.8} color={panelActive ? 'var(--accent)' : 'var(--ink2)'} />
            {panelLabel}
          </button>
        )}

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

      </div>
    </div>
  )
}
