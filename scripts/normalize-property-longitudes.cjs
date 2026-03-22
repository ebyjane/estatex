/**
 * One-time repair: wrap invalid longitudes (e.g. -282 → ~78) and fix swapped lat/lng.
 * Only updates rows that are actually invalid — does not rewrite valid coordinates.
 * Run from repo root: npm run fix:longitudes
 */
const path = require('path');
const Database = require('better-sqlite3');

function normalizeLongitude(lng) {
  if (!Number.isFinite(lng)) return NaN;
  return ((((lng + 180) % 360) + 360) % 360) - 180;
}

const dbPath = path.join(__dirname, '..', 'real-estate.db');
const db = new Database(dbPath);
const rows = db
  .prepare('SELECT id, latitude, longitude FROM properties WHERE latitude IS NOT NULL AND longitude IS NOT NULL')
  .all();

let updated = 0;
const upd = db.prepare('UPDATE properties SET latitude = @lat, longitude = @lng WHERE id = @id');

for (const row of rows) {
  const oLat = Number(row.latitude);
  const oLng = Number(row.longitude);
  if (!Number.isFinite(oLat) || !Number.isFinite(oLng)) continue;

  const hadInvalidLng = oLng < -180 || oLng > 180;
  const hadInvalidLat = oLat < -90 || oLat > 90;
  const likelySwapped = Math.abs(oLat) > 90 && Math.abs(oLng) <= 90;

  if (!hadInvalidLng && !hadInvalidLat && !likelySwapped) continue;

  let la = oLat;
  let ln = oLng;
  if (likelySwapped) {
    [la, ln] = [ln, la];
  }
  ln = normalizeLongitude(ln);
  if (la < -90 || la > 90) continue;

  upd.run({ id: row.id, lat: la, lng: ln });
  updated++;
  console.log(`Fixed ${row.id}: (${row.latitude}, ${row.longitude}) → (${la}, ${ln})`);
}

console.log(`Done. Updated ${updated} row(s).`);
db.close();
