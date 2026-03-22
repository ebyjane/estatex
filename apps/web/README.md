# Investify Web (`@real-estate/web`)

Next.js 14 (App Router) + Tailwind. Dev server: **port 3002** (`npm run dev`).

## Unstyled page + many `/_next/...` 404s in the console

This almost always means **stale or mixed `.next` output** — for example you ran `next build` (production) and then `next dev` without clearing the cache. The HTML asks for dev chunk names like `main-app.js` and `css/app/layout.css`, but the server cannot resolve them while old **hashed** production chunks sit in `.next/static`.

**Fix:**

1. Stop the dev server (Ctrl+C).
2. From the repo root:

   ```bash
   npm run dev:web:clean
   ```

   Or from `apps/web`:

   ```bash
   npm run dev:clean
   ```

3. Hard-refresh the browser (Ctrl+Shift+R) or use a private window.

**Avoid:** Running `next start` (production) and `next dev` against the same `apps/web/.next` folder without a clean in between.

**Automatic guard:** `npm run build` (in this package) runs `postbuild`, which drops a flag file. The next `npm run dev` runs `predev` and **deletes `.next` once** so dev compiles from scratch. `predev` also detects **production-only chunk names** on disk (`webpack-*.js` / `main-app-*.js` without plain `webpack.js` / `main-app.js`) and clears `.next` — that mismatch is what causes **`webpack.js` / `main-app.js` 404** in the console.

Use **`npm run dev`** (not raw `npx next dev` alone) from `apps/web` or `-w @real-estate/web` so `predev` runs. If you still see 404s, run `npm run dev:clean` once.

## `Cannot find module '...middleware-manifest.json'`

That file lives under `apps/web/.next/server/`. It goes missing when **`.next` is deleted or partially updated while `next dev` is still running** (e.g. `npm run clean` in another terminal). The old dev process then serves against a broken cache.

**Fix:** Stop every dev server using port **3002**, run `npm run clean -w @real-estate/web`, start `npm run dev -w @real-estate/web`, and wait until the terminal shows **Ready** before loading a page.

This app includes a minimal `src/middleware.ts` (pass-through) so Next always generates a middleware manifest on compile.

## Scripts

| Script        | Purpose                                      |
|---------------|----------------------------------------------|
| `npm run dev` | Dev server on **:3002** (`predev` sanitizes `.next`) |
| `npm run dev:clean` | Delete `.next` + cache, then dev        |
| `npm run dev:alt` | Dev on **:3005** if **:3002** is stuck (`EADDRINUSE`) |
| `npm run smoke` | HTTP smoke: `/`, `/login?next=/admin`, `/admin` (set `SMOKE_BASE`) |
| `npm run build`   | Production build (then use `next start`) |

## `500` on `/_next/static/chunks/*` (unstyled page, stuck on “Restoring session…”)

Often caused by **zustand `persist` hydrating during SSR**: we use **`persistWebStorage`** (no `localStorage` on the server) plus **`skipHydration: true`** and **`ZustandRehydrateClient`** so rehydration runs only in the browser after mount. If you still see 500s, stop dev, run **`npm run dev:web:clean`**, then reload.

Root layout uses **system UI fonts** (no `next/font/google`) so home and other routes do not depend on reaching Google’s font API during compile or request.

## Blank page + console shows `chunks/fallback/*.js` with 500

The document request is failing and the dev client falls back to error recovery chunks. **Stop every Node process bound to port 3002** (old broken servers keep serving bad `.next`), then from `apps/web` run **`npm run dev:clean`**. If `EADDRINUSE` appears, something is still on 3002 — close it or use **`npm run dev:alt`** (port **3005**).

## Smoke test (login + admin)

With dev running:

```bash
# default base http://127.0.0.1:3002
npm run smoke --workspace=@real-estate/web

# or another port
set SMOKE_BASE=http://127.0.0.1:3005&& npm run smoke --workspace=@real-estate/web
```

(PowerShell: `$env:SMOKE_BASE='http://127.0.0.1:3005'; npm run smoke -w @real-estate/web`)

## Environment

Copy `.env.example` → `.env.local`. Important vars: `NEXT_PUBLIC_API_URL`, optional `NEXT_PUBLIC_MAPBOX_TOKEN`.
