# Handoff: notes.js — V3 (FREE tier)

## Overview

**notes.js V3** is the **free tier** of notes.js — a browser-based text/code editor positioned as a **replacement for Windows Notepad / macOS Notas**: zero install, log in from any browser and your notes follow you. V3 is intentionally lighter than V2 (Pro): no live collaboration, no folders, no version history, no global cloud search. Just open a tab and write.

What V3 keeps from V2:
- The same brand and design language (Nunito, emerald accent, JetBrains Mono inside the editor, compact chrome).
- A multi-tab editor with file-extension badges and a dirty dot.
- A menu strip with the same 6 menus (Archivo · Editar · Buscar · Compartir · Ver · Ayuda).
- Auto-save to the cloud, surfaced inline and in the status bar.

What V3 changes:
- **Menu sheets are narrow anchored dropdowns**, not full-width drawers. They open under the menu label with a 2 px emerald top border and a soft drop shadow.
- A **prominent login screen** with Google · GitHub · email · guest options.
- **Format-aware editor**: a colored format pill in the editor header, optional right-side panel for JSON (navigable tree) and Markdown (rendered preview).
- **"Compartir" is a pastebin**: one public link with expiry + password + "view only / view + download". No invites, no roles, no live cursors.
- **Help sheet ends with a soft CTA to Pro** (V2). Pro is never pushed inside the writing flow.

## About the design files

The files in this bundle are **design references created in HTML** — visual prototypes that show the intended look and behavior. They are **not production code** to copy directly.

The implementation task is to **recreate these designs in your codebase's existing environment** (React, Vue, Svelte, etc.) using your established component library, state management, design tokens, and routing. If no front-end exists yet, pick the framework that fits the team and rebuild the UI there. Lift exact colors, spacing, and copy from the prototype, but don't ship the inline-styled JSX as-is.

## Fidelity

**High-fidelity.** Final colors, typography, spacing and component anatomy are intended to be implemented pixel-close to the prototype. Interaction details (hover/focus states, animation timing, format detection, public-link flow) are described below — they were not all wired in the prototype.

## Files in this bundle

**Visual references** (start here):
- `screenshots/` — one PNG per artboard at native size (1280 × 760 for login, 1280 × 680 for editor states). These are the **ground truth** for what each screen should look like. Compare your implementation against these.
- `preview.html` — open in a browser to see all 11 V3 artboards side-by-side in a pan/zoom canvas.

**Drop-in CSS** (use these as the starting point in your codebase):
- `tokens.css` — every design token from this handoff as CSS custom properties (`--nj-ink`, `--nj-accent`, `--nj-pill-json-bg`, `--nj-h-tabbar`, etc.). Import once at the root. Translate to your framework's token system (Tailwind theme, CSS-in-JS theme object, etc.) — keep the names and values identical.
- `globals.css` — Google Fonts import (Nunito + JetBrains Mono), minimal reset, the `njBlink` caret keyframe, and a couple of utility classes (`.nj-caret`, `.nj-line--current`, `.nj-login-dots`). Import after `tokens.css`.

**Source prototype** (reference, not production code):
- `src/design-canvas.jsx` — pan/zoom canvas the prototype runs inside (NOT part of the product).
- `src/notesjs-shared-primitives.jsx` — design tokens (`N2`), icon set (`N2I`), `N2Avatar`, `N2AvatarStack`, `N2Logo`, file-extension badges. Shared with V2 — same brand system.
- `src/notesjs-v3.jsx` — V3 entry: `V3Login`, `V3TabBar`, `V3MenuStrip`, narrow menu sheets (Archivo, Editar, Buscar, Compartir, Ver, Ayuda), `V3Editor`, `V3StatusBar`, composed `V3Frame`.
- `src/notesjs-v3-formats.jsx` — format registry (`V3_FORMATS`, `v3DetectFormat`), `V3FormatPill`, syntax-highlighted content for JS/JSON/MD/TXT, `V3CodeBody`, right-side panels (`V3RightPanel` → JSON tree + Markdown preview), `V3EditorHeader`.

The JSX uses inline `style={{...}}` objects so the prototype is self-contained — when porting, replace them with your framework's styling primitives and read values from `tokens.css`. Each `.jsx` file ends with `Object.assign(window, { ... })` — prototype convention; drop it in your real codebase and use real imports/exports.

### Recommended reading order for implementers

1. Open `preview.html` (or browse `screenshots/`) to get the full visual context.
2. Copy `tokens.css` and `globals.css` into your project and verify the fonts load.
3. Pick one screen (start with B — editor at rest) and find the matching screenshot. Use the README's "Screens / Views" section + the corresponding JSX section to rebuild it in your component library.
4. Iterate screen by screen, diffing your render against the PNG.

---

## Screens / Views

11 artboards. The login screen is **1280 × 760**; all editor states are **1280 × 680**.

### A — Login

The marketing-meets-auth landing.

- **Layout**: centered max-width 880 px, two columns with a 60 px gap.
- **Background**: layered radial gradients (`accentSoft` at 20 % top-left, `#e0f2fe` at 100 % bottom-right) over `chrome`, plus a 22 × 22 dot pattern at 25 % opacity (`borderD` dots).
- **Left column (pitch)** — logo (36 px square + 28 px wordmark) → headline ("Tu bloc de notas, en cualquier navegador.", 26 px / 800) → 14 px body explaining "Sin instalación" → three check-rows with bold lead phrase + grey continuation.
- **Right column (login card)** — 360 px wide white card with a 12 px radius and a soft drop shadow (`0 12px 30px -12px rgba(15,23,42,0.18), 0 2px 4px rgba(15,23,42,0.04)`):
  - Title "Empieza a escribir" (17 px / 800) + subtitle "Crea una cuenta o entra como invitado".
  - 3 stacked auth buttons: Google → GitHub → email. Each is a left-aligned row with a 22 px square icon chip, label (13.5 / 700), optional sub, and a trailing chev. Primary variant has emerald fill, white text and a green-tinted shadow.
  - "O" divider — two thin rules with a small uppercase "o" between.
  - Ghost button: "Continuar como invitado" + sub "tus notas se quedan en este navegador".
  - Bottom strip: "¿Ya tienes cuenta? Inicia sesión →" link in `accentDeep`.
  - Dashed top border separates the terms + privacy fine print at the very bottom.

### B — Editor at rest (JS)

- 4 tabs: `main.js` (active, dirty), `config.json`, `reunión.md` (dirty), `lista.txt`.
- Tab bar shows the logo + a **"FREE"** plan chip (10 px uppercase pill in chrome) on the left and the user's email + avatar on the right.
- Menu strip is **28 px** tall (V2 is 30) — V3 reads lighter.
- Editor header strip below shows the filename + **format pill** (colored "JS" pill with a dot) + "· detectado automáticamente" + on the right a "Formatear" button.
- Body: line numbers, syntax-highlighted JS, blinking caret on the current line.
- Status bar at the bottom: "Guardado · hace 6 s" pill → `L 13 : 18` → flex → format pill (small) → word + char count → `UTF-8`.

### C — JSON + right panel (tree)

- Active tab: `config.json`.
- Format pill is JSON orange.
- **Right panel** (290 px wide) appears automatically when a JSON file is active. Header strip "Estructura · navegable", chip "5 / 12" (visible nodes / total), close X.
- Tree: each node is one row with a chev (for containers), a 16 × 14 type-glyph chip (`{}` blue, `[]` violet, `"a` amber, `#` red, `✓` green), the key in bold, the count for containers (`[2]` / `{3}`), or `: value` colored by token type. Children indent 12 px per depth.
- One row in the prototype is **highlighted** (emerald soft bg + 2 px left border) to demonstrate selection.
- Footer hint: "click en una clave para saltar al editor".

### D — Markdown + right panel (preview)

- Active tab: `reunión.md`.
- Format pill is MD violet.
- Right panel (also 290 px) renders the markdown: h1 (19 px / 800), italic subtitle, h2 with bottom border, ul, ol, a blockquote with emerald left border and chrome background, a dark code block (`#0f172a` bg, terminal-y syntax colors), dashed rule, and an inline link styled with a 33 % alpha underline.
- Footer hint: "se actualiza al escribir · ⌘⇧V para alternar".

### E — Plain text (no panel)

- Active tab: `lista.txt`.
- Format pill is TXT grey.
- **No syntax highlight, no right panel** — this is the pure notepad case.

### F — Archivo (narrow dropdown)

- Anchored at x ≈ 6 px under the strip, **width 260 px**.
- Sections (separated by 1 px chrome dividers):
  - **Nuevo** → "Nuevo documento · ⌘N" (accent green icon).
  - **Archivo** → "Subir archivo local (.txt · .md · .js)", "Descargar copia (txt · md)", "Imprimir… · ⌘P".
  - **Organizar** → "Renombrar · F2", "Mover a papelera · ⌘⌫" (red label).
  - **Recientes** → 3 items with a `dot` glyph, name + relative time.

### G — Editar

- Width 240 px. Sections: Deshacer/Rehacer · Cortar/Copiar/Pegar/Pegar sin formato · Seleccionar todo & Comentar línea · **Formato** (Formatear documento ⌘⇧F + Minimizar ⌘⇧M). The format and minify items each carry a sub-label explaining what they do.

### H — Buscar

- Width 260 px. Two stacked search inputs:
  - Search input with green border, query "draft|", trailing "3 / 12".
  - Replace input with chrome bg and muted placeholder.
- Below: three modifier toggles (case sensible, whole word, regex) styled as menu items + an emerald "Reemplazar todo · ⌘⌥↵" entry.

### I — Compartir (the pastebin)

- Width 300 px (widest of the V3 sheets).
- Section "Compartir por enlace público" with an explainer line.
- A read-only link row (chrome bg, mono URL, "copiar" link styled in `accentDeep`).
- Section "Opciones":
  - **Caducidad** row — label on the left, a dropdown chip on the right showing "7 días" + chev.
  - **Proteger con contraseña** row — label + an off-state toggle (26 × 14 track).
  - Permission segmented pills: "Solo ver" (selected, emerald) and "Ver + descargar" (outline). Pill style: 999 radius, 11.5 / 700.
- Footer: emerald CTA button "Crear enlace público" full-width + caption "podrás revocarlo en cualquier momento".

### J — Ver

- Width 250 px. Sections:
  - **Tema** — 3-up chip picker (Claro / Oscuro / Auto). Each chip is 32 px tall with the preview bg + a small accent dot bottom-right. Selected chip has a 2 px emerald border.
  - **Editor** — line numbers (on), minimap, line wrap (on).
  - **Tamaño de fuente** — label "14 px" + range hint "10 – 24" + a slim slider (32 % fill, accent thumb).

### K — Ayuda

- Width 230 px (narrowest). Sections:
  - Atajos de teclado ⌘? (accent), Tour rápido (2 min), Novedades.
  - Contactar soporte, Estado del servicio (sub "todo operativo").
- **Pro CTA card** at the bottom — `accentSoft` background, `accentBorder` border, bolded "¿Trabajas en equipo?" headline, body explaining V2 Pro, white outline button "Ver Pro →" in `accentDeep`.

---

## Components

These are the building blocks. Many are V3-specific variants of V2 primitives — keep them in the same component file family but split free/pro variants behind a plan prop or feature flag.

### `V3LoginButton`
- Full-width, 11 px / 14 px padding, 7 px radius, **font-size 13.5 / weight 700**, gap 12 px.
- Variants:
  - **default**: white bg, 1 px `border`, subtle `0 1px 0 rgba(0,0,0,0.02)` shadow.
  - **primary**: `accent` bg, white text, `accentDeep` border, green-tinted shadow `0 1px 0 rgba(0,0,0,0.04), 0 1px 2px rgba(16,185,129,0.25)`.
  - **ghost**: transparent bg, same border as default, used for guest sign-in.
- Icon chip: 22 px square, 4 px radius. On primary: `rgba(255,255,255,0.18)` bg. On default/ghost: `chrome` bg.
- Optional `sub` line: 11.5 / 500, `ink3` (or `rgba(255,255,255,0.85)` on primary).
- Trailing chev (13 px) in `muted` (default) or white (primary).

### `V3Tab`
- Same anatomy as V2 (height 30, padding `0 10 px`, font-size 13, badge + name + dirty dot / X) **but no shared icon, no presence avatars**. V3 docs are personal.

### `V3TabBar`
- Height 30 px, `chromeD` background.
- **Plan chip** ("FREE") sits next to the logo: 10 px uppercase, weight 700, `1 px 6 px` pill on chrome bg with 1 px border.
- Right region: user email (11.5 px muted) + 20 px avatar.

### `V3MenuStrip`
- **28 px tall** (lighter than V2's 30 px). Item font-size 12.5.
- Active item gets chrome bg + side 1 px borders + a `margin-bottom: -1 px` to merge with the dropdown. **No top accent stripe** (the stripe is on the dropdown's top edge instead).
- Right region: a small "guardado" pill (emerald cloud-check + label) and a `⌘K` chip. **No big "Compartir" CTA** — sharing is in the menu only.

### `V3MenuSheet` (narrow anchored dropdown)
- **Position**: absolute, `top = 30 (tab bar) + 28 (menu strip) = 58`, `left = m.anchor`, `width = m.width`. Anchor + width are stored per menu in `V3_MENUS`:

  | id        | width | anchor |
  |---        |---:   |---:    |
  | archivo   | 260   | 6      |
  | editar    | 240   | 80     |
  | buscar    | 260   | 146    |
  | compartir | 300   | 214    |
  | ver       | 250   | 304    |
  | ayuda     | 230   | 358    |
- **Visuals**: white bg, 1 px `border`, **2 px `accent` top border**, `0 6 px 6 px 6 px` radius (sharp top-left to point at the strip item), shadow `0 10px 24px -8px rgba(15,23,42,0.22), 0 2px 4px rgba(15,23,42,0.05)`, 4 px vertical padding.
- Sections use a `V3MSection` (optional uppercase column header) and `V3MDivider` (1 px chrome line, 2 px vertical margin, 6 px horizontal inset).

### `V3MItem`
- Grid `16 px / 1 fr / auto`, gap 9 px, padding `5 px 10 px`, 4 px radius.
- Label: 12.5 / 600. Sub: 10.5 / muted. Shortcut: 10 / mono / ink3.
- Selected (`on`): `accentSoft` bg, `accentDeep` icon.
- Variants: `accent` (icon green), `danger` (label red).

### `V3FormatPill`
- Inline-flex, gap 5, uppercase, 700/800 weight, letter-spacing 0.2.
- Format-specific `bg` + `fg` (text) + `dot` colors from `V3_FORMATS` (see "Design tokens" below).
- The dot is 6 × 6 with a 1.5 px ring in the pill bg color (so it pops off both pill and surrounding chrome).
- Sizes: `s` (1×6 pad, 10 px, 3 px radius), `m` (2×8 pad, 11 px, 4 px radius), `l` (3×10 pad, 12 px, 5 px radius).

### `V3EditorHeader`
- Horizontal bar between menu strip and editor body, 30 px tall, white bg, 1 px bottom border.
- Contents (left → right): filename (13.5 / 800, letter-spacing −0.2) · format pill (size m) · muted "· detectado automáticamente" → flex spacer → "Formatear" button → panel-toggle segmented control (only rendered when `fmt.panel` exists).
- Panel toggle: 22 px tall, 1 px bordered group with two segments: "Solo editor" (default) and either "Vista previa" (for MD) or "Árbol" (for JSON). The active segment fills with `accentSoft` and text in `accentDeep`.

### `V3RightPanel`
- 290 px wide, 1 px left border, full-height column.
- Header: 28 px tall, `chromeD` bg, icon + title + muted sub-title + (for tree only) "5 / 12" chip + close X.
- Body: `V3RightPanelTree` for JSON, `V3MdPreview` for Markdown.
- Footer hint: chromeD bg, info icon + 10.5 px muted helper text.

### `V3TreeNode`
- Per-row indent: `8 + depth * 12 px`.
- Containers show a `chev` (rotated −90° when collapsed).
- 16 × 14 type-glyph chip uses the type's color at 8 % alpha bg + full-color text, 3 px radius, 9 px / 800 font.
- Selected (`highlight: true`) row: `accentSoft` bg + 2 px `accent` left border.

### `V3StatusBar`
- **22 px tall** (V2 is 24 — V3 even lighter). chromeD bg, 1 px top border, 10 px gap, 11.5 px font.
- Layout: save pill → `|` → `L <line> : <col>` → flex spacer → format pill (small) → "· N palabras · N car." → `· UTF-8`. **No "viewers" count, no Git/branch chip, no notification bell.**

### Reused from V2
- `N2Avatar` — only as the user's own avatar in the tab bar. No remote cursors, no collaborator stacks anywhere.
- `N2_BADGES` (file-extension chips).
- `N2I` icon set.

---

## Interactions & behavior

### Login
- Clicking a primary auth button opens the provider OAuth flow in a popup. On success: close popup, swap UI to the editor with `localStorage.lastTab` restored.
- "Continuar como invitado" creates an anonymous session backed by IndexedDB only — never syncs to the server. Show a banner ("Tus notas viven en este navegador · inicia sesión para sincronizar") in the menu strip for guests.
- "Inicia sesión" link toggles the form to a sign-in mode (not designed) — `/login` route in your app.

### Tabs
- `⌘T` opens a fresh note (filename auto-generated: `nota-3.txt`). `⌘W` closes the active tab.
- `⌘1..⌘9` jumps to that tab.
- Drag-reorder is in-scope.
- Clicking the X on an unsaved tab opens a small inline confirm above the tab ("¿Cerrar sin guardar?") — not modal.

### Menu strip
- Click an item → its sheet opens **below** it. Click another item with a sheet open → swap (no close animation). Click outside or press `Esc` → close. While open, the editor body and editor header dim to `opacity: 0.55` (180 ms transition).
- Hover on a strip item with no sheet open: bg goes to `chrome` (subtle preview of the active state).
- `⌘K` opens a command palette (not designed) — same vocabulary as the menus.

### Editor
- Caret blink: 1.05 s (`@keyframes njBlink` `steps(2, end) infinite`).
- Current line: pale `#f8fafc` bg + 2 px `accent` left border.
- Auto-save: 400 ms debounce after the last keystroke; while in flight the "guardado" chips swap to "guardando…" (and the cloud-check glyph swaps to `cloudUp`); on success they revert and the status bar updates the relative time.
- Plain text mode (`fmt.highlight === false`, e.g. `.txt`) renders rows as plain strings with the caret split in two text runs.
- Tokenized mode walks `raw: Array<string | [type, text]>` and colors each segment per the `V3_SYN` palette (see tokens).

### Format detection
- `v3DetectFormat(name)` parses the extension and returns one of the entries in `V3_FORMATS`. Unknown extensions fall back to `txt` (plain text, no highlight, no panel).
- Format change is purely passive — the user does not pick a language. Renaming a tab `.json → .txt` immediately drops the highlight + hides the right panel.

### Right panel
- For JSON: panel default is collapsed at depth ≥ 3. Clicking a chev expands/collapses one level. Clicking on a row scrolls the editor caret to that line.
- For Markdown: live re-render on every keystroke (throttled to 60 fps). `⌘⇧V` toggles it open/closed.
- For other formats: no panel; the editor header's segmented control is hidden.

### Compartir (pastebin link)
- The sheet's primary state is **link-not-yet-created**. After clicking "Crear enlace público", the layout swaps to show the link in a chrome row with a "copiar" link and a "Revocar enlace" destructive button below the options.
- Caducidad chip opens a small in-sheet popover with presets (1 hora · 1 día · 7 días · 30 días · sin caducidad).
- Toggling "Proteger con contraseña" inserts a small password input row below it.
- Permission pills are mutually exclusive — they are radio-buttons styled as segmented pills.
- The link, once created, is publicly accessible at `notes.js/p/<token>`. The public viewer is **read-only** and does not need a notes.js account — it's a literal pastebin page (not designed; out of scope for this handoff).

### Ver — theme picker
- Click a chip → apply theme instantly, do not close the sheet (so the user sees both light + dark previews next to each other while choosing).
- "Auto" follows `prefers-color-scheme`.

### Ayuda — Pro CTA
- Card click → opens `/upgrade` in a new tab (or your in-app upgrade modal). The CTA is **soft** — never an interstitial, never a banner inside the editor.

---

## State management

```ts
type AuthState =
  | { kind: 'anonymous' }                                           // guest, IndexedDB only
  | { kind: 'authenticated'; provider: 'google'|'github'|'email'; user: User };

type User = {
  id: string;
  initials: string;
  name: string;
  email: string;
  plan: 'free' | 'pro';   // V3 viewer caps to 'free'
};

type Doc = {
  id: string;
  name: string;
  ext: 'js'|'jsx'|'ts'|'json'|'xml'|'yml'|'md'|'css'|'html'|'txt';
  content: string;
  dirty: boolean;
  lastSavedAt: number | null;     // null for guest docs
  publicLink: {
    token: string;
    expiresAt: number | null;     // null = never
    password: string | null;
    permission: 'view' | 'view+download';
    createdAt: number;
  } | null;
};

type UIState = {
  openTabs: string[];
  activeTabId: string;
  openMenuId: null | 'archivo' | 'editar' | 'buscar' | 'compartir' | 'ver' | 'ayuda';
  rightPanel: null | 'tree' | 'preview';   // only valid when current doc supports it
  theme: 'light' | 'dark' | 'auto';
  editor: {
    showLineNumbers: boolean;
    showMinimap: boolean;
    wrap: boolean;
    fontSize: number;            // 10..24, default 14
  };
};
```

### Transitions
- **Save**: same as V2 — 400 ms debounce after the last edit. For anonymous users, write to IndexedDB only.
- **Format detect**: derived from `Doc.name` at every read; no separate state.
- **Right panel**: closed by default; turning on inherits the current doc's `fmt.panel` value. Switching tabs to a doc whose format does not match the open panel hides the panel (does not error).
- **Public link**: creating posts `{ permission, expiresAt, password }` to `POST /docs/:id/share` and stores the returned token under `Doc.publicLink`. Revoking is `DELETE /docs/:id/share`.

### Data fetching
- On boot: `/me` then `/docs/recent` (max 12, used in Archivo).
- Tabs do not need an open WebSocket in V3 (no collaboration).

---

## Design tokens

V3 reuses the same color tokens as V2 (`N2` object) so the brand stays consistent across tiers. The set below is the V3-relevant subset; the full token table is in the V2 handoff if you need it.

### Color (shared with V2)

| Token | Hex | Use |
|---|---|---|
| `ink` | `#111827` | Primary text |
| `ink2` | `#374151` | Secondary text, icons |
| `ink3` | `#6b7280` | Tertiary text, column headers |
| `muted` | `#9ca3af` | Placeholder text, disabled labels |
| `bg` | `#ffffff` | Editor surface, primary white |
| `chrome` | `#f7f7f9` | Tab bar (V2) / strip activations, sheet bg surfaces |
| `chromeD` | `#eef0f3` | Tab bar (V3), status bar, right-panel header/footer |
| `chromeDD` | `#e5e7eb` | Inactive toggle track |
| `border` | `#e5e7eb` | 1 px dividers |
| `borderD` | `#d1d5db` | Stronger borders, status-bar separators |
| `accent` | `#10b981` | Emerald — primary action, sync ok |
| `accentDeep` | `#047857` | Dark emerald — pill text, links, hover |
| `accentSoft` | `#ecfdf5` | Emerald tint — selected items, Pro CTA card |
| `accentBorder` | `#a7f3d0` | Pill borders, Pro CTA border |
| `err` | `#ef4444` | Destructive items |

### Syntax highlight tokens (editor, shared with V2)

| Token | Hex | Meaning |
|---|---|---|
| `kw` | `#0369a1` | Keyword (blue) |
| `fn` | `#7c3aed` | Function (violet) |
| `st` | `#b45309` | String (amber) |
| `va` | `#111827` | Variable / identifier |
| `pa` | `#374151` | Parameter |
| `cm` | `#94a3b8` | Comment (italic) |
| `nu` | `#dc2626` | Number |
| `bl` | `#16a34a` | Boolean / null |
| `pu` | `#6b7280` | Punctuation |
| `key` | `#0e7490` | JSON key (teal) |

### Format pills (V3-specific)

Defined in `V3_FORMATS` in `notesjs-v3-formats.jsx`. Each has `bg` (pill fill), `fg` (pill text), `dot` (the 6 px dot leading the label).

| Ext | Label | Short | bg | fg | dot | Right panel |
|---|---|---|---|---|---|---|
| js | JavaScript | JS | `#fef3c7` | `#854d0e` | `#eab308` | — |
| jsx | JSX | JSX | `#dbeafe` | `#1e40af` | `#3b82f6` | — |
| ts | TypeScript | TS | `#dbeafe` | `#1e3a8a` | `#2563eb` | — |
| json | JSON | JSON | `#fed7aa` | `#7c2d12` | `#f97316` | `tree` |
| xml | XML | XML | `#fecaca` | `#7f1d1d` | `#ef4444` | `tree` |
| yml | YAML | YML | `#dcfce7` | `#14532d` | `#22c55e` | `tree` |
| md | Markdown | MD | `#ede9fe` | `#5b21b6` | `#8b5cf6` | `preview` |
| css | CSS | CSS | `#e9d5ff` | `#581c87` | `#a855f7` | — |
| html | HTML | HTML | `#ffe4e6` | `#9f1239` | `#f43f5e` | — |
| txt | Texto plano | TXT | `#e5e7eb` | `#374151` | `#6b7280` | — |

### Tree-node type glyphs

| Type | Symbol | Color |
|---|---|---|
| object | `{}` | `#0369a1` |
| array | `[]` | `#7c3aed` |
| string | `"a` | `#b45309` |
| number | `#` | `#dc2626` |
| bool | `✓` | `#16a34a` |
| null | `∅` | `#6b7280` |

The chip bg is the color at ~8 % alpha (`<hex>14`), text is full color.

### Typography

| Token | Stack | Use |
|---|---|---|
| UI | `"Nunito", "Nunito Sans", system-ui, -apple-system, "Segoe UI", sans-serif` | Everything except code |
| Mono | `"JetBrains Mono", "Fira Code", ui-monospace, monospace` | Editor body, tree, file-ext badges, shortcut chips, line-col |

V3 size scale (slightly more compact than V2):

| Use | px | weight | notes |
|---|---|---|---|
| Login headline | 28 then 26 | 800 | letter-spacing −0.6 |
| Login card title | 17 | 800 | letter-spacing −0.2 |
| Login button | 13.5 | 700 | sub line 11.5 / 500 |
| Tab label active | 13 | 700 | |
| Tab label inactive | 13 | 500 | |
| Menu strip | 12.5 | 600 / 700 active | |
| Menu item label | 12.5 | 600 | |
| Editor header filename | 13.5 | 800 | letter-spacing −0.2 |
| Editor code | 13.5 | 400 | line-height 1.65 |
| Format pill (size m) | 11 | 800 | uppercase, letter-spacing 0.2 |
| Tree row | 11.5 | 600 | mono |
| Status bar | 11.5 | 400 | save pill is 600 |
| Column header | 10 | 700 | uppercase, letter-spacing 0.8 |
| Shortcut chip | 10 | 400 | mono |
| Tab ext badge | 9.5 | 700 | mono, uppercase |

### Radii

| Token | px | Use |
|---|---|---|
| `r-xs` | 3 | Shortcut chips, ext badges, tree-node glyph chips |
| `r-sm` | 4 | Editor-header buttons, segmented toggle, menu items, plan chip |
| `r-md` | 5 | Search inputs, link row, CTA buttons |
| `r-lg` | 6 | Menu sheet (with `0 6 6 6` corners), right-panel border accents |
| `r-xl` | 7 | Login auth buttons |
| `r-xxl` | 12 | Login card |
| `r-pill` | 999 | "guardado" pill, plan chip, permission pills, toggle tracks |
| `r-circle` | 50 % | Avatar, dirty dot, online dot, slider thumb |

### Shadows

| Token | CSS | Use |
|---|---|---|
| `sh-login-card` | `0 12px 30px -12px rgba(15,23,42,0.18), 0 2px 4px rgba(15,23,42,0.04)` | Login card |
| `sh-button-primary` | `0 1px 0 rgba(0,0,0,0.04), 0 1px 2px rgba(16,185,129,0.25)` | Primary auth button |
| `sh-button-default` | `0 1px 0 rgba(0,0,0,0.02)` | Default + ghost auth buttons |
| `sh-sheet` | `0 10px 24px -8px rgba(15,23,42,0.22), 0 2px 4px rgba(15,23,42,0.05)` | V3 menu sheet |

---

## Assets

- **Fonts**: Google Fonts — Nunito (400 / 500 / 600 / 700 / 800) and JetBrains Mono (400 / 500 / 600 / 700). Self-host or subset to Latin for production.
- **Icons**: same line-icon family as V2, defined in `notesjs-shared-primitives.jsx` as `N2I`. All 24 × 24 viewBox, stroke 1.6 (configurable), `round` caps/joins, fill `none`.
- **Provider logos** (Google + GitHub): inline multi-fill SVGs in `notesjs-v3.jsx`. Use real brand-asset versions from each provider's brand-guideline page in production — the prototype uses simplified marks.
- **Images**: none.

---

## Responsive behavior

The prototype was designed at **1280 × 680**. V3 is the tier that **should work on mobile** (notepad replacement is a mobile use-case).

Suggested breakpoints:
- ≥ 1024: as designed.
- 768–1024 (tablet): keep the tab bar + menu strip; right panel becomes an overlay sliding from the right; sheets stay anchored.
- < 768 (phone): collapse the menu strip into a single `≡` button (opens a full-screen menu). Tab bar becomes a horizontal scroller with smaller tabs. Status bar collapses to "guardado" + line:col only. Right panels become full-screen views with a back arrow.

The login screen is responsive natively: at < 720 wide, drop the left pitch column and stack only the auth card.

---

## Open questions for the implementer

1. **Anonymous storage limits** — IndexedDB realistically holds a few MB. What happens when a guest hits the limit? Suggested: a non-blocking warning that points to sign-up.
2. **Public viewer page** (`notes.js/p/<token>`) was not designed — it's a separate route. Likely a stripped editor with no chrome + a "Hecho con notes.js" badge.
3. **Password-protected links** — flow not designed. Server-side, store a bcrypt-hashed password; the public page shows a password gate before the content.
4. **Format auto-detection by content** vs. **by extension** — V3 uses extension only. If a user pastes JSON into a `.txt` file, do we promote it? Open question.
5. **Pricing / upgrade path** — the Pro CTA points to V2. The `/upgrade` page is out of scope.
6. **Print** — `⌘P` is in Archivo but the print stylesheet was not specified. Use the system print dialog with a stripped editor view.

---

## How to preview

Open `preview.html` in a modern browser. It loads React 18 + Babel via CDN and renders the 11 V3 artboards inside a pan/zoom canvas (mouse drag to pan, ⌘/Ctrl + scroll to zoom, click an artboard label to focus it fullscreen). The canvas itself is not part of the product — it is only there to view multiple artboards at once.
