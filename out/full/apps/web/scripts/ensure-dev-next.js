/**
 * Clears apps/web/.next when it was produced by `next build` (or flagged post-build).
 * Mixing production output with `next dev` causes HTML to reference chunk URLs that 404
 * (unstyled pages, broken App Router).
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const nextDir = path.join(root, '.next');
const flag = path.join(root, '.need-clean-before-dev');

if (process.env.FORCE_NEXT_CLEAN === '1') {
  try {
    fs.rmSync(nextDir, { recursive: true, force: true });
    console.log('[@real-estate/web] FORCE_NEXT_CLEAN=1 — removed .next');
  } catch (e) {
    console.warn('[@real-estate/web] FORCE_NEXT_CLEAN: could not remove .next:', e.message);
  }
}

function rmNext() {
  try {
    fs.rmSync(nextDir, { recursive: true, force: true });
    console.log('[@real-estate/web] Removed .next for a clean dev compile.');
  } catch (e) {
    console.warn('[@real-estate/web] Could not remove .next:', e.message);
  }
}

if (fs.existsSync(flag)) {
  console.log('[@real-estate/web] Production build detected — resetting .next before dev.');
  rmNext();
  try {
    fs.unlinkSync(flag);
  } catch {
    /* ignore */
  }
}

/**
 * `next build` writes hashed chunks (`webpack-abc123.js`, `main-app-abc123.js`).
 * `next dev` expects plain `webpack.js` + `main-app.js`. If those are missing but hashed
 * files exist, the browser gets 404 on core bundles (even if HTML/CSS partially loads).
 */
const chunksDir = path.join(nextDir, 'static', 'chunks');
if (fs.existsSync(chunksDir)) {
  let files;
  try {
    files = fs.readdirSync(chunksDir);
  } catch {
    files = [];
  }
  const hasPlainWebpack = fs.existsSync(path.join(chunksDir, 'webpack.js'));
  const hasPlainMainApp = fs.existsSync(path.join(chunksDir, 'main-app.js'));
  const hasHashedWebpack = files.some((f) => /^webpack-[a-f0-9]+\.js$/i.test(f));
  const hasHashedMainApp = files.some((f) => /^main-app-[a-f0-9]+\.js$/i.test(f));
  const looksLikeProdOnly =
    (hasHashedWebpack && !hasPlainWebpack) || (hasHashedMainApp && !hasPlainMainApp);
  if (looksLikeProdOnly) {
    console.log(
      '[@real-estate/web] Production build chunks mixed with dev (e.g. main-app-[hash].js but no main-app.js) — clearing .next before dev.',
    );
    rmNext();
  }
}

/**
 * After a hard crash or mixed build, `.next/static/chunks/fallback/*` may exist while
 * normal dev entrypoints (`webpack.js`, `main-app.js`) are missing — browser then loads
 * fallback bundles and routes 500 (incl. /calculator). Nuke cache so the next compile is clean.
 */
if (fs.existsSync(chunksDir)) {
  const hasPlainWebpack = fs.existsSync(path.join(chunksDir, 'webpack.js'));
  const hasPlainMainApp = fs.existsSync(path.join(chunksDir, 'main-app.js'));
  const fallbackDir = path.join(chunksDir, 'fallback');
  let fallbackJs = false;
  if (fs.existsSync(fallbackDir)) {
    try {
      fallbackJs = fs.readdirSync(fallbackDir).some((f) => f.endsWith('.js'));
    } catch {
      fallbackJs = false;
    }
  }
  const fallbackWebpack = path.join(fallbackDir, 'webpack.js');
  if (
    (fs.existsSync(fallbackWebpack) || fallbackJs) &&
    (!hasPlainWebpack || !hasPlainMainApp)
  ) {
    console.log(
      '[@real-estate/web] Stale fallback chunks without dev entrypoints — clearing .next before dev.',
    );
    rmNext();
  }
}

/**
 * Partial `.next` (chunks exist but dev `webpack.js` is missing) → browser loads `/static/chunks/webpack.js` and gets 500.
 */
if (fs.existsSync(chunksDir)) {
  const webpackJs = path.join(chunksDir, 'webpack.js');
  let jsCount = 0;
  try {
    jsCount = fs.readdirSync(chunksDir).filter((f) => f.endsWith('.js')).length;
  } catch {
    jsCount = 0;
  }
  if (jsCount > 0 && !fs.existsSync(webpackJs)) {
    console.log(
      '[@real-estate/web] Chunk directory exists but webpack.js is missing — clearing .next before dev.',
    );
    rmNext();
  }
}
