// VerSheet — 250px @ left 298px
// Design reference: design/design_handoff_notesjs_v3/README.md § J — Ver

import { useState } from 'react'
import { useUIStore } from '@/store/uiStore'
import { MenuSheet, MSection, MDivider } from './MenuPrimitives'
import { N2G } from '@/shared/components/N2G'


// ── VerSheet ──────────────────────────────────────────────────────────────────

export function VerSheet({ left }: { left: number }) {
  const editorSettings       = useUIStore((s) => s.editorSettings)
  const updateEditorSettings = useUIStore((s) => s.updateEditorSettings)

  const { showLineNumbers, wrap, fontSize } = editorSettings

  const [minimap, setMinimap] = useState(false)

  return (
    <MenuSheet width="17.857rem" left={left}>
      {/* Editor toggles */}
      <MSection label="Editor">
        <ToggleRow
          label="Números de línea"
          icon="hash"
          value={showLineNumbers}
          onChange={(v) => updateEditorSettings({ showLineNumbers: v })}
        />
        <ToggleRow
          label="Ajustar línea"
          icon="wrap"
          value={wrap}
          onChange={(v) => updateEditorSettings({ wrap: v })}
        />
        <ToggleRow
          label="Minimapa"
          icon="map"
          value={minimap}
          onChange={setMinimap}
        />
      </MSection>

      <MDivider />

      {/* Font size */}
      <MSection label="Tamaño de fuente">
        <div style={{ padding: '0.143rem 0.714rem 0.286rem', display: 'flex', flexDirection: 'column', gap: '0.357rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.857rem', fontWeight: 600, color: 'var(--ink)' }}>
              {fontSize} px
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--ink3)' }}>
              10 – 24
            </span>
          </div>
          <input
            type="range"
            min={10}
            max={24}
            value={fontSize}
            onChange={(e) => updateEditorSettings({ fontSize: parseInt(e.target.value, 10) })}
            style={{
              width:       '100%',
              accentColor: 'var(--accent)',
              cursor:      'pointer',
            }}
          />
        </div>
      </MSection>
    </MenuSheet>
  )
}

// ── inline ToggleRow (avoids importing MToggle which uses state internally) ──

interface ToggleRowProps {
  label: string
  icon:  string
  value: boolean
  onChange: (v: boolean) => void
}

function ToggleRow({ label, icon, value, onChange }: ToggleRowProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      style={{
        display:      'grid',
        gridTemplateColumns: '1.143rem 1fr auto',
        alignItems:   'center',
        gap:          '0.643rem',
        width:        '100%',
        height:       '2rem',
        padding:      '0 0.714rem',
        background:   'transparent',
        border:       'none',
        borderRadius: 'var(--r-sm)',
        cursor:       'pointer',
        textAlign:    'left',
        color:        'var(--ink)',
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--chromeD)' }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
    >
      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <N2G name={icon} size={13} stroke={1.8} color="var(--ink3)" />
      </span>
      <span style={{ fontSize: '0.893rem', fontWeight: 600, color: 'var(--ink)' }}>{label}</span>
      <span
        style={{
          display:        'inline-flex',
          alignItems:     'center',
          width:          '1.857rem',
          height:         '1rem',
          borderRadius:   999,
          background:     value ? 'var(--accent)' : 'var(--chromeDD)',
          transition:     'background 150ms ease',
          padding:        '0 0.143rem',
          flexShrink:     0,
          justifyContent: value ? 'flex-end' : 'flex-start',
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
      </span>
    </button>
  )
}

