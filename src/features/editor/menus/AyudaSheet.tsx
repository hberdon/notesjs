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
          variant="accent"
          wip
        />
        <MItem
          icon="info"
          label="Tour rápido"
          sub="2 min"
          wip
        />
        <MItem
          icon="dot"
          label="Novedades"
          wip
        />
      </MSection>

      <MDivider />

      <MSection>
        <MItem
          icon="share"
          label="Contactar soporte"
          wip
        />
        <MItem
          icon="check"
          label="Estado del servicio"
          sub="todo operativo"
          wip
        />
      </MSection>
    </MenuSheet>
  )
}
