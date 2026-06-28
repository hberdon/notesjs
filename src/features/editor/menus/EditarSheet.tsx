// EditarSheet — 240px @ left 74px
// Design reference: design/design_handoff_notesjs_v3/README.md § G — Editar

import { useI18nStore } from '@/store/i18nStore'
import { MItem, MDivider, MSection, MenuSheet } from './MenuPrimitives'

export interface EditarSheetProps {
  left: number
  onUndo: () => void
  onRedo: () => void
  onCut: () => void
  onCopy: () => void
  onPaste: () => void
  onFormat: () => void
  onMinify: () => void
}

export function EditarSheet({ left, onUndo, onRedo, onCut, onCopy, onPaste, onFormat, onMinify }: EditarSheetProps) {
  const t = useI18nStore((s) => s.t)

  return (
    <MenuSheet width="17.143rem" left={left}>
      <MSection>
        <MItem icon="undo" label={t.editar.deshacer} shortcut="⌘Z"  onClick={onUndo} />
        <MItem icon="redo" label={t.editar.rehacer}  shortcut="⌘⇧Z" onClick={onRedo} />
      </MSection>

      <MDivider />

      <MSection>
        <MItem icon="cut"   label={t.editar.cortar}   shortcut="⌘X" onClick={onCut}   />
        <MItem icon="copy"  label={t.editar.copiar}   shortcut="⌘C" onClick={onCopy}  />
        <MItem icon="paste" label={t.editar.pegar}    shortcut="⌘V" onClick={onPaste} />
        <MItem icon="paste" label={t.editar.pegarSin}               onClick={onPaste} />
      </MSection>

      <MDivider />

      <MSection>
        <MItem icon="type"    label={t.editar.seleccionar} wip />
        <MItem icon="comment" label={t.editar.comentar}    wip />
      </MSection>

      <MDivider />

      <MSection label={t.editar.secFormato}>
        <MItem
          icon="format"
          label={t.editar.formatear}
          shortcut="⌘⇧F"
          sub={t.editar.subFormatear}
          variant="accent"
          onClick={onFormat}
        />
        <MItem
          icon="minimize"
          label={t.editar.minimizar}
          shortcut="⌘⇧M"
          sub={t.editar.subMinimizar}
          onClick={onMinify}
        />
      </MSection>
    </MenuSheet>
  )
}
