// EditorHeader — horizontal bar between menu strip and editor body, 30px tall
// Design reference: design/design_handoff_notesjs_v3/README.md § V3EditorHeader
//
// Layout:
//   Left:  filename · FormatPill · "· detectado automáticamente"
//   Right: (only when hasPanel) "Formatear" ghost button + segmented control

import { FormatPill } from '@/shared/components/FormatPill'

export interface EditorHeaderProps {
  filename: string
  language: string
  /** Which panel is currently active (null = "solo editor" mode). */
  rightPanel: 'tree' | 'preview' | null
  /** Render the right-side controls only for formats that support a panel (json, md). */
  hasPanel: boolean
  onFormat: () => void
  onTogglePanel: (panel: 'tree' | 'preview') => void
}

// ── Segmented control labels per panel type ─────────────────────────────────

const PANEL_LABELS: Record<'tree' | 'preview', string> = {
  tree:    'Árbol',
  preview: 'Vista previa',
}

// ── Component ───────────────────────────────────────────────────────────────

export function EditorHeader({
  filename,
  language,
  rightPanel,
  hasPanel,
  onFormat,
  onTogglePanel,
}: EditorHeaderProps) {
  // Derive which panel type is relevant from the language
  const panelType: 'tree' | 'preview' =
    language === 'json' || language === 'xml' || language === 'yml'
      ? 'tree'
      : 'preview'

  const panelLabel = PANEL_LABELS[panelType]

  // ── Shared style atoms ───────────────────────────────────────────────────

  const segmentBase: React.CSSProperties = {
    display:       'inline-flex',
    alignItems:    'center',
    padding:       '0 0.714rem',
    height:        '1.571rem',
    fontSize:      '0.857rem',
    fontFamily:    'var(--font-ui)',
    fontWeight:    600,
    cursor:        'pointer',
    border:        'none',
    whiteSpace:    'nowrap' as const,
    lineHeight:    1,
    userSelect:    'none' as const,
    transition:    'background 120ms, color 120ms',
  }

  const segmentActive: React.CSSProperties = {
    background: '#ecfdf5',
    color:      '#047857',
    fontWeight: 700,
  }

  const segmentInactive: React.CSSProperties = {
    background: 'transparent',
    color:      '#6b7280',
  }

  // Segment "Solo editor" is active when no panel is open
  const editorActive = rightPanel === null
  // Segment "[Árbol|Vista previa]" is active when panel is open
  const panelActive  = rightPanel !== null

  return (
    <div
      style={{
        display:        'flex',
        alignItems:     'center',
        height:         '2.143rem',
        minHeight:      '2.143rem',
        background:     '#ffffff',
        borderBottom:   '1px solid #e5e7eb',
        padding:        '0 1rem',
        gap:            '0.571rem',
        flexShrink:     0,
        userSelect:     'none',
      }}
    >
      {/* ── Left region ─────────────────────────────────────────── */}

      {/* Filename */}
      <span
        style={{
          fontSize:      '0.964rem',
          fontWeight:    800,
          color:         '#111827',
          letterSpacing: '-0.2px',
          fontFamily:    'var(--font-ui)',
          whiteSpace:    'nowrap',
          overflow:      'hidden',
          textOverflow:  'ellipsis',
        }}
      >
        {filename}
      </span>

      {/* Separator */}
      <span style={{ color: '#d1d5db', margin: '0 0.143rem' }}>·</span>

      {/* Format pill */}
      <FormatPill ext={language} size="m" />

      {/* Auto-detected hint */}
      <span
        style={{
          fontSize:   '0.821rem',
          color:      '#9ca3af',
          fontFamily: 'var(--font-ui)',
          whiteSpace: 'nowrap',
        }}
      >
        detectado automáticamente
      </span>

      {/* Spacer */}
      <span style={{ flex: 1 }} />

      {/* ── Right region (panel-capable formats only) ────────────── */}

      {hasPanel && (
        <>
          {/* "Formatear" button */}
          <button
            type="button"
            onClick={onFormat}
            style={{
              display:       'inline-flex',
              alignItems:    'center',
              padding:       '0 0.643rem',
              height:        '1.571rem',
              background:    'transparent',
              border:        '1px solid #e5e7eb',
              borderRadius:  '0.286rem',
              cursor:        'pointer',
              fontSize:      '0.857rem',
              fontWeight:    600,
              color:         '#374151',
              fontFamily:    'var(--font-ui)',
              whiteSpace:    'nowrap',
              transition:    'border-color 120ms, background 120ms',
            }}
            onMouseEnter={(e) => {
              ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#d1d5db'
              ;(e.currentTarget as HTMLButtonElement).style.background  = '#f7f7f9'
            }}
            onMouseLeave={(e) => {
              ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#e5e7eb'
              ;(e.currentTarget as HTMLButtonElement).style.background  = 'transparent'
            }}
          >
            Formatear
          </button>

          {/* Segmented control — "Solo editor" | "[Árbol|Vista previa]" */}
          <div
            style={{
              display:      'inline-flex',
              height:       '1.571rem',
              borderRadius: '0.286rem',
              overflow:     'hidden',
              border:       '1px solid #e5e7eb',
            }}
          >
            {/* Segment: Solo editor */}
            <button
              type="button"
              onClick={() => {
                // Clicking "Solo editor" while panel is open → close it
                if (rightPanel !== null) onTogglePanel(panelType)
              }}
              style={{
                ...segmentBase,
                borderRadius: 0,
                border:       'none',
                borderRight:  '1px solid #e5e7eb',
                ...(editorActive ? segmentActive : segmentInactive),
              }}
            >
              Solo editor
            </button>

            {/* Segment: Árbol | Vista previa */}
            <button
              type="button"
              onClick={() => onTogglePanel(panelType)}
              style={{
                ...segmentBase,
                borderRadius: 0,
                border:       'none',
                ...(panelActive ? segmentActive : segmentInactive),
              }}
            >
              {panelLabel}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
