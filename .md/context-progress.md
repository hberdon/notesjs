---
project: notesjs
mode: vibe
last_session: 2026-05-29
active_phase: "Phase 8 — Sharing & Deploy Prep"
phases_done: 8
phases_total: 8
tasks_this_session: 12
tasks_total_done: 68
velocity_last_5: [3, 15, 18, 12]
blockers_count: 0
session_count: 4
---

# 📋 CONTEXT-PROGRESS
## notesjs • Session #4 • 2026-05-29

```
┌─────────────────────────────────────────────────────────────────┐
│  🏗️  CURRENT PHASE: Sharing & Deploy Prep                       │
│  ██████████████████████████  100%                               │
│  📅 Start: 2026-05-29  •  ⏱️  Day 1                             │
│  📌 Tasks: 12/12 completados esta sesión  •  🔒 0 blocked       │
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
| 8. Sharing & Deploy Prep | ✅ Done | 2026-05-29 | ██████████ 100% |

## Tasks this session

### ✅ Done
- [x] Public links: RLS policy `public_read` filtra `expires_at IS NULL OR expires_at > now()`
- [x] Policy `public_read_via_link` en `files` — acceso anónimo solo si link válido sin password
- [x] Schema consolidado en `001_files.sql` — eliminado `002_public_links.sql`
- [x] `supabase/DEPLOY.md` — guía completa: schema, Google OAuth, env vars, flowType PKCE, Vercel
- [x] `getSharedFile(token, password?)` en fileStore — llama RPC `get_shared_file`, tipo `SharedFileResult`
- [x] `SharedFilePage` (`/s/:token`) — estados: loading, not_found, needs_password, wrong_password, ok
- [x] Router: ruta `/s/:token` sin `ProtectedRoute`; catch-all `*` → `/login`
- [x] `CompartirSheet`: URL fix `notes.js/p/` → `window.location.origin/s/`
- [x] Password protection: pgcrypto + trigger BEFORE INSERT (bcrypt cost 8) + RPC `get_shared_file` SECURITY DEFINER
- [x] N2G.tsx: añadir `faListOl`
- [x] Verificación Playwright: login, redirect, SharedFilePage, catch-all — todo OK
- [x] Fix bug: ruta desconocida mostraba React Router error boundary en crudo → catch-all `*` → `/login`

### 🔒 Blocked
— none

### 📋 To Do
— sin pendientes de código

**Pendiente de infraestructura (acciones en dashboards):**
- [ ] Aplicar `001_files.sql` en Supabase SQL Editor
- [ ] Configurar Google OAuth en Supabase + redirect URLs
- [ ] Variables de entorno en Vercel (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
- [ ] Cambiar `flowType: 'implicit'` → `'pkce'` en `src/lib/supabase.ts:33` antes de prod
- [ ] Primer deploy con `vercel --prod`

---

## 🔧 Tech Stack

```
Language   ▸ TypeScript 6.0
Runtime    ▸ Node.js (Vite 8)
Framework  ▸ React 19 + React Router 7 + CodeMirror 6
State      ▸ Zustand 5
Backend    ▸ Supabase (auth + postgres + storage + pgcrypto)
Icons      ▸ Font Awesome 6 Free Solid (via N2G wrapper)
Testing    ▸ Vitest 4 + Testing Library
Deploy     ▸ Vercel
```

## 📊 Metrics

```
Velocity     ▸ ⚡ 12 tasks/session (esta sesión) • avg 11.3/session
Bugs         ▸ 🐛 0 open • ✅ 1 closed esta sesión
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
| 5 | 2026-05-29 | Ruta desconocida mostraba "Unexpected Application Error!" de React Router | Sin catch-all en el router | Añadir `{ path: '*', element: <Navigate to="/login" replace /> }` | router/index.tsx |

### ⚖️ Decisions
| # | Date | Decision | Rationale | Impact |
|---|------|----------|-----------|--------|
| 1 | 2026-05-19 | Dropdown position via `offsetLeft` dinámico | Valores hardcodeados rompían en cualquier viewport | `sheetLeft` state + buttonRefs map en MenuStrip | MenuStrip.tsx, todos los *Sheet.tsx |
| 2 | 2026-05-19 | Eliminar ícono `nj` del TabBar | Diseño más limpio, solo wordmark | TabBar.tsx |
| 3 | 2026-05-20 | PreferencesPage con su propio TopBar (no reutiliza TabBar) | TabBar está acoplado a lógica de tabs; Preferences necesita solo brand + avatar | TopBar independiente en PreferencesPage.tsx |
| 4 | 2026-05-20 | OAuth flowType: 'implicit' para Supabase local CLI | CLI local no soporta PKCE correctamente; producción puede usar PKCE | supabase.ts — cambiar a 'pkce' antes de prod |
| 5 | 2026-05-20 | Separador TabBar→MenuStrip como `borderTop` del MenuStrip | Hijos del TabBar con `height: 2.143rem` + `box-sizing: border-box` cubren el `borderBottom` del padre (~0.5-1px overflow) | TabBar.tsx, MenuStrip.tsx |
| 6 | 2026-05-21 | IndexedDB (idb) para persistencia guest | Sin límite práctico vs localStorage, 5 MB/archivo, sobrevive recargas | guestDb.ts |
| 7 | 2026-05-21 | N2G como wrapper de FA6 | Misma API name-string — callers no cambian, solo el renderer | N2G.tsx |
| 8 | 2026-05-21 | Pill FREE en header AvatarMenu (no en barra) | Barra más limpia; el tier es info secundaria, visible al abrir el menú | TabBar.tsx |
| 9 | 2026-05-21 | Temas eliminados del menú Ver | Duplicado con AvatarMenu; centralizar en un solo lugar | VerSheet.tsx |
| 10 | 2026-05-29 | Password hashing vía trigger Postgres + RPC SECURITY DEFINER | El hash nunca se expone al cliente; bcrypt se verifica en el servidor con pgcrypto | 001_files.sql, fileStore.ts |

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
| 8 | 2026-05-29 | SECURITY DEFINER en Postgres bypasses RLS completamente — permite leer `files` como anónimo. Por eso la policy `public_read_via_link` excluye links con password: solo el RPC los sirve |
| 9 | 2026-05-29 | React Router v7 sin catch-all lanza su error boundary por defecto en rutas desconocidas — siempre añadir `{ path: '*' }` |

---

## 📅 Next Session

**Remember:**
- Código listo para producción — bloqueante es aplicar `001_files.sql` en Supabase
- `flowType: 'implicit'` → `'pkce'` antes del primer deploy a prod (`src/lib/supabase.ts:33`)
- Archivos abiertos con "Abrir" son solo locales — intencional por ahora
- PreferencesPage sección Editor es placeholder ("Próximamente")
- Password protection en links compartidos: el trigger + RPC existen en el schema pero no están activos hasta aplicar la migración

**Start with:**
— ▶️ Aplicar `001_files.sql` en Supabase y hacer primer deploy a Vercel

---

## 📜 History

| Session | Date | Tasks | Phase | Summary |
|---------|------|-------|-------|---------|
| 1 | 2026-05-19 | 3 | V3 UI Polish | Dropdown alignment + TabBar logo removal |
| 2 | 2026-05-20 | 25 | V3 UI Polish | AvatarMenu, PreferencesPage, OAuth Google, guest mode IDB, bug fixes |
| 3 | 2026-05-21 | 18 | V3 UI Polish | Fix guest auto-save (CM6 bug), LoginPage redesign, dark mode bars, FA icons, UI cleanup |
| 4 | 2026-05-29 | 12 | Sharing & Deploy Prep | Public links RLS, SharedFilePage, password protection (bcrypt), DEPLOY.md, Playwright verify, bug fixes |
