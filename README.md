# notes.js

A lightweight, in-browser code & notes editor — a Notepad++-style scratchpad that lives in your browser. Open it anywhere, jot down code, logs, JSON or Markdown, and (optionally) sign in to sync everything across your devices.

**Live:** https://notesjs.pages.dev · custom domain `notes.js.org` coming soon

---

## Features

- **Multi-tab editor** powered by [CodeMirror 6](https://codemirror.net/) with syntax highlighting for JavaScript/TypeScript, Python, Java, Rust, SQL, HTML, CSS, XML, Markdown and JSON.
- **One-click formatting** with [Prettier](https://prettier.io/) (plus native JSON & XML pretty-printing) and a minify action.
- **JSON tree viewer** and **live Markdown preview** in a side panel.
- **Paste detection** — auto-detects the language of pasted content and formats it.
- **Two ways to use it:**
  - **Guest mode** — 100% local (IndexedDB), no account needed. Your notes never leave your browser.
  - **Signed in** (Google or GitHub) — your files sync to the cloud and open as tabs on any device.
- **Public share links** with optional password protection and expiry.
- **Trash** with restore (7-day window).
- **Light / dark / auto** themes and adjustable font size, line numbers and wrapping.
- **Autosave** — there's no save button; your work is persisted as you type.

> Some menu actions (search & replace, clipboard helpers, download, etc.) are marked **beta** in the UI and still in development.

## Tech stack

| Layer | Choice |
|-------|--------|
| Language | TypeScript (strict) |
| Build | Vite 8 |
| UI | React 19 + React Router 7 |
| Editor | CodeMirror 6 |
| State | Zustand 5 |
| Backend | Supabase (Postgres + Auth + RLS, pgcrypto) |
| Local storage (guest) | IndexedDB (`idb`) |
| Testing | Vitest + Testing Library |
| Hosting | Cloudflare Pages |

## Getting started

### Prerequisites
- Node.js 20.19+ or 22.12+ (Vite 8 requirement)
- A [Supabase](https://supabase.com/) project (free tier is enough)

### Install
```bash
git clone https://github.com/hberdon/notesjs.git
cd notesjs
npm install
```

### Configure
Copy the example env file and fill in your Supabase project values:
```bash
cp .env.example .env
```
```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```
Both come from your Supabase dashboard → **Project Settings → API**.

### Set up the database
Apply the SQL migrations to your Supabase project (in order):
- `supabase/migrations/001_files.sql`
- `supabase/migrations/002_trash.sql`

See [`supabase/DEPLOY.md`](supabase/DEPLOY.md) for the full backend setup, including OAuth providers and RLS notes.

### Run
```bash
npm run dev        # dev server at http://localhost:5174
npm run build      # production build to dist/
npm run preview    # preview the production build
npm test           # unit tests (Vitest)
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
```

## Project structure

```
src/
  features/
    auth/         # sign-in, OAuth callback, auth store
    editor/       # the editor page, tabs, menus, panels
    preferences/  # settings page
  store/          # Zustand stores (tabs, files, UI, theme, editor content)
  lib/            # Supabase client, CodeMirror setup, formatter, guest IndexedDB
  shared/         # shared types, utils, components
supabase/         # SQL migrations + deploy notes
```

## How it works

- **Guest data** lives in IndexedDB and is restored on reload — it's per-browser and never uploaded.
- **Signed-in data** lives in Supabase. On login, every non-deleted file opens as a tab (content is loaded lazily on first activation), so your files are reachable from any device — Supabase is the single source of truth.
- **Sharing** is served by a `SECURITY DEFINER` RPC so public links work without exposing the underlying tables; passwords are hashed server-side with pgcrypto.

## Deployment

The app is a static SPA deployed on **Cloudflare Pages** (`notesjs.pages.dev`). The public domain `notes.js.org` is provided by [js.org](https://js.org/) and added to the Pages project as a custom domain.

## License

[MIT](LICENSE) © 2026 Hugo Berdón
