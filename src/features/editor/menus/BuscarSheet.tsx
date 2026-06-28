// BuscarSheet — 260px @ left 140px
// Design reference: design/design_handoff_notesjs_v3/README.md § H — Buscar

import { useState } from 'react'
import { useI18nStore } from '@/store/i18nStore'
import { MenuSheet } from './MenuPrimitives'

export function BuscarSheet({ left }: { left: number }) {
  const t = useI18nStore((s) => s.t)
  const [caseSensitive, setCaseSensitive] = useState(false)
  const [wholeWord,     setWholeWord]     = useState(false)
  const [regex,         setRegex]         = useState(false)

  return (
    <MenuSheet width="18.571rem" left={left}>
      {/* Search & replace is not wired up yet — show the design as a disabled preview */}
      <div style={{ padding: '0.5rem 0.714rem 0.143rem' }}>
        <span
          style={{
            display:       'inline-block',
            fontSize:      '0.625rem',
            fontWeight:    700,
            letterSpacing: '0.4px',
            textTransform: 'uppercase',
            color:         'var(--muted)',
            border:        '1px dashed var(--border)',
            borderRadius:  '999px',
            padding:       '0.143rem 0.5rem',
          }}
        >
          beta
        </span>
      </div>
      <div
        aria-disabled
        style={{
          padding:       '0.286rem 0.714rem 0.429rem',
          display:       'flex',
          flexDirection: 'column',
          gap:           '0.429rem',
          opacity:       0.5,
          pointerEvents: 'none',
          userSelect:    'none',
        }}
      >

        {/* Search input */}
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            placeholder={t.buscar.placeholder}
            style={{
              width:        '100%',
              height:       '2rem',
              padding:      '0 3.571rem 0 0.643rem',
              fontSize:     '0.821rem',
              fontFamily:   'var(--font-ui)',
              color:        'var(--ink)',
              background:   'var(--bg)',
              border:       '1.5px solid var(--accentBorder)',
              borderRadius: 'var(--r-md)',
              outline:      'none',
              boxSizing:    'border-box',
            }}
          />
          {/* Result badge */}
          <span
            style={{
              position:   'absolute',
              right:      '0.571rem',
              top:        '50%',
              transform:  'translateY(-50%)',
              fontSize:   '0.714rem',
              fontFamily: 'var(--font-mono)',
              color:      'var(--ink3)',
              background: 'var(--chromeD)',
              padding:    '0.071rem 0.357rem',
              borderRadius: 'var(--r-xs)',
              pointerEvents: 'none',
            }}
          >
            3/12
          </span>
        </div>

        {/* Replace input */}
        <input
          type="text"
          placeholder={t.buscar.reemplazar}
          style={{
            width:        '100%',
            height:       '2rem',
            padding:      '0 0.643rem',
            fontSize:     '0.821rem',
            fontFamily:   'var(--font-ui)',
            color:        'var(--ink)',
            background:   'var(--chromeD)',
            border:       '1.5px solid var(--border)',
            borderRadius: 'var(--r-md)',
            outline:      'none',
            boxSizing:    'border-box',
          }}
        />

        {/* Toggle chips row */}
        <div style={{ display: 'flex', gap: '0.357rem' }}>
          {[
            { label: 'Aa', state: caseSensitive, set: setCaseSensitive, title: t.buscar.casoSensible    },
            { label: 'W',  state: wholeWord,     set: setWholeWord,     title: t.buscar.palabraCompleta },
            { label: '.*', state: regex,          set: setRegex,         title: t.buscar.regex           },
          ].map(({ label, state, set, title }) => (
            <button
              key={label}
              type="button"
              title={title}
              onClick={() => set(!state)}
              style={{
                height:       '1.571rem',
                padding:      '0 0.5rem',
                fontSize:     '0.75rem',
                fontFamily:   'var(--font-mono)',
                fontWeight:   600,
                cursor:       'pointer',
                background:   state ? 'var(--accentSoft)' : 'var(--chromeD)',
                color:        state ? 'var(--accentDeep)' : 'var(--ink3)',
                border:       state
                  ? '1px solid var(--accentBorder)'
                  : '1px solid var(--border)',
                borderRadius: 'var(--r-xs)',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Replace all button */}
        <button
          type="button"
          style={{
            display:      'flex',
            alignItems:   'center',
            justifyContent: 'space-between',
            height:       '2rem',
            padding:      '0 0.714rem',
            fontSize:     '0.821rem',
            fontWeight:   600,
            fontFamily:   'var(--font-ui)',
            color:        'var(--accentDeep)',
            background:   'var(--accentSoft)',
            border:       '1px solid var(--accentBorder)',
            borderRadius: 'var(--r-sm)',
            cursor:       'pointer',
            width:        '100%',
          }}
        >
          <span>{t.buscar.reemplazarTodo}</span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize:   '0.714rem',
              color:      'var(--ink3)',
              background: 'var(--chromeDD)',
              padding:    '0.071rem 0.286rem',
              borderRadius: 'var(--r-xs)',
            }}
          >
            ⌘⌥↵
          </span>
        </button>
      </div>
    </MenuSheet>
  )
}
