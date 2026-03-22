/**
 * Append up to 10,000 synthetic properties to SQLite (no scraping).
 * Ensures trust/expiry columns exist. Requires countries IND, UAE, USA.
 * Run: npm run seed:10k
 */
import * as path from 'path';
import * as crypto from 'crypto';
import Database from 'better-sqlite3';

const TOTAL = 10_000;
const BATCH = 400;

const IND = [
  { city: 'Mumbai', lat: 19.076, lng: 72.8777 },
  { city: 'Bangalore', lat: 12.9716, lng: 77.5946 },
  { city: 'Delhi', lat: 28.7041, lng: 77.1025 },
  { city: 'Hyderabad', lat: 17.385, lng: 78.4867 },
  { city: 'Pune', lat: 18.5204, lng: 73.8567 },
];
const UAE = [
  { city: 'Dubai Marina', lat: 25.0762, lng: 55.1342 },
  { city: 'Downtown Dubai', lat: 25.2048, lng: 55.2708 },
];
const USA = [
  { city: 'Austin', lat: 30.2672, lng: -97.7431, state: 'Texas' },
  { city: 'Houston', lat: 29.7604, lng: -95.3698, state: 'Texas' },
];

function pick<T>(a: T[]) {
  return a[Math.floor(Math.random() * a.length)];
}
function rand(a: number, b: number) {
  return a + Math.random() * (b - a);
}
function randInt(a: number, b: number) {
  return Math.floor(rand(a, b + 1));
}

function ensureColumns(db: Database.Database) {
  const cols = new Set(
    (db.prepare(`PRAGMA table_info(properties)`).all() as { name: string }[]).map((c) => c.name),
  );
  const add: [string, string][] = [
    ['owner_verified', 'INTEGER NOT NULL DEFAULT 0'],
    ['trust_score', 'REAL'],
    ['data_completeness', 'INTEGER'],
    ['fraud_flag', 'INTEGER NOT NULL DEFAULT 0'],
    ['listing_expires_at', 'TEXT'],
    ['report_count', 'INTEGER NOT NULL DEFAULT 0'],
    ['video_url', 'TEXT'],
  ];
  for (const [name, def] of add) {
    if (!cols.has(name)) {
      db.exec(`ALTER TABLE properties ADD COLUMN ${name} ${def}`);
    }
  }
}

async function main() {
  const dbPath =
    process.env.DATABASE_PATH || path.join(process.cwd(), 'real-estate.db');
  const db = new Database(dbPath);
  db.pragma('foreign_keys = ON');
  ensureColumns(db);

  const countries = db
    .prepare(`SELECT id, code FROM countries WHERE code IN ('IND','UAE','USA')`)
    .all() as { id: string; code: string }[];
  const byCode: Record<string, string> = {};
  for (const r of countries) byCode[r.code] = r.id;
  if (!byCode.IND || !byCode.UAE || !byCode.USA) {
    console.error('Need IND, UAE, USA in countries. Run npm run seed:data first.');
    process.exit(1);
  }

  const expires = (db.prepare(`SELECT datetime('now', '+30 days') AS d`).get() as { d: string }).d;
  const types = ['apartment', 'apartment', 'villa', 'house'];

  const insert = db.prepare(`
    INSERT INTO properties (
      id, country_id, title, description, city, state, address_line1,
      latitude, longitude, price, currency_code, bedrooms, bathrooms,
      area_sqft, property_type, listing_type, status, rental_estimate,
      rental_yield, ai_value_score, ai_category, growth_projection_5yr,
      cagr_5y, risk_score, is_featured, is_verified, video_url,
      owner_verified, trust_score, data_completeness, fraud_flag, listing_expires_at, report_count
    ) VALUES (
      @id, @country_id, @title, @description, @city, @state, @address_line1,
      @latitude, @longitude, @price, @currency_code, @bedrooms, @bathrooms,
      @area_sqft, @property_type, 'sale', 'active', @rental_estimate,
      @rental_yield, @ai_value_score, @ai_category, @growth_projection_5yr,
      @cagr_5y, @risk_score, @is_featured, @is_verified, @video_url,
      @owner_verified, @trust_score, @data_completeness, @fraud_flag, @listing_expires_at, 0
    )
  `);

  const insertImg = db.prepare(`
    INSERT INTO property_images (id, property_id, url, sort_order)
    VALUES (@id, @property_id, @url, 0)
  `);

  const img =
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop';

  let n = 0;
  const runBatch = db.transaction((from: number, to: number) => {
    for (let i = from; i < to; i++) {
      const region = i % 10 < 4 ? 'IND' : i % 10 < 7 ? 'UAE' : 'USA';
      const countryId = byCode[region];
      let city: string;
      let state: string | null = null;
      let lat: number;
      let lng: number;
      if (region === 'IND') {
        const l = pick(IND);
        city = l.city;
        lat = l.lat + rand(-0.04, 0.04);
        lng = l.lng + rand(-0.04, 0.04);
      } else if (region === 'UAE') {
        const l = pick(UAE);
        city = l.city;
        lat = l.lat + rand(-0.03, 0.03);
        lng = l.lng + rand(-0.03, 0.03);
      } else {
        const l = pick(USA);
        city = l.city;
        state = l.state ?? 'Texas';
        lat = l.lat + rand(-0.06, 0.06);
        lng = l.lng + rand(-0.06, 0.06);
      }
      const bed = randInt(1, 5);
      const bath = randInt(1, Math.min(4, bed + 1));
      const price =
        region === 'IND'
          ? randInt(3_500_000, 42_000_000)
          : region === 'UAE'
            ? randInt(900_000, 5_500_000)
            : randInt(220_000, 1_100_000);
      const cur = region === 'IND' ? 'INR' : region === 'UAE' ? 'AED' : 'USD';
      const id = crypto.randomUUID();
      const ai = randInt(45, 94);
      const trust = randInt(52, 98);
      const completeness = randInt(62, 100);
      const fraud = Math.random() > 0.97 ? 1 : 0;
      insert.run({
        id,
        country_id: countryId,
        title: `${pick(types)} in ${city} — Investify bulk #${i}`,
        description: `Synthetic listing for scale testing. ${bed} bed, investment-grade narrative.`,
        city,
        state,
        address_line1: `${randInt(1, 120)} Sample Avenue`,
        latitude: lat,
        longitude: lng,
        price,
        currency_code: cur,
        bedrooms: bed,
        bathrooms: bath,
        area_sqft: randInt(650, 4800),
        property_type: pick(types),
        rental_estimate: Math.round(price * (region === 'IND' ? 0.004 : 0.005)),
        rental_yield: rand(3.2, 6.8),
        ai_value_score: ai,
        ai_category: ai >= 75 ? 'GOOD' : ai >= 55 ? 'FAIR' : 'PREMIUM',
        growth_projection_5yr: rand(4, 11),
        cagr_5y: rand(4, 10),
        risk_score: rand(15, 65),
        is_featured: Math.random() > 0.92 ? 1 : 0,
        is_verified: Math.random() > 0.4 ? 1 : 0,
        video_url: Math.random() > 0.92 ? 'https://www.w3schools.com/html/mov_bbb.mp4' : null,
        owner_verified: Math.random() > 0.42 ? 1 : 0,
        trust_score: trust,
        data_completeness: completeness,
        fraud_flag: fraud,
        listing_expires_at: expires,
      });
      insertImg.run({
        id: crypto.randomUUID(),
        property_id: id,
        url: img,
      });
      n++;
    }
  });

  console.log(`Inserting ${TOTAL} properties into ${dbPath} …`);
  for (let i = 0; i < TOTAL; i += BATCH) {
    runBatch(i, Math.min(i + BATCH, TOTAL));
    console.log(`  … ${Math.min(i + BATCH, TOTAL)} / ${TOTAL}`);
  }
  db.close();
  console.log('Done.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
