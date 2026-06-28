// AyudaSheet — 230px @ left 352px
// Design reference: design/design_handoff_notesjs_v3/README.md § K — Ayuda

import { useI18nStore } from '@/store/i18nStore'
import { MItem, MDivider, MSection, MenuSheet } from './MenuPrimitives'

export function AyudaSheet({ left }: { left: number }) {
  const t = useI18nStore((s) => s.t)

  return (
    <MenuSheet width="16.429rem" left={left}>
      <MSection>
        <MItem icon="keyboard" label={t.ayuda.atajos}    variant="accent" wip />
        <MItem icon="info"     label={t.ayuda.tour}      sub={t.ayuda.subTour} wip />
        <MItem icon="dot"      label={t.ayuda.novedades} wip />
      </MSection>

      <MDivider />

      <MSection>
        <MItem icon="share" label={t.ayuda.soporte} wip />
        <MItem icon="check" label={t.ayuda.estado}  sub={t.ayuda.subEstado} wip />
      </MSection>
    </MenuSheet>
  )
}
