// VerSheet — 250px @ left 298px
// Design reference: design/design_handoff_notesjs_v3/README.md § J — Ver

import { useState } from 'react'
import { useThemeStore } from '@/store/themeStore'
import { useUIStore } from '@/store/uiStore'
import type { Theme } from '@/shared/types'
import { MenuSheet, MSection, MDivider } from './MenuPrimitives'
import { N2G } from '@/shared/components/N2G'


// ── VerSheet ──────────────────────────────────────────────────────────────────

export function VerSheet({ left }: { left: number }) {
  const theme    = useThemeStore((s) => s.theme)
  const setTheme = useThemeStore((s) => s.setTheme)

  const editorSettings     = useUIStore((s) => s.editorSettings)
  const updateEditorSettings = useUIStore((s) => s.updateEditorSettings)

  const { showLineNumbers, wrap, fontSize } = editorSettings

  // Local minimap state — not yet in editorSettings
  // We keep it local for now; extend EditorSettings later if needed
  // (declared with _ prefix to satisfy noUnusedLocals is not possible here,
  // so we just use a normal state pair)
  const [minimap, setMinimap] = useState(false)

  return (
    <MenuSheet width="17.857rem" left={left}>
      {/* Tema */}
      <MSection label="Tema">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.429rem', padding: '0.143rem 0.571rem 0.286rem' }}>
          {[
            { id: 'light' as Theme, label: 'Claro',  bg: '#ffffff',      dot: '#10b981' },
            { id: 'dark'  as Theme, label: 'Oscuro', bg: '#0f172a',      dot: '#34d399' },
            { id: 'auto'  as Theme, label: 'Auto',   bg: 'linear-gradient(135deg,#ffffff 0%,#ffffff 50%,#0f172a 50%,#0f172a 100%)', dot: '#10b981' },
          ].map((t) => {
            const isActive = theme === t.id
            return (
              <div
                key={t.id}
                onClick={() => setTheme(t.id)}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.214rem', cursor: 'pointer' }}
              >
                {/* Preview box */}
                <div
                  style={{
                    width: '100%',
                    height: '2.286rem',
                    borderRadius: '0.286rem',
                    border: `${isActive ? 2 : 1}px solid ${isActive ? '#10b981' : '#e5e7eb'}`,
                    background: t.bg,
                    position: 'relative',
                    flexShrink: 0,
                  }}
                >
                  <span style={{
                    position: 'absolute', right: '0.214rem', bottom: '0.214rem',
                    width: '0.357rem', height: '0.357rem', borderRadius: '50%',
                    background: t.dot,
                  }} />
                </div>
                {/* Label */}
                <span style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: '0.786rem',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#111827' : '#374151',
                }}>
                  {t.label}
                </span>
              </div>
            )
          })}
        </div>
      </MSection>

      <MDivider />

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

