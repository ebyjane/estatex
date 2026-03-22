/**
 * Bulk-insert 5000 India RENT listings into SQLite (same DB as API).
 * Requires country IND. Run: npm run seed:india-rent
 */
import * as path from 'path';
import * as crypto from 'crypto';
import Database from 'better-sqlite3';
import {
  buildIndiaRentRows,
  INDIA_RENT_TOTAL_DEFAULT,
} from '../packages/shared/dist/india-rent-seed.js';

const BATCH = 500;

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

  const ind = db
    .prepare(`SELECT id FROM countries WHERE code = 'IND' LIMIT 1`)
    .get() as { id: string } | undefined;
  if (!ind) {
    console.error('Country IND not found. Run npm run seed:data first.');
    process.exit(1);
  }

  const countryId = ind.id;

  db.prepare(
    `DELETE FROM property_images WHERE property_id IN (SELECT id FROM properties WHERE listing_type = 'rent' AND country_id = ?)`,
  ).run(countryId);
  const del = db.prepare(
    `DELETE FROM properties WHERE listing_type = 'rent' AND country_id = ?`,
  ).run(countryId);
  console.log(`Removed ${del.changes} existing India rent listings (if any).`);

  const rows = buildIndiaRentRows(INDIA_RENT_TOTAL_DEFAULT);
  const expires = (db.prepare(`SELECT datetime('now', '+30 days') AS d`).get() as { d: string }).d;

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
      @area_sqft, @property_type, 'rent', 'active', @rental_estimate,
      @rental_yield, @ai_value_score, @ai_category, @growth_projection_5yr,
      @cagr_5y, @risk_score, @is_featured, @is_verified, @video_url,
      @owner_verified, @trust_score, @data_completeness, @fraud_flag, @listing_expires_at, 0
    )
  `);

  const insertImg = db.prepare(`
    INSERT INTO property_images (id, property_id, url, sort_order)
    VALUES (@id, @property_id, @url, @sort_order)
  `);

  const runBatch = db.transaction((from: number, to: number) => {
    for (let i = from; i < to; i++) {
      const r = rows[i]!;
      const id = crypto.randomUUID();
      const trust = 55 + Math.floor(Math.random() * 40);
      const completeness = 65 + Math.floor(Math.random() * 35);
      insert.run({
        id,
        country_id: countryId,
        title: r.title,
        description: r.description,
        city: r.city,
        state: r.state,
        address_line1: r.addressLine1,
        latitude: r.latitude,
        longitude: r.longitude,
        price: r.price,
        currency_code: r.currencyCode,
        bedrooms: r.bedrooms,
        bathrooms: r.bathrooms,
        area_sqft: r.areaSqft,
        property_type: r.propertyType,
        rental_estimate: r.rentalEstimate,
        rental_yield: r.rentalYield,
        ai_value_score: r.aiValueScore,
        ai_category: r.aiCategory,
        growth_projection_5yr: r.growthProjection5yr,
        cagr_5y: r.cagr5y,
        risk_score: r.riskScore,
        is_featured: Math.random() > 0.94 ? 1 : 0,
        is_verified: Math.random() > 0.45 ? 1 : 0,
        video_url: null,
        owner_verified: Math.random() > 0.5 ? 1 : 0,
        trust_score: trust,
        data_completeness: completeness,
        fraud_flag: Math.random() > 0.98 ? 1 : 0,
        listing_expires_at: expires,
      });
      r.imageUrls.forEach((url, sortOrder) => {
        insertImg.run({
          id: crypto.randomUUID(),
          property_id: id,
          url,
          sort_order: sortOrder,
        });
      });
    }
  });

  console.log(`Inserting ${rows.length} rent properties into ${dbPath} …`);
  for (let i = 0; i < rows.length; i += BATCH) {
    runBatch(i, Math.min(i + BATCH, rows.length));
    console.log(`  … ${Math.min(i + BATCH, rows.length)} / ${rows.length}`);
  }
  db.close();
  console.log(`Inserted ${rows.length} rent properties`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
