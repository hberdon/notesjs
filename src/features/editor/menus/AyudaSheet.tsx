// AyudaSheet — 230px @ left 352px
// Design reference: design/design_handoff_notesjs_v3/README.md § K — Ayuda

import { MItem, MDivider, MSection, MenuSheet } from './MenuPrimitives'

export function AyudaSheet({ left }: { left: number }) {
  return (
    <MenuSheet width="16.429rem" left={left}>
      {/* Main items */}
      <MSection>
        <MItem
          icon="keyboard"
          label="Atajos de teclado"
          shortcut="⌘?"
          variant="accent"
        />
        <MItem
          icon="info"
          label="Tour rápido"
          sub="2 min"
        />
        <MItem
          icon="dot"
          label="Novedades"
        />
      </MSection>

      <MDivider />

      <MSection>
        <MItem
          icon="share"
          label="Contactar soporte"
        />
        <MItem
          icon="check"
          label="Estado del servicio"
          sub="todo operativo"
        />
      </MSection>

      <MDivider />

      {/* Pro CTA card */}
      <div style={{ padding: '0.286rem 0.714rem 0.429rem' }}>
        <div
          style={{
            background:   'var(--accentSoft)',
            border:       '1px solid var(--accentBorder)',
            borderRadius: 'var(--r-md)',
            padding:      '0.714rem',
            display:      'flex',
            flexDirection: 'column',
            gap:          '0.429rem',
          }}
        >
          <span
            style={{
              fontSize:   '0.857rem',
              fontWeight: 800,
              color:      'var(--ink)',
              lineHeight: 1.2,
            }}
          >
            ¿Trabajas en equipo?
          </span>
          <p
            style={{
              fontSize:   '0.786rem',
              color:      'var(--ink3)',
              lineHeight: 1.4,
              margin:     0,
            }}
          >
            Pásate a notes.js Pro: edición colaborativa en vivo, carpetas, versiones y más.
          </p>
          <button
            type="button"
            onClick={() => window.open('/upgrade', '_blank')}
            style={{
              alignSelf:    'flex-start',
              padding:      '0.214rem 0.714rem',
              fontSize:     '0.821rem',
              fontWeight:   800,
              fontFamily:   'var(--font-ui)',
              color:        'var(--accentDeep)',
              background:   '#fff',
              border:       '1px solid var(--accentDeep)',
              borderRadius: 'var(--r-sm)',
              cursor:       'pointer',
            }}
          >
            Ver Pro →
          </button>
        </div>
      </div>
    </MenuSheet>
  )
}
