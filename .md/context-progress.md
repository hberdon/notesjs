---
project: notesjs
mode: vibe
last_session: 2026-05-21
active_phase: "Phase 7 — V3 UI Polish"
phases_done: 7
phases_total: 7
tasks_this_session: 28
tasks_total_done: 56
velocity_last_5: [3, 15, 18]
blockers_count: 0
session_count: 3
---

# 📋 CONTEXT-PROGRESS
## notesjs • Session #3 • 2026-05-21

```
┌─────────────────────────────────────────────────────────────────┐
│  🏗️  CURRENT PHASE: V3 UI Polish                                │
│  ███████████████████████░  99%                                  │
│  📅 Start: 2026-05-19  •  ⏱️  Day 4                             │
│  📌 Tasks: 18/18 completados esta sesión  •  🔒 0 blocked       │
└─────────────────────────────────────────────────────────────────┘
```

## Progress

| Phase | State | Start | Progress |
|-------|-------|-------|----------|
| 1. Scaffold & Config | ✅ Done | 2026-05-18 | ██████████ 100% |
| 2. Supabase Client + DB Schema | ✅ Done | 2026-05-18 | ██████████ 100% |
| 3. Shared Types & Utils | ✅ Done | 2026-05-18 | ██████████ 100% |
| 4. Auth | ✅ Done | 2026-05-18 | ██████████ 100% |
| 5. Router + Stores | ✅ Done | 2026-05-18 | ██████████ 100% |
| 6. V3 Layout + Components | ✅ Done | 2026-05-19 | ██████████ 100% |
| 7. V3 UI Polish | ✅ Done | 2026-05-19 | ██████████ 100% |

## Tasks this session

### ✅ Done
- [x] Public links: RLS policy en `001_files.sql` — filtra `expires_at > now()` en DB + policy `public_read_via_link` en `files` para acceso anónimo
- [x] `getPublicFile(token)` en fileStore — join `public_links → files` sin auth
- [x] `SharedFilePage` — ruta pública `/s/:token` con estados: loading, not_found, expired, ok
- [x] Router: ruta `/s/:token` sin `ProtectedRoute`
- [x] `CompartirSheet`: URL fix `notes.js/p/` → `window.location.origin + /s/`
- [x] Schema consolidado en `001_files.sql` — eliminado `002_public_links.sql`
- [x] `supabase/DEPLOY.md` — guía completa de despliegue (schema, OAuth, env vars, Vercel, PKCE)
- [x] Fix guest auto-save: `autoSaveListener` movido a `EditorState.create` extensions (CM6 ignora `extensions` en EditorView cuando se pasa `state`)
- [x] Fix guest auto-save: `Compartment` para `buildExtensions` + `compartment.reconfigure()` en lugar de `StateEffect.reconfigure.of()`
- [x] LoginPage: quitar icono `nj`, wordmark más grande, botones OAuth outlined, form email+contraseña con toggle ojo, CTA verde
- [x] Dark mode barras: TabBar, MenuStrip, LiteBar → colores hardcoded reemplazados por CSS variables
- [x] Pill plan: `FREE` → `LITE` en modo guest; luego eliminado de la barra y movido al header del AvatarMenu
- [x] Font Awesome: instalar paquetes FA6, reescribir N2G.tsx con FA solid (misma API name-string)
- [x] Fix FA: `faFilePlus` → `faFileCirclePlus` (no existe en FA6 free solid)
- [x] Dark mode menús desplegables: `MenuPrimitives.tsx` hardcoded → CSS vars (`MenuSheet` bg, `MItem` hover, `MDivider`, `MSection`, shortcuts)
- [x] LiteBar: eliminar botón "Guardar en la nube" + divider
- [x] TabBar lite mode: `ThemeToggleButton` (luna/sol) a la izquierda de "Iniciar sesión →"
- [x] ThemeToggleButton: iconos SVG custom (sun stroke + moon filled con estrellas)
- [x] Pill FREE/LITE: eliminar de la barra izquierda del TabBar
- [x] Pill FREE: añadir en header AvatarMenu junto al email (solo modo auth)
- [x] VerSheet: eliminar sección de temas (ahora en AvatarMenu)
- [x] Menú texto más pequeño: `MItem` label + `MToggle` label + `VerSheet` ToggleRow `0.893rem` → `0.821rem` (proporciones CompartirSheet)
- [x] LiteBar: añadir botón "Compartir" — copia contenido activo al portapapeles, feedback "Copiado" 2s
- [x] Coherencia de peso tipográfico en menus: `MToggle` + `VerSheet` ToggleRow `fontWeight: 600` → `400` (igual que `MItem`); `BuscarSheet` inputs + botón `0.893rem` → `0.821rem`
- [x] TabBar: altura `2.143rem` → `3rem`; tabs ancladas al fondo (`alignItems: flex-end` en center zone)
- [x] Tabs: `borderTop` + `borderRadius: 0.357rem 0.357rem 0 0`; tab activa con borde superior verde

### 🔒 Blocked
— none

### 📋 To Do
— sin pendientes

---

## 🔧 Tech Stack

```
Language   ▸ TypeScript 6.0
Runtime    ▸ Node.js (Vite 8)
Framework  ▸ React 19 + React Router 7 + CodeMirror 6
State      ▸ Zustand 5
Backend    ▸ Supabase (auth + postgres + storage)
Icons      ▸ Font Awesome 6 Free Solid (via N2G wrapper)
Testing    ▸ Vitest 4 + Testing Library
Deploy     ▸ Vercel
```

## 📊 Metrics

```
Velocity     ▸ ⚡ 18 tasks/session (esta sesión) • avg 10.2/session
Bugs         ▸ 🐛 0 open • ✅ 3 closed esta sesión
Blockers     ▸ 🚧 0 active
```

---

## 📝 Registry

### 🐛 Bugs
| # | Date | Description | Root cause | Fix | Files |
|---|------|-------------|------------|-----|-------|
| 1 | 2026-05-20 | Borde verde de dropdowns no visible (cortado) | Botón activo tenía `zIndex: 101` > sheet `zIndex: 100`; además `top: '2rem'` ≠ altura real del strip `2.143rem` | `top: '100%'`, `zIndex: 110` en MenuSheet; eliminados `marginBottom: -1` y `zIndex: 101` del botón activo | MenuPrimitives.tsx, MenuStrip.tsx |
| 2 | 2026-05-20 | Temas no aplicaban al hacer clic en el selector | `useThemeStore((s) => s.effectiveTheme)` devuelve referencia de función estable → componente nunca re-renderiza | Cambiar a `s.theme` (valor primitivo) + `getEffectiveTheme(theme)` para calcular `isDark` | EditorPage.tsx |
| 3 | 2026-05-21 | Guest auto-save nunca disparaba | CM6 ignora `extensions` en `EditorView({ state, extensions })` cuando se pasa `state` — `autoSaveListener` nunca se registraba | Mover `autoSaveListener` a `EditorState.create({ extensions: [...] })` + `Compartment` para `buildExtensions` | useEditorView.ts |
| 4 | 2026-05-21 | `faFilePlus` crash al cargar | No existe en FA6 free solid | Reemplazar por `faFileCirclePlus` | N2G.tsx |

### ⚖️ Decisions
| # | Date | Decision | Rationale | Impact |
|---|------|----------|-----------|--------|
| 1 | 2026-05-19 | Dropdown position via `offsetLeft` dinámico | Valores hardcodeados rompían en cualquier viewport | `sheetLeft` state + buttonRefs map en MenuStrip | MenuStrip.tsx, todos los *Sheet.tsx |
| 2 | 2026-05-19 | Eliminar ícono `nj` del TabBar | Diseño más limpio, solo wordmark | TabBar.tsx |
| 3 | 2026-05-20 | PreferencesPage con su propio TopBar (no reutiliza TabBar) | TabBar está acoplado a lógica de tabs; Preferences necesita solo brand + avatar | TopBar independiente en PreferencesPage.tsx |
| 4 | 2026-05-20 | OAuth flowType: 'implicit' para Supabase local CLI | CLI local no soporta PKCE correctamente; producción puede usar PKCE | supabase.ts — pendiente ajustar para prod |
| 5 | 2026-05-20 | Separador TabBar→MenuStrip como `borderTop` del MenuStrip | Hijos del TabBar con `height: 2.143rem` + `box-sizing: border-box` cubren el `borderBottom` del padre (overflow ~0.5-1px) | TabBar.tsx, MenuStrip.tsx |
| 6 | 2026-05-21 | IndexedDB (idb) para persistencia guest | Sin límite práctico vs localStorage, 5 MB/archivo, sobrevive recargas | guestDb.ts |
| 7 | 2026-05-21 | N2G como wrapper de FA6 | Misma API name-string — callers no cambian, solo el renderer | N2G.tsx |
| 8 | 2026-05-21 | Pill FREE en header AvatarMenu (no en barra) | Barra más limpia; el tier es info secundaria, visible al abrir el menú | TabBar.tsx |
| 9 | 2026-05-21 | Temas eliminados del menú Ver | Duplicado con AvatarMenu; centralizar en un solo lugar | VerSheet.tsx |

### 🚧 Blockers
| # | Description | Owner | Since | Notes |

### 💡 Learnings
| # | Date | Learning |
|---|------|----------|
| 1 | 2026-05-19 | `button.offsetLeft` es relativo al `offsetParent` posicionado más cercano — el strip con `position: relative` — por lo que da el valor exacto para `position: absolute; left: N` del sheet |
| 2 | 2026-05-20 | Zustand selector con función (`(s) => s.methodThatReturnsValue`) no re-renderiza cuando cambia el estado subyacente — solo cuando cambia la referencia del selector. Siempre suscribir a valores primitivos |
| 3 | 2026-05-20 | Input oculto en un componente que se desmonta (ArchivoSheet) nunca dispara onChange porque el DOM desaparece antes. La solución: mover el input a un componente persistente (EditorPage) |
| 4 | 2026-05-20 | Flex hijo con `height` explícito igual al padre + `box-sizing: border-box` puede cubrir el `borderBottom` del padre (~0.5-1px overflow). Mover el borde al elemento siguiente como `borderTop` garantiza full-width |
| 5 | 2026-05-21 | CM6: `EditorView({ state, extensions })` ignora completamente `extensions` cuando se pasa `state`. Las extensiones deben estar en `EditorState.create({ extensions: [...] })` |
| 6 | 2026-05-21 | CM6: `StateEffect.reconfigure.of(ext)` reemplaza TODAS las extensiones del estado — incluyendo listeners. Usar `Compartment` + `compartment.reconfigure(ext)` para reconfigurar solo un subconjunto |
| 7 | 2026-05-21 | FA6 free solid: `faFilePlus` no existe, el equivalente es `faFileCirclePlus` |

---

## 📅 Next Session

**Remember:**
- Google OAuth en local usa `flowType: 'implicit'`; en prod cambiar a PKCE
- Archivos abiertos con "Abrir" son solo locales (no persisten en Supabase) — intencional por ahora
- PreferencesPage sección Editor es placeholder ("Próximamente")
- Dark mode barras completado; componentes internos de menus usan CSS vars

**Start with:**
— ▶️ Revisar pendientes de V3 según design handoff

---

## 📜 History

| Session | Date | Tasks | Phase | Summary |
|---------|------|-------|-------|---------|
| 1 | 2026-05-19 | 3 | V3 UI Polish | Dropdown alignment + TabBar logo removal |
| 2 | 2026-05-20 | 25 | V3 UI Polish | AvatarMenu, PreferencesPage, OAuth Google, guest mode IDB, bug fixes |
| 3 | 2026-05-21 | 18 | V3 UI Polish | Fix guest auto-save (CM6 bug), LoginPage redesign, dark mode bars, FA icons, UI cleanup |
