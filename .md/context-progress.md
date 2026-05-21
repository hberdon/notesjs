---
project: notesjs
mode: vibe
last_session: 2026-05-20
active_phase: "Phase 7 — V3 UI Polish"
phases_done: 6
phases_total: 7
tasks_this_session: 23
tasks_total_done: 26
velocity_last_5: [3, 15]
blockers_count: 0
session_count: 2
---

# 📋 CONTEXT-PROGRESS
## notesjs • Session #2 • 2026-05-20

```
┌─────────────────────────────────────────────────────────────────┐
│  🏗️  CURRENT PHASE: V3 UI Polish                                │
│  ██████████████████████░  98%                                   │
│  📅 Start: 2026-05-19  •  ⏱️  Day 3                             │
│  📌 Tasks: 23/23 completados esta sesión  •  🔒 0 blocked       │
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
| 7. V3 UI Polish | 🔄 In progress | 2026-05-19 | █████████░ 98% |

## Tasks this session

### ✅ Done
- [x] AvatarMenu: Divider + SectionLabel components añadidos (faltaban, causaban crash)
- [x] AvatarMenu estilo igual que MenuSheet: borde verde superior, mismo shadow
- [x] Fix borde verde dropdowns cortado: `top: '100%'` + `zIndex: 110` en MenuSheet, eliminados `marginBottom` y `zIndex` del botón activo
- [x] Git push a rama `develop` (commit fa3ec39)
- [x] PreferencesPage implementada: layout dos columnas (sidebar + main)
- [x] Sidebar: "Volver al editor", sección "Ajustes", nav Cuenta / Editor
- [x] Sección Cuenta: Información del perfil (Nombre, Apellidos, Email+VERIFICADO, Username) + Guardar
- [x] Sección Cuenta: Cuentas conectadas (Google icon SVG coloreado + Email provider)
- [x] Ruta `/preferences` registrada y protegida con ProtectedRoute
- [x] AvatarMenu → "Preferencias" navega a `/preferences`
- [x] Preferencias: refinamientos (sin breadcrumb, menu avatar completo con Preferencias disabled, heading "Preferencias › Cuenta/Editor", fondo blanco, "Volver al editor" tamaño correcto)
- [x] Bug temas: `effectiveTheme` función como selector no re-renderizaba → arreglado con `s.theme` + `getEffectiveTheme(theme)`; TabBar fondo `#eef0f3` → `#ffffff`
- [x] Tab inactiva: estilo disabled (`background: #f3f4f6`, `opacity: 0.7`, `color: #6b7280`)
- [x] Fix separador TabBar/MenuStrip no full-width → movido a `borderTop` del MenuStrip
- [x] Hover rojo en botón cerrar tab (`background: #fee2e2`, `color: #dc2626`)
- [x] Lite mode (guest): `src/lib/guestDb.ts` — capa IndexedDB completa con `idb` (5MB/archivo)
- [x] Lite mode: `tabStore.openGuestTab` — hydration con ID estable desde IDB
- [x] Lite mode: `LiteBar.tsx` — barra horizontal con Nuevo, Abrir, Descargar, Formatear + storage indicator + CTA "Guardar en la nube"
- [x] Lite mode: `useEditorView` — guest auto-save path via `onGuestSave` callback + refs para evitar stale closures
- [x] Lite mode: `EditorPanel` — thread prop `onGuestSave`
- [x] Lite mode: `TabBar` — prop `isGuest`, right zone simplificado con `GuestLoginButton`
- [x] Lite mode: `EditorPage` — orquestación completa: hydration IDB, render LiteBar/MenuStrip condicional, handlers download + guest save + close cleanup

### 🔒 Blocked
— none

### 📋 To Do
— pendientes según design handoff V3

---

## 🔧 Tech Stack

```
Language   ▸ TypeScript 6.0
Runtime    ▸ Node.js (Vite 8)
Framework  ▸ React 19 + React Router 7 + CodeMirror 6
State      ▸ Zustand 5
Backend    ▸ Supabase (auth + postgres + storage)
Testing    ▸ Vitest 4 + Testing Library
Deploy     ▸ Vercel
```

## 📊 Metrics

```
Velocity     ▸ ⚡ 12 tasks/session (esta sesión) • avg 7.5/session
Bugs         ▸ 🐛 0 open • ✅ 2 closed
Blockers     ▸ 🚧 0 active
```

---

## 📝 Registry

### 🐛 Bugs
| # | Date | Description | Root cause | Fix | Files |
|---|------|-------------|------------|-----|-------|
| 1 | 2026-05-20 | Borde verde de dropdowns no visible (cortado) | Botón activo tenía `zIndex: 101` > sheet `zIndex: 100`; además `top: '2rem'` ≠ altura real del strip `2.143rem` | `top: '100%'`, `zIndex: 110` en MenuSheet; eliminados `marginBottom: -1` y `zIndex: 101` del botón activo | MenuPrimitives.tsx, MenuStrip.tsx |
| 2 | 2026-05-20 | Temas no aplicaban al hacer clic en el selector | `useThemeStore((s) => s.effectiveTheme)` devuelve referencia de función estable → componente nunca re-renderiza | Cambiar a `s.theme` (valor primitivo) + `getEffectiveTheme(theme)` para calcular `isDark` | EditorPage.tsx |

### ⚖️ Decisions
| # | Date | Decision | Rationale | Impact |
|---|------|----------|-----------|--------|
| 1 | 2026-05-19 | Dropdown position via `offsetLeft` dinámico | Valores hardcodeados rompían en cualquier viewport | `sheetLeft` state + buttonRefs map en MenuStrip | MenuStrip.tsx, todos los *Sheet.tsx |
| 2 | 2026-05-19 | Eliminar ícono `nj` del TabBar | Diseño más limpio, solo wordmark | TabBar.tsx |
| 3 | 2026-05-20 | PreferencesPage con su propio TopBar (no reutiliza TabBar) | TabBar está acoplado a lógica de tabs; Preferences necesita solo brand + avatar | TopBar independiente en PreferencesPage.tsx |
| 4 | 2026-05-20 | OAuth flowType: 'implicit' para Supabase local CLI | CLI local no soporta PKCE correctamente; producción puede usar PKCE | supabase.ts — pendiente ajustar para prod |
| 5 | 2026-05-20 | Separador TabBar→MenuStrip como `borderTop` del MenuStrip | Hijos del TabBar con `height: 2.143rem` + `box-sizing: border-box` cubren el `borderBottom` del padre (overflow ~0.5-1px) | TabBar.tsx, MenuStrip.tsx |

### 🚧 Blockers
| # | Description | Owner | Since | Notes |
|---|-------------|-------|-------|-------|

### 💡 Learnings
| # | Date | Learning |
|---|------|----------|
| 1 | 2026-05-19 | `button.offsetLeft` es relativo al `offsetParent` posicionado más cercano — el strip con `position: relative` — por lo que da el valor exacto para `position: absolute; left: N` del sheet |
| 2 | 2026-05-20 | Zustand selector con función (`(s) => s.methodThatReturnsValue`) no re-renderiza cuando cambia el estado subyacente — solo cuando cambia la referencia del selector. Siempre suscribir a valores primitivos |
| 3 | 2026-05-20 | Input oculto en un componente que se desmonta (ArchivoSheet) nunca dispara onChange porque el DOM desaparece antes. La solución: mover el input a un componente persistente (EditorPage) |
| 4 | 2026-05-20 | Flex hijo con `height` explícito igual al padre + `box-sizing: border-box` puede cubrir el `borderBottom` del padre (~0.5-1px overflow). Mover el borde al elemento siguiente como `borderTop` garantiza full-width |

---

## 📅 Next Session

**Remember:**
- Google OAuth en local usa `flowType: 'implicit'`; en prod cambiar a PKCE
- Archivos abiertos con "Abrir" son solo locales (no persisten en Supabase) — intencional por ahora
- PreferencesPage sección Editor es placeholder ("Próximamente")
- Temas cambian el CodeMirror y la variable `--bg` del body, pero los componentes usan colores hardcodeados — migración a CSS variables pendiente para dark mode completo

**Start with:**
— ▶️ Revisar pendientes de V3 según design handoff

---

## 📜 History

| Session | Date | Tasks | Phase | Summary |
|---------|------|-------|-------|---------|
| 1 | 2026-05-19 | 3 | V3 UI Polish | Dropdown alignment + TabBar logo removal |
| 2 | 2026-05-20 | 12 | V3 UI Polish | AvatarMenu, PreferencesPage, OAuth Google, bug fixes (borde verde + temas) |
