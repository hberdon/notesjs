// EditarSheet — 240px @ left 74px
// Design reference: design/design_handoff_notesjs_v3/README.md § G — Editar

import { MItem, MDivider, MSection, MenuSheet } from './MenuPrimitives'

export interface EditarSheetProps {
  left: number
  onFormat: () => void
  onMinify: () => void
}

export function EditarSheet({ left, onFormat, onMinify }: EditarSheetProps) {
  return (
    <MenuSheet width="17.143rem" left={left}>
      {/* Historial */}
      <MSection>
        <MItem icon="undo" label="Deshacer" shortcut="⌘Z" />
        <MItem icon="redo" label="Rehacer"  shortcut="⌘⇧Z" />
      </MSection>

      <MDivider />

      {/* Portapapeles */}
      <MSection>
        <MItem icon="cut"   label="Cortar"           shortcut="⌘X" />
        <MItem icon="copy"  label="Copiar"            shortcut="⌘C" />
        <MItem icon="paste" label="Pegar"             shortcut="⌘V" />
        <MItem icon="paste" label="Pegar sin formato" shortcut="⌘⇧V" />
      </MSection>

      <MDivider />

      {/* Selección */}
      <MSection>
        <MItem icon="type"    label="Seleccionar todo"  shortcut="⌘A" />
        <MItem icon="comment" label="Comentar línea"    shortcut="⌘/" />
      </MSection>

      <MDivider />

      {/* Formato */}
      <MSection label="Formato">
        <MItem
          icon="format"
          label="Formatear documento"
          shortcut="⌘⇧F"
          sub="aplica indent y comas correctas"
          variant="accent"
          onClick={onFormat}
        />
        <MItem
          icon="minimize"
          label="Minimizar"
          shortcut="⌘⇧M"
          sub="elimina espacios y saltos"
          onClick={onMinify}
        />
      </MSection>
    </MenuSheet>
  )
}
