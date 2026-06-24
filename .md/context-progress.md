---
project: notesjs
mode: vibe
last_session: 2026-06-24
active_phase: "Supabase Wiring & Editor Features"
phases_done: 9
phases_total: 9
tasks_this_session: 14
tasks_total_done: 82
velocity_last_5: [18, 12, 0, 14]
blockers_count: 0
session_count: 6
---

# 📋 CONTEXT-PROGRESS
## notesjs • Session #6 • 2026-06-24

```
┌─────────────────────────────────────────────────────────────────┐
│  🏗️  CURRENT PHASE: Supabase Wiring & Editor Features           │
│  ██████████████████████████  100%                               │
│  📅 2026-06-24  •  Supabase cloud LIVE • login PKCE OK          │
│  📌 Tasks: 14 esta sesión  •  🔒 0 blocked                      │
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
| 9. Supabase Wiring & Editor Features | ✅ Done | 2026-06-24 | ██████████ 100% |

## Tasks this session

### ✅ Done (sesión #6)
- **#6 — Contenido reactivo vivo:** nuevo `editorContentStore`; preview Markdown/árbol JSON + contador del StatusBar actualizan al tipear (antes leían snapshot stale). Suscrito en hojas (StatusBar/RightPanel) para no re-renderizar EditorPage.
- **#3 — Auth PKCE:** `supabase.ts` → `flowType: 'pkce'` + `detectSessionInUrl: false` (evita "code already used"). `AuthCallback` PKCE-only + surfacing del error real (`?error=...` en vez de `missing_code` genérico).
- **#1 — Hardening RLS:** eliminadas policies `public_read` y `public_read_via_link` (filtraban `password_hash` bcrypt + tokens a cualquiera con anon key). Tablas owner-only; el RPC `get_shared_file` (SECURITY DEFINER) es el único portero de lo público.
- **#2 — `search_path`** fijado en las 3 funciones (`public, extensions, pg_temp`; `extensions` por pgcrypto en Supabase).
- **#7 — Promoción lazy:** tabs nuevos nacen `fileId: null` (`openLocalTab`); se promueven a fila DB al primer edit (`handleAuthLocalSave`) con `fileIdRef` + `setTabFileId`. Arregló pérdida de datos silenciosa (antes `updateFile` contra fila inexistente). También arregló guardado de tabs nuevos del invitado.
- **#8 — `fetchFiles` metadata-only:** tipo `FileMeta` (sin `content`) + `loadFileContent(id)` lazy. (Nota: nadie consume `fileStore.files` — sin sidebar, ese fetch es peso muerto; pendiente decidir si quitarlo.)
- **Rename:** input inline en TabBar (doble-click) + menú Archivo→Renombrar; `tabStore.renameTab` (re-deriva lenguaje), `fileStore.renameFile` (DB). **Renombrar promociona** tabs auth sin fila.
- **EditorHeader renderizado + cableado:** estaba importado pero nunca en el JSX → el panel derecho no se podía abrir. Ahora el toggle Solo editor / Vista previa / Árbol funciona. ⚠️ Usuario NO quiere esta barra así → rediseñar (ver Next Session).
- **Restaurar sesión:** tabs abiertos persisten en `localStorage` keyed por `userId`; al recargar reabren con contenido lazy (`openPersistedFile`). Gate `sessionRestored` evita clobber por StrictMode.
- **Papelera:** `DeletedFilesModal` on-demand (Archivo→Papelera), `fetchDeletedFiles` + `restoreFile`. "Mover a papelera" hace soft-delete real (`is_deleted=true`); **X del tab también va a papelera** (unificado en `handleMoveToTrash`); restaurar reabre como tab.
- **StatusBar honesto:** `lastSavedAt={null}` (antes `Date.now()` mentía "hace 0 s"). Indicador real pendiente.
- **Vite puerto 5174** fijado (`strictPort`) — coincide con launcher del usuario + redirect OAuth.
- **`DEPLOY.md`** corregido (policies eliminadas + PKCE).
- **Supabase cloud configurado** (proyecto `csqovectudtmqckatoxo`), variables locales, migración aplicada, GitHub OAuth + URL config. **Login PKCE funciona.** Smoke test 1-6 verde.

### 🔒 Blocked
— none

### 📋 To Do
— ver Next Session (rediseño barra + Google OAuth + entitlements)

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
| 6 | 2026-06-24 | Preview/árbol y contador no se actualizaban al tipear | `editorContent` leía del snapshot CM6 (solo se actualiza en cambio de tab/unmount); tipear no re-renderiza EditorPage | Canal reactivo `editorContentStore`; `useEditorView` empuja el doc en cada cambio; StatusBar/RightPanel se suscriben en hoja | editorContentStore.ts, useEditorView.ts, StatusBar.tsx, RightPanel.tsx |
| 7 | 2026-06-24 | Tabs nuevos (auth y guest) perdían contenido en silencio | Nacían con `fileId` falso → autosave hacía `updateFile` contra fila inexistente (0 filas, sin error) | Tabs nacen `fileId: null` (`openLocalTab`); promoción lazy a fila DB al primer edit; `fileIdRef` para leer fileId actual tras promoción | EditorPage.tsx, useEditorView.ts, tabStore.ts |
| 8 | 2026-06-24 | Login fallaba con `?error=missing_code` genérico | `AuthCallback` enmascaraba cualquier fallo OAuth como missing_code; la causa real era Client Secret de GitHub mal/desincronizado ("Unable to exchange external code") | Surfacing del `error_description` real en la URL; regenerar secret en GitHub + pegar en Supabase | AuthCallback.tsx |
| 9 | 2026-06-24 | Restaurar sesión se perdía al recargar | StrictMode monta 2x; el effect de persistencia escribía `{tabs:[]}` en localStorage entre los dos mounts, pisando la sesión antes de que el 2º restore la leyera | Gate `sessionRestored` (state): persistencia no escribe hasta que restore termina de leer | EditorPage.tsx |
| 10 | 2026-06-24 | Papelera vacía tras "borrar" | "Mover a papelera" solo cerraba el tab (sin soft-delete); y tabs renombrados-pero-vacíos no tenían fila DB | Soft-delete real en `handleMoveToTrash`; **renombrar promociona** el tab a fila; X unificada con papelera | EditorPage.tsx, DeletedFilesModal.tsx |

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
| 11 | 2026-06-24 | Tiering Free→Pro: gatear cuota + compartir-seguro, NO el sync | Sync de texto cuesta ~$0/usuario; gatearlo mata retención. El diferenciador (links con password/expiración) es lo que se paga. Lo viral (1 link público) es Free=marketing | modelo-open-core.md §7 |
| 12 | 2026-06-24 | Precio ancla €36/año (€3/mo) sobre €4/mo mensual | Comisión fija Stripe (~€0.25) se come ~10% a precios micro mensuales; anual = 1 sola comisión/año. Break-even ~8-10 usuarios Pro | modelo-open-core.md §7.4 |
| 13 | 2026-06-24 | **Precio Pro bajado a €11.99/año (≈€1/mes)** — supera la decisión #12 | Piso psicológico del impulso; "muy básico". Verificado: anual amortiza la comisión fija de Stripe (~3.6%, despreciable). Mensual suelto €4/mo empuja al anual (descuento ~75%). No bajar de ~€12/año. Break-even ~25 usuarios | modelo-open-core.md §7.2-7.4 |
| 14 | 2026-06-24 | Entitlements: misma MenuStrip Free/Pro, features Pro con 🔒 (no escondidos). Gate en 2 capas | Candado = upsell descubrible. `disabled` en React es solo UX; el gate real (cuota, password, expiración) va en RLS/RPC server-side o se saltea por DevTools. Punto único `useEntitlements()`, no `if(isPro)` esparcido. Base: columna `profiles.plan` | modelo-open-core.md §7.5; tasks #3-7 |
| 15 | 2026-06-24 | Roadmap Pro: v1 = burn-after-read + raw endpoint; v2 = full-text, diff, analytics; collab → Enterprise diferido | v1 bajo esfuerzo y máximo on-brand (seguridad/dev). E2E encryption es excluyente con búsqueda/formateo server-side → solo modo bóveda opcional | modelo-open-core.md §7.6 |
| 16 | 2026-06-24 | API+CLI degradado de v2 a backlog | `njs share` pelado no es wedge de adquisición — ya cubierto gratis por gh gist/termbin. Su valor está en burn/password (no en el CLI), es conveniencia para quien ya paga. No construir antes de validar pagos | modelo-open-core.md §7.6 backlog |
| 17 | 2026-06-24 | Auth PKCE (no implicit) — supera decisión #4 | Cloud Supabase soporta PKCE sin problema; más seguro para SPA. `detectSessionInUrl: false` para que el exchange manual sea el único dueño del `?code` | supabase.ts, AuthCallback.tsx |
| 18 | 2026-06-24 | **NO habrá panel lateral de archivos.** Archivos = tabs, punto | Usuario lo rechazó explícitamente. Reabrir archivos *cerrados* se hace vía Papelera (restaurar); reabrir *abiertos* vía restaurar-sesión. `fetchFiles` quedó sin consumidor → candidato a eliminar | EditorPage.tsx |
| 19 | 2026-06-24 | Cerrar tab (X) = mover a papelera (soft-delete); nombrar un tab lo promociona a fila | Pedido del usuario: cerrar debe ir a papelera. Nombrar = intención de conservar → crear fila. Unificado X + menú en `handleMoveToTrash` | EditorPage.tsx |
| 20 | 2026-06-24 | Restaurar sesión vía `localStorage` por-usuario (no query DB) | El restore solo reabre lo que estaba ABIERTO; usa los fileIds guardados + `loadFileContent`. No necesita la lista completa de archivos | EditorPage.tsx |

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
| 10 | 2026-06-24 | El secret OAuth en `config.toml` está commiteado en texto plano — el propio archivo advierte usar `env(...)`. Commiteado = quemado aunque el repo sea privado; rotar antes de publicar |
| 11 | 2026-06-24 | Sin identity linking (`enable_manual_linking=false`), Supabase crea `user_id` distinto por provider — mismo email vía Google y GitHub son usuarios separados, sus archivos (`files.user_id`) no se fusionan |
| 12 | 2026-06-24 | El contenido de notesjs vive en Postgres (`files.content`), no en Supabase Storage → el límite que aplica es la DB de 8 GB (Pro), no los 100 GB de Storage. Verificado pricing Supabase jun 2026: Free 500MB/1GB/50k MAU/pausa 1 semana; Pro $25/mo, 8GB DB incl ($0.125/GB extra) |
| 13 | 2026-06-24 | Costo marginal por usuario ≈ $0: ~8.000 usuarios de texto entran en los 8 GB de DB incluidos del flat de $25. El gatillo real para ir a Pro es la pausa por inactividad del Free, no el tamaño. Cuotas Free = palanca de monetización, no restricción de infra |
| 14 | 2026-06-24 | React StrictMode (dev) monta los efectos 2x. Un effect que escribe estado derivado a localStorage en el mount puede pisar un valor que un effect hermano necesita leer. Solución: gatear la escritura tras un flag puesto SOLO cuando la lectura termina |
| 15 | 2026-06-24 | En Supabase pgcrypto vive en el schema `extensions`. Funciones SECURITY DEFINER necesitan `SET search_path = public, extensions, pg_temp` o `crypt()`/`gen_salt()` no resuelven. (search_path ignora schemas inexistentes sin error → es robusto) |
| 16 | 2026-06-24 | Supabase "Unable to exchange external code" = el provider rechazó el canje del code, casi siempre Client Secret mal/desincronizado. Un redirect_uri mal da OTRO error. El `?code` correcto se ve en el authorize con `response_type=code` + `code_challenge` (PKCE) |
| 17 | 2026-06-24 | Supabase renombró claves: **publishable key** = reemplazo del anon (client-safe, RLS aplica igual); **secret key** = reemplazo del service_role (NUNCA en cliente). supabase-js acepta ambas |
| 18 | 2026-06-24 | Setup correcto Supabase: "Automatically expose new tables" + "automatic RLS" ambas ON. Exponer da los GRANTs que el Data API necesita; RLS gatea las filas. La migración no tiene GRANTs explícitos → depende del auto-expose |
| 19 | 2026-06-24 | No hay flujo de "reabrir archivos cerrados" salvo la Papelera. `addTab(DbFile)` NO copia `file.content` a `localContentMap` → abrir un archivo requiere `openPersistedFile` (siembra contenido + `fileId`). El editor lee el doc inicial de `getLocalContent` |

---

## 📅 Next Session

**Estado:** Supabase cloud LIVE (`csqovectudtmqckatoxo`), login GitHub PKCE OK, schema aplicado. Editor funcional: crear · renombrar · guardar · papelera/restaurar · compartir · formatear · preview/árbol · restaurar-sesión. Smoke test 1-6 verde.

**▶️ START WITH — Rediseñar la barra `EditorHeader` (pedido directo del usuario):**
- ❌ NO quiere la barra así. Fuera el lado izquierdo: **nombre del fichero + "detectado automáticamente"**.
- El **toggle del panel** (Solo editor / Vista previa / Árbol) hay que **reubicar/rediseñar** — decidir con el usuario DÓNDE va (¿menú Ver? ¿botón? ¿en el StatusBar?). Hoy vive en `EditorHeader.tsx` (renderizado desde `EditorPage.tsx`, dentro del área atenuable).
- Aprovechar para cablear el **indicador de guardado real** en `StatusBar` (`guardando…` + tiempo real). Hoy `lastSavedAt={null}` y `saveStatus="saved"` hardcodeados — no hay tracking de guardado.

**Pendiente de producto/feature (orden sugerido tras el rediseño):**
- ✅ Confirmar que la **papelera** funciona tras el fix promote-on-rename (el usuario estaba probando: crear→renombrar→cerrar→Papelera→restaurar).
- 🧹 Limpieza cosmética: ~10+ archivos **"Untitled" vacíos** en la DB (cada tab nuevo tipeado creó una fila). Considerar: no promover hasta tener nombre/contenido, o un botón de purga.
- 🗑️ **Quitar `fetchFiles`** del mount: nadie consume `fileStore.files` (sin sidebar). Es una query muerta en cada carga. (decisión #18)
- 🔵 **Google OAuth**: solo GitHub está configurado en Supabase. Falta crear credenciales en Google Cloud Console (redirect a `https://csqovectudtmqckatoxo.supabase.co/auth/v1/callback`) + pegar en Supabase. Gotcha: consent screen en "Testing" → añadir tu email como test user.

**Monetización (tareas #3-7, ver modelo-open-core.md §7):**
- Entitlements: `profiles.plan` → `useEntitlements()` → gates servidor (RLS/RPC) → gates cliente (🔒) → modal upgrade. Precio €11.99/año.

**Menubar audit (tarea #8) — qué sigue siendo placeholder/no-op:**
- ArchivoSheet: "Recientes" usa data FAKE (`RECENTES` hardcoded), "Descargar copia" e "Imprimir" sin onClick.
- MenuStrip `onMinify` es TODO. EditarSheet/BuscarSheet/VerSheet: auditar funcionalidad real.
- (Rename ✅ y Papelera ✅ ya hechos esta sesión.)

**🔴 Seguridad — ANTES de hacer el repo público:**
- Rotar secret Google OAuth (`supabase/config.toml`, `GOCSPX-...` en texto plano) en Google Cloud Console → mover a variable de entorno → limpiar historial git (BFG / `git filter-repo`). (tarea #1)
- Identity linking OFF: Google y GitHub con mismo email = usuarios distintos. Decidir si activar. (tarea #2)

**Decisión abierta (tarea #9):** ¿el invitado puede crear enlace de compartir? Choca con el ancla "guest 100% local". Hoy bloqueado por schema. Opción A: tabla `anonymous_shares` efímera + RPC. Falta decidir reencuadre de marca.

**Deploy:** Vercel env vars (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) + primer `vercel --prod`.

---

## 📜 History

| Session | Date | Tasks | Phase | Summary |
|---------|------|-------|-------|---------|
| 1 | 2026-05-19 | 3 | V3 UI Polish | Dropdown alignment + TabBar logo removal |
| 2 | 2026-05-20 | 25 | V3 UI Polish | AvatarMenu, PreferencesPage, OAuth Google, guest mode IDB, bug fixes |
| 3 | 2026-05-21 | 18 | V3 UI Polish | Fix guest auto-save (CM6 bug), LoginPage redesign, dark mode bars, FA icons, UI cleanup |
| 4 | 2026-05-29 | 12 | Sharing & Deploy Prep | Public links RLS, SharedFilePage, password protection (bcrypt), DEPLOY.md, Playwright verify, bug fixes |
| 5 | 2026-06-24 | 0 (planning) | Monetization Planning | Modelo open-core §7: tiering Free→Pro, precio €11.99/año, entitlements doble-gate, roadmap Pro (v1 burn+raw). Hallazgo seguridad: secret OAuth expuesto. 7 tareas + 6 decisiones |
| 6 | 2026-06-24 | 14 | Supabase Wiring & Editor Features | Hardening seguridad (#1 RLS leak, #2 search_path, #3 PKCE) + features editor (#6 preview vivo, #7 promoción lazy, #8 fetch metadata, rename, papelera/restaurar, restaurar-sesión, EditorHeader). Supabase cloud configurado + login PKCE funcionando. Usuario quiere rediseñar la barra (próximo) |
