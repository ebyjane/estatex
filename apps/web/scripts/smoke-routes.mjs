/**
 * Smoke-test critical routes (run while dev or `next start` is up).
 * Usage:
 *   SMOKE_BASE=http://127.0.0.1:3002 node scripts/smoke-routes.mjs
 *   npm run smoke --workspace=@real-estate/web
 */
const base = (process.env.SMOKE_BASE || 'http://127.0.0.1:3002').replace(/\/$/, '');

const routes = [
  ['/', 'home'],
  ['/login?next=%2Fadmin', 'login (admin redirect)'],
  ['/admin', 'admin shell'],
  ['/properties', 'properties list'],
  ['/properties?country=IND&view=map', 'properties map view'],
  ['/calculator', 'calculator'],
  ['/post-property', 'post property'],
  ['/property/00000000-0000-0000-0000-000000000001', 'property detail shell'],
];

let failed = false;
for (const [path, label] of routes) {
  const url = `${base}${path}`;
  try {
    const res = await fetch(url, { redirect: 'manual' });
    const ok = res.status >= 200 && res.status < 400;
    const text = ok ? '' : await res.text();
    if (!ok) {
      console.error(`FAIL ${label}: ${res.status} ${url}`);
      if (text && text.length < 500) console.error(text.slice(0, 500));
      failed = true;
    } else {
      console.log(`OK   ${label}: ${res.status} ${url}`);
    }
    if (ok) {
      const ct = res.headers.get('content-type') || '';
      if (!ct.includes('text/html')) {
        console.warn(`WARN ${label}: expected text/html, got ${ct}`);
      }
    }
  } catch (e) {
    console.error(`FAIL ${label}: ${e.message} (${url})`);
    failed = true;
  }
}

const apiBase = (process.env.SMOKE_API || 'http://localhost:8000/api/v1').replace(/\/$/, '');
{
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), 5000);
  try {
    const res = await fetch(`${apiBase}/health`, { signal: ac.signal });
    if (res.ok) {
      const j = await res.json();
      console.log(`OK   API health: ${res.status} ${JSON.stringify(j)}`);
    } else {
      console.warn(`WARN API health: ${res.status} ${apiBase}/health (optional — start API on :8000)`);
    }
  } catch (e) {
    console.warn(`WARN API health: ${e.message} (optional — start API on :8000)`);
  } finally {
    clearTimeout(t);
  }
}

if (failed) {
  console.error('\nSmoke failed. Is the server running? Try: npm run dev:web:clean from repo root');
  process.exit(1);
}
