/**
 * Investify SQLite seed — same DB file the API uses (repo root real-estate.db).
 * Run: npm run seed:data
 */

import * as path from 'path';
import Database from 'better-sqlite3';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import {
  buildDemoPropertyRows,
  DEMO_COUNTRIES,
} from '../packages/shared/dist/demo-seed-data.js';

const dbPath =
  process.env.DATABASE_PATH || path.join(process.cwd(), 'real-estate.db');
const db = new Database(dbPath);
db.pragma('foreign_keys = ON');

function createSchema() {
  db.exec(`
    DROP TABLE IF EXISTS property_images;
    DROP TABLE IF EXISTS properties;
    DROP TABLE IF EXISTS users;
    DROP TABLE IF EXISTS countries;

    CREATE TABLE countries (
      id varchar PRIMARY KEY NOT NULL,
      code varchar(3) NOT NULL UNIQUE,
      name varchar(100) NOT NULL,
      currency_code varchar(3) NOT NULL,
      region varchar(50),
      timezone varchar,
      tax_rate_default decimal(5,2),
      created_at datetime DEFAULT (datetime('now')),
      updated_at datetime DEFAULT (datetime('now'))
    );

    CREATE TABLE users (
      id varchar PRIMARY KEY NOT NULL,
      email varchar NOT NULL UNIQUE,
      password_hash varchar,
      first_name varchar,
      last_name varchar,
      phone varchar,
      country_id varchar,
      investor_type varchar,
      preferred_currency varchar DEFAULT 'USD',
      role varchar DEFAULT 'buyer',
      account_status varchar DEFAULT 'active',
      avatar_url varchar,
      oauth_provider varchar,
      oauth_id varchar,
      created_at datetime DEFAULT (datetime('now')),
      updated_at datetime DEFAULT (datetime('now')),
      FOREIGN KEY (country_id) REFERENCES countries (id)
    );

    CREATE TABLE properties (
      id varchar PRIMARY KEY NOT NULL,
      country_id varchar NOT NULL,
      owner_id varchar,
      owner_name varchar,
      owner_email varchar,
      owner_phone varchar,
      whatsapp_opt_in boolean NOT NULL DEFAULT 0,
      agent_id varchar,
      title varchar NOT NULL,
      description text,
      property_type varchar,
      listing_type varchar NOT NULL,
      price decimal(18,2) NOT NULL,
      currency_code varchar(3) NOT NULL,
      area_sqft decimal(12,2),
      bedrooms integer,
      bathrooms integer,
      latitude decimal(10,7),
      longitude decimal(10,7),
      address_line1 varchar,
      city varchar,
      state varchar,
      zip varchar,
      status varchar DEFAULT 'draft',
      ai_value_score real,
      ai_price_suggestion decimal(18,2),
      rental_yield decimal(5,2),
      cagr_5y decimal(5,2),
      risk_score decimal(4,2),
      is_verified boolean NOT NULL DEFAULT 0,
      ai_category varchar,
      growth_projection_5yr decimal(5,2),
      rental_estimate decimal(18,2),
      area_demand_index real,
      is_featured boolean NOT NULL DEFAULT 0,
      video_url text,
      owner_verified boolean NOT NULL DEFAULT 0,
      trust_score decimal(5,2),
      data_completeness integer,
      fraud_flag boolean NOT NULL DEFAULT 0,
      listing_expires_at datetime,
      report_count integer NOT NULL DEFAULT 0,
      created_at datetime DEFAULT (datetime('now')),
      updated_at datetime DEFAULT (datetime('now')),
      FOREIGN KEY (country_id) REFERENCES countries (id)
    );

    CREATE TABLE property_images (
      id varchar PRIMARY KEY NOT NULL,
      property_id varchar NOT NULL,
      url varchar NOT NULL,
      thumb_url varchar,
      sort_order integer NOT NULL DEFAULT 0,
      created_at datetime DEFAULT (datetime('now')),
      FOREIGN KEY (property_id) REFERENCES properties (id) ON DELETE CASCADE
    );
  `);
}

async function main() {
  console.log('Seeding database at', dbPath);
  createSchema();

  const countryStmt = db.prepare(`
    INSERT INTO countries (id, code, name, currency_code, region, tax_rate_default)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  for (const c of DEMO_COUNTRIES) {
    countryStmt.run(
      crypto.randomUUID(),
      c.code,
      c.name,
      c.currencyCode,
      c.region,
      8.5,
    );
  }

  const countryMap: Record<string, string> = {};
  for (const row of db.prepare('SELECT id, code FROM countries').all() as {
    id: string;
    code: string;
  }[]) {
    countryMap[row.code] = row.id;
  }

  const adminHash = await bcrypt.hash('admin123', 10);
  const adminId = crypto.randomUUID();
  db.prepare(`
    INSERT INTO users (id, email, password_hash, first_name, role)
    VALUES (?, ?, ?, ?, ?)
  `).run(adminId, 'admin@estatex.ai', adminHash, 'Admin', 'admin');

  const rows = buildDemoPropertyRows();
  const listingExpiresAt = (
    db.prepare(`SELECT datetime('now', '+30 days') AS d`).get() as { d: string }
  ).d;
  const propertyStmt = db.prepare(`
    INSERT INTO properties (
      id, country_id, owner_id, owner_name, owner_email, owner_phone, whatsapp_opt_in,
      title, description, city, state, address_line1,
      latitude, longitude, price, currency_code, bedrooms, bathrooms,
      area_sqft, property_type, listing_type, status, rental_estimate,
      rental_yield, ai_value_score, ai_category, growth_projection_5yr,
      cagr_5y, risk_score, is_featured, is_verified, video_url,
      owner_verified, trust_score, data_completeness, fraud_flag, listing_expires_at, report_count
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
  `);
  const imageStmt = db.prepare(`
    INSERT INTO property_images (id, property_id, url, sort_order)
    VALUES (?, ?, ?, 0)
  `);

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i]!;
    const id = crypto.randomUUID();
    const countryId = countryMap[r.countryCode];
    if (!countryId) continue;
    const trust = 55 + Math.floor(Math.random() * 40);
    const completeness = 65 + Math.floor(Math.random() * 35);
    const ownerV = Math.random() > 0.45 ? 1 : 0;
    const fraud = Math.random() > 0.96 ? 1 : 0;
    const ownerName = `Demo owner · ${r.city}`;
    const ownerEmail = `listings.${id.slice(0, 8)}@demo.estatex.ai`;
    const ownerPhone = `+9198765${String(40000 + i).padStart(5, '0')}`;
    propertyStmt.run(
      id,
      countryId,
      adminId,
      ownerName,
      ownerEmail,
      ownerPhone,
      0,
      r.title,
      r.description,
      r.city,
      r.state ?? null,
      r.addressLine1,
      r.latitude,
      r.longitude,
      r.price,
      r.currencyCode,
      r.bedrooms,
      r.bathrooms,
      r.areaSqft,
      r.propertyType,
      'sale',
      'active',
      r.rentalEstimate,
      r.rentalYieldPct,
      r.aiScore,
      r.aiCategory,
      r.growthProjection5yr,
      r.cagr5y,
      r.riskScore,
      r.isFeatured ? 1 : 0,
      Math.random() > 0.35 ? 1 : 0,
      r.videoUrl ?? null,
      ownerV,
      trust,
      completeness,
      fraud,
      listingExpiresAt,
      0,
    );
    imageStmt.run(crypto.randomUUID(), id, r.imageUrl);
  }

  db.close();
  console.log(`Seed completed: ${rows.length} properties + admin user created`);
}

main().catch((e) => {
  console.error(e);
  try {
    db.close();
  } catch {
    /* ignore */
  }
  process.exit(1);
});
