# PostgreSQL / Supabase setup

The API uses **PostgreSQL only** (no SQLite). [Supabase](https://supabase.com) provides a managed Postgres instance and optional JS client for Storage and other features.

## 1. Create a Supabase project

1. New project → note the **database password**.
2. **Project Settings → Database → Connection string → URI**  
   Copy the `postgresql://...` string as `DATABASE_URL`.

Use **SSL** (default). The API enables TLS for hosts like `*.supabase.co`.

## 2. Environment variables (API)

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | **Yes** (recommended) | Full Postgres connection URI |
| `JWT_SECRET` | Production | Secret for signing access tokens |
| `DATABASE_SYNC` | First deploy | Set `true` once to let TypeORM create tables on an empty DB, then set `false` and rely on migrations for changes |
| `SUPABASE_URL` | No | Project URL, for `@supabase/supabase-js` |
| `SUPABASE_SERVICE_ROLE_KEY` | No | Server-only; never expose to browsers |

If `DATABASE_URL` is not set, the API falls back to `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` (e.g. local Docker).

## 3. Seed data

From the **repo root** (with `DATABASE_URL` pointing at your Supabase DB):

```bash
npm run build -w @real-estate/shared
npm run seed:data
```

This runs `scripts/seed-postgres.ts`: creates schema (unless `SEED_SYNC=false`), truncates core tables, inserts countries, admin user (`admin@estatex.ai` / `admin123`), and demo properties.

## 4. Serverless / connection pooling

- The **Nest API** is usually deployed as a **long-lived** Node process (Railway, Fly.io, Render, Docker, etc.). Use the standard **direct** Postgres port **5432** connection string.
- If you run DB-heavy work on **serverless functions**, use Supabase **Supavisor** “Transaction” pooler URL when Supabase provides it, and keep `DB_POOL_MAX` small.

## 5. Tables

TypeORM entities define the schema (`users`, `properties`, `property_images`, `countries`, `leads`, `seo_pages`, `app_settings`, `investments`).  
`investments` links users to properties for tracked deals.

## 6. Auth

Login uses **TypeORM** + `users.password_hash` (bcrypt). It does **not** use Supabase Auth unless you add that separately; `SUPABASE_SERVICE_ROLE_KEY` is optional for other Supabase features.
