// StatusBar — bottom chrome strip, 22px tall
// Design reference: design/design_handoff_notesjs_v3/README.md § V3StatusBar
//
// Layout: [save pill] [L:C] [spacer] [format pill (s)] [· N palabras · N car.] [· UTF-8]

import { N2G } from '@/shared/components/N2G'
import { FormatPill } from '@/shared/components/FormatPill'

export interface StatusBarProps {
  language: string
  content: string       // full editor text — used to compute word/char counts
  cursorLine: number    // 1-based
  cursorCol: number     // 1-based
  saveStatus: 'idle' | 'saving' | 'saved'
  lastSavedAt: number | null // ms timestamp
}

// ── Relative time helper ────────────────────────────────────────────────────

function timeAgo(ts: number): string {
  const diffSec = Math.floor((Date.now() - ts) / 1000)
  if (diffSec < 60)   return `hace ${diffSec} s`
  if (diffSec < 3600) return `hace ${Math.floor(diffSec / 60)} min`
  return `hace ${Math.floor(diffSec / 3600)} h`
}

// ── Component ───────────────────────────────────────────────────────────────

export function StatusBar({
  language,
  content,
  cursorLine,
  cursorCol,
  saveStatus,
  lastSavedAt,
}: StatusBarProps) {
  // Word / char counts
  const wordCount = content.trim() === ''
    ? 0
    : content.trim().split(/\s+/).filter(Boolean).length
  const charCount = content.length

  // Save pill content
  const isSaving = saveStatus === 'saving'
  const pillColor = isSaving ? '#6b7280' : '#047857'
  const pillLabel = isSaving
    ? 'guardando…'
    : lastSavedAt !== null
      ? `Guardado · ${timeAgo(lastSavedAt)}`
      : 'Guardado'

  return (
    <div
      style={{
        display:        'flex',
        alignItems:     'center',
        gap:            '0.857rem',
        height:         '1.571rem',
        minHeight:      '1.571rem',
        background:     '#eef0f3',
        borderTop:      '1px solid #e5e7eb',
        padding:        '0 0.857rem',
        fontSize:       '0.821rem',
        color:          '#374151',
        fontFamily:     'var(--font-ui)',
        flexShrink:     0,
        userSelect:     'none',
      }}
    >
      {/* Save pill */}
      <span
        style={{
          display:    'inline-flex',
          alignItems: 'center',
          gap:        '0.286rem',
          color:      pillColor,
          fontSize:   '0.821rem',
          fontWeight: 600,
          whiteSpace: 'nowrap',
        }}
      >
        <N2G
          name={isSaving ? 'cloud-up' : 'cloud-check'}
          size={15}
          stroke={1.8}
          color={pillColor}
        />
        {pillLabel}
      </span>

      {/* Cursor position L:C */}
      <span
        style={{
          fontSize:   '0.821rem',
          color:      '#374151',
          whiteSpace: 'nowrap',
        }}
      >
        L {cursorLine} : {cursorCol}
      </span>

      {/* Spacer */}
      <span style={{ flex: 1 }} />

      {/* Format pill (small) */}
      <FormatPill ext={language} size="s" />

      {/* Word + char counts */}
      <span style={{ fontSize: '0.821rem', color: '#6b7280', whiteSpace: 'nowrap' }}>
        · {wordCount} palabras · {charCount} car.
      </span>

      {/* Encoding */}
      <span style={{ fontSize: '0.821rem', color: '#9ca3af', whiteSpace: 'nowrap' }}>· UTF-8</span>
    </div>
  )
}
