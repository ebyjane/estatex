# Investify — Setup and Run

## Quick Start

### 1. Start Database
```bash
npm run docker:up
```

### 2. Populate Data (if empty)
```bash
npm run generate-data
```
Creates 10,000 properties (4K India, 3K Dubai, 3K Texas) with images.

### 3. Start API
```bash
npm run dev:api
```
Runs at http://localhost:4000/api/v1

### 4. Start Web
```bash
npm run dev:web
```
Runs at http://localhost:3002

### 5. Optional: Mapbox Token
For live map on landing + properties map view:
1. Get free token at https://account.mapbox.com/access-tokens/
2. Add to `apps/web/.env.local`:
   ```
   NEXT_PUBLIC_MAPBOX_TOKEN=pk.your-token-here
   ```
3. Restart web server

## Environment

- **API** (`apps/api/.env`): DB_PORT=5434, CORS includes localhost:3002
- **Web** (`apps/web/.env.local`): NEXT_PUBLIC_API_URL, NEXT_PUBLIC_MAPBOX_TOKEN

## Pages to Test

- http://localhost:3002 — Landing
- http://localhost:3002/properties — Grid (20K properties)
- http://localhost:3002/properties?view=map — Map view
- http://localhost:3002/calculator — Rent vs Buy
- http://localhost:3002/compare — Compare properties
- http://localhost:3002/admin — Admin (stats, CSV upload, manual add)
- http://localhost:3002/login — Sign in
- http://localhost:3002/register — Create account

## Admin Login (after seed)

```bash
npm run seed-admin
```

Then: **admin@investify.com** / **admin123**
