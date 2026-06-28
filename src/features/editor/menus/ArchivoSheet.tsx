// ArchivoSheet — 260px @ anchored to button left
// Design reference: design/design_handoff_notesjs_v3/README.md § F — Archivo

import { useI18nStore } from '@/store/i18nStore'
import { MItem, MDivider, MSection, MenuSheet } from './MenuPrimitives'

export interface ArchivoSheetProps {
  left: number
  onNewTab: () => void
  /** Trigger the persistent file picker in EditorPage */
  onOpenFile: () => void
  onDownload: () => void
  onPrint: () => void
  onRenameTab: () => void
  onDeleteTab: () => void
  /** Open the trash (deleted files) modal */
  onOpenTrash: () => void
}

const RECENTES = [
  { name: 'config.json', time: 'hace 5 min' },
  { name: 'reunion.md',  time: 'hace 1 h'   },
  { name: 'lista.txt',   time: 'ayer'        },
]

export function ArchivoSheet({ left, onNewTab, onOpenFile, onDownload, onPrint, onRenameTab, onDeleteTab, onOpenTrash }: ArchivoSheetProps) {
  const t = useI18nStore((s) => s.t)

  return (
    <MenuSheet width="18.571rem" left={left}>
        <MSection>
          <MItem
            icon="file-new"
            label={t.archivo.nuevo}
            shortcut="⌘N"
            variant="accent"
            onClick={onNewTab}
          />
        </MSection>

        <MDivider />

        <MSection label={t.archivo.secArchivo}>
          <MItem
            icon="folder-open"
            label={t.archivo.abrir}
            sub={t.archivo.subLocal}
            onClick={onOpenFile}
          />
          <MItem
            icon="download"
            label={t.archivo.descargar}
            sub={t.archivo.subDescargar}
            onClick={onDownload}
          />
          <MItem
            icon="type"
            label={t.archivo.imprimir}
            onClick={onPrint}
          />
        </MSection>

        <MDivider />

        <MSection label={t.archivo.secOrganizar}>
          <MItem
            icon="rename"
            label={t.archivo.renombrar}
            shortcut="F2"
            onClick={onRenameTab}
          />
          <MItem
            icon="trash"
            label={t.archivo.moverPapelera}
            shortcut="⌘⌫"
            variant="danger"
            onClick={onDeleteTab}
          />
          <MItem
            icon="undo"
            label={t.archivo.papelera}
            sub={t.archivo.subPapelera}
            onClick={onOpenTrash}
          />
        </MSection>

        <MDivider />

        <MSection label={t.archivo.secRecientes}>
          {RECENTES.map((r) => (
            <MItem
              key={r.name}
              icon="dot"
              label={r.name}
              sub={r.time}
              wip
            />
          ))}
        </MSection>
      </MenuSheet>
  )
}
