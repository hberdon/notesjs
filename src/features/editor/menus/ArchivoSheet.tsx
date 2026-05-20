// ArchivoSheet — 260px @ anchored to button left
// Design reference: design/design_handoff_notesjs_v3/README.md § F — Archivo

import { MItem, MDivider, MSection, MenuSheet } from './MenuPrimitives'

export interface ArchivoSheetProps {
  left: number
  onNewTab: () => void
  /** Trigger the persistent file picker in EditorPage */
  onOpenFile: () => void
  onRenameTab: () => void
  onDeleteTab: () => void
}

// Fake recent items — will be replaced with real data in a future phase
const RECENTES = [
  { name: 'config.json',   time: 'hace 5 min' },
  { name: 'reunion.md',    time: 'hace 1 h' },
  { name: 'lista.txt',     time: 'ayer' },
]

export function ArchivoSheet({ left, onNewTab, onOpenFile, onRenameTab, onDeleteTab }: ArchivoSheetProps) {
  return (
    <MenuSheet width="18.571rem" left={left}>
        {/* Nuevo */}
        <MSection>
          <MItem
            icon="file-new"
            label="Nuevo documento"
            shortcut="⌘N"
            variant="accent"
            onClick={onNewTab}
          />
        </MSection>

        <MDivider />

        {/* Archivo */}
        <MSection label="Archivo">
          <MItem
            icon="folder-open"
            label="Abrir"
            sub="archivo local"
            onClick={onOpenFile}
          />
          <MItem
            icon="download"
            label="Descargar copia"
            sub="txt · md"
          />
          <MItem
            icon="type"
            label="Imprimir…"
            shortcut="⌘P"
          />
        </MSection>

        <MDivider />

        {/* Organizar */}
        <MSection label="Organizar">
          <MItem
            icon="rename"
            label="Renombrar"
            shortcut="F2"
            onClick={onRenameTab}
          />
          <MItem
            icon="trash"
            label="Mover a papelera"
            shortcut="⌘⌫"
            variant="danger"
            onClick={onDeleteTab}
          />
        </MSection>

        <MDivider />

        {/* Recientes */}
        <MSection label="Recientes">
          {RECENTES.map((r) => (
            <MItem
              key={r.name}
              icon="dot"
              label={r.name}
              sub={r.time}
            />
          ))}
        </MSection>
      </MenuSheet>
  )
}
