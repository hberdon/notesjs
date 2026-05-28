# Supabase — Guía de despliegue

## 1. Crear proyecto en Supabase

1. Entra en [supabase.com](https://supabase.com) y crea un nuevo proyecto.
2. Anota la **Project URL** y la **anon public key** (Settings → API).

---

## 2. Aplicar el schema

Todo el schema está en un único archivo: `supabase/migrations/001_files.sql`.

### Opción A — SQL Editor (recomendado para primer despliegue)

1. Ve a **SQL Editor** en el dashboard de Supabase.
2. Pega y ejecuta el contenido de `supabase/migrations/001_files.sql`.

El script es idempotente (`CREATE TABLE IF NOT EXISTS`) y crea:
- Tabla `files` con RLS — cada usuario solo accede a sus archivos.
- Trigger `updated_at` en `files`.
- Tabla `public_links` con RLS:
  - `owner_all` — el propietario gestiona sus propios links.
  - `public_read` — cualquiera puede leer links **no expirados** (`expires_at IS NULL OR expires_at > now()`).
  - `public_read_via_link` en `files` — lectura anónima de un archivo solo si existe un link público válido para él.

### Opción B — Supabase CLI

```bash
supabase login
supabase link --project-ref <project-ref>
supabase db push
```

> `project-ref` es el ID del proyecto (Settings → General).

---

## 3. Configurar Google OAuth

1. Crea credenciales OAuth 2.0 en [Google Cloud Console](https://console.cloud.google.com):
   - **Authorized redirect URIs**: `https://<project-ref>.supabase.co/auth/v1/callback`
2. En Supabase → **Authentication → Providers → Google**:
   - Pega el **Client ID** y **Client Secret**.
3. En Supabase → **Authentication → URL Configuration**:
   - **Site URL**: URL de producción (p. ej. `https://notesjs.vercel.app`)
   - **Redirect URLs**: `https://notesjs.vercel.app/auth/callback`

> Para desarrollo local añade también `http://localhost:5174` y `http://localhost:5174/auth/callback`.

---

## 4. Variables de entorno

Crea un archivo de variables locales en la raíz (no commitear) con estas dos claves:

```
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-public-key>
```

Para Vercel: **Settings → Environment Variables**, añade las mismas dos variables.

---

## 5. Configuración de auth en producción

En `src/lib/supabase.ts`, el cliente usa `flowType: 'implicit'`.

Para producción, cambia a PKCE (más seguro):

```ts
auth: {
  detectSessionInUrl: true,
  persistSession: true,
  autoRefreshToken: true,
  flowType: 'pkce',  // cambiar de 'implicit'
},
```

> `implicit` se usa en local porque el Supabase CLI local no gestiona PKCE correctamente.
> En producción con el proyecto hosteado, PKCE funciona sin problemas.

---

## 6. Desarrollo local con Supabase CLI

```bash
supabase start          # Levanta Postgres + Auth + Studio en local
supabase db reset       # Aplica migrations desde cero (útil al cambiar el schema)
supabase stop           # Para los contenedores
```

Al ejecutar `supabase start`, el CLI imprime la URL local y la anon key para usar en el archivo de variables de entorno local. Studio queda disponible en `localhost:54323`.

---

## 7. Despliegue en Vercel

```bash
vercel --prod
```

O conecta el repositorio en el dashboard de Vercel para CI/CD automático desde `main`.

Asegúrate de que `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` estén configuradas en Vercel antes del primer deploy.
