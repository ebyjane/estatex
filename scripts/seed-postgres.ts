/**
 * Seed PostgreSQL (Supabase / local Docker) via TypeORM.
 * Requires DATABASE_URL or DB_HOST/DB_USER/DB_PASSWORD/DB_NAME.
 *
 * First run creates schema when SEED_SYNC is not false (default: synchronize tables).
 * Truncates core tables then inserts countries, admin user, and demo properties.
 *
 * Usage: npm run seed:data
 */

import 'reflect-metadata';
import * as fs from 'fs';
import * as path from 'path';
import { DataSource } from 'typeorm';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

/**
 * Merge apps/api/.env into process.env without overriding existing keys.
 * (Do not skip the file when only DB_HOST or DATABASE_URL is set in the shell — that caused
 * seed to use different host/port than Nest, which loads apps/api/.env via ConfigModule.)
 */
function tryLoadApiEnv(): void {
  const envPath = path.resolve(__dirname, '../apps/api/.env');
  if (!fs.existsSync(envPath)) return;
  const text = fs.readFileSync(envPath, 'utf8');
  for (const line of text.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i === -1) continue;
    const key = t.slice(0, i).trim();
    let val = t.slice(i + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined || process.env[key] === '') {
      process.env[key] = val;
    }
  }
}
import {
  buildDemoPropertyRows,
  DEMO_COUNTRIES,
} from '../packages/shared/dist/demo-seed-data.js';

import { UserEntity } from '../apps/api/src/entities/user.entity';
import { CountryEntity } from '../apps/api/src/entities/country.entity';
import { PropertyEntity } from '../apps/api/src/entities/property.entity';
import { PropertyImageEntity } from '../apps/api/src/entities/property-image.entity';
import { LeadEntity } from '../apps/api/src/entities/lead.entity';
import { SeoPageEntity } from '../apps/api/src/entities/seo-page.entity';
import { AppSettingsEntity } from '../apps/api/src/entities/app-settings.entity';
import { InvestmentEntity } from '../apps/api/src/entities/investment.entity';

function buildDataSource(): DataSource {
  const url = process.env.DATABASE_URL?.trim();
  const useSsl =
    process.env.DATABASE_SSL === 'true' ||
    !!url?.includes('supabase.co') ||
    !!url?.includes('neon.tech');

  return new DataSource({
    type: 'postgres',
    url: url || undefined,
    host: url ? undefined : process.env.DB_HOST || 'localhost',
    port: url ? undefined : +(process.env.DB_PORT || 5432),
    username: url ? undefined : process.env.DB_USER || 'postgres',
    password: url ? undefined : process.env.DB_PASSWORD || 'postgres',
    database: url ? undefined : process.env.DB_NAME || 'postgres',
    ssl: useSsl ? { rejectUnauthorized: false } : false,
    entities: [
      UserEntity,
      CountryEntity,
      PropertyEntity,
      PropertyImageEntity,
      LeadEntity,
      SeoPageEntity,
      AppSettingsEntity,
      InvestmentEntity,
    ],
    synchronize: process.env.SEED_SYNC !== 'false',
    logging: process.env.SEED_LOG === '1',
  });
}

async function main() {
  tryLoadApiEnv();
  if (!process.env.DATABASE_URL && !process.env.DB_HOST) {
    console.error('Set DATABASE_URL (recommended) or DB_HOST / DB_USER / DB_PASSWORD / DB_NAME');
    process.exit(1);
  }

  const ds = buildDataSource();
  await ds.initialize();
  console.log('Connected to DB');

  const qr = ds.createQueryRunner();
  await qr.connect();
  try {
    await qr.query(`
      TRUNCATE TABLE
        property_images,
        investments,
        leads,
        properties,
        users,
        countries
      RESTART IDENTITY CASCADE;
    `);
  } catch (e) {
    console.warn(
      'Truncate skipped (first run or empty DB) — continuing:',
      (e as Error).message,
    );
  } finally {
    await qr.release();
  }

  const countryRepo = ds.getRepository(CountryEntity);
  const userRepo = ds.getRepository(UserEntity);
  const propertyRepo = ds.getRepository(PropertyEntity);
  const imageRepo = ds.getRepository(PropertyImageEntity);

  const countryMap: Record<string, string> = {};
  for (const c of DEMO_COUNTRIES) {
    const row = countryRepo.create({
      code: c.code,
      name: c.name,
      currencyCode: c.currencyCode,
      region: c.region,
      taxRateDefault: 8.5,
    });
    const saved = await countryRepo.save(row);
    countryMap[c.code] = saved.id;
  }

  const adminHash = await bcrypt.hash('admin123', 10);
  const admin = userRepo.create({
    email: 'admin@estatex.ai',
    passwordHash: adminHash,
    firstName: 'Admin',
    role: 'admin',
  });
  const adminSaved = await userRepo.save(admin);
  const adminId = adminSaved.id;

  const rows = buildDemoPropertyRows();
  const listingExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i]!;
    const countryId = countryMap[r.countryCode];
    if (!countryId) continue;

    const trust = 55 + Math.floor(Math.random() * 40);
    const completeness = 65 + Math.floor(Math.random() * 35);
    const ownerV = Math.random() > 0.45;
    const fraud = Math.random() > 0.96;
    const id = crypto.randomUUID();
    const ownerName = `Demo owner · ${r.city}`;
    const ownerEmail = `listings.${id.slice(0, 8)}@demo.estatex.ai`;
    const ownerPhone = `+9198765${String(40000 + i).padStart(5, '0')}`;

    const prop = propertyRepo.create({
      id,
      countryId,
      ownerId: adminId,
      ownerName,
      ownerEmail,
      ownerPhone,
      whatsappOptIn: false,
      title: r.title,
      description: r.description,
      city: r.city,
      state: r.state ?? undefined,
      addressLine1: r.addressLine1,
      latitude: r.latitude,
      longitude: r.longitude,
      price: r.price,
      currencyCode: r.currencyCode,
      bedrooms: r.bedrooms,
      bathrooms: r.bathrooms,
      areaSqft: r.areaSqft,
      propertyType: r.propertyType,
      listingType: 'sale',
      status: 'active',
      rentalEstimate: r.rentalEstimate,
      rentalYield: r.rentalYieldPct,
      aiValueScore: r.aiScore,
      aiCategory: r.aiCategory,
      growthProjection5yr: r.growthProjection5yr,
      cagr5y: r.cagr5y,
      riskScore: r.riskScore,
      isFeatured: r.isFeatured,
      isVerified: Math.random() > 0.35,
      videoUrl: r.videoUrl ?? null,
      ownerVerified: ownerV,
      trustScore: trust,
      dataCompleteness: completeness,
      fraudFlag: fraud,
      listingExpiresAt,
      reportCount: 0,
    });
    await propertyRepo.save(prop);

    const img = imageRepo.create({
      propertyId: id,
      url: r.imageUrl,
      sortOrder: 0,
    });
    await imageRepo.save(img);
  }

  const settings = ds.getRepository(AppSettingsEntity);
  const existing = await settings.findOne({ where: { id: 'default' } });
  if (!existing) {
    await settings.save(settings.create({ id: 'default', defaultCurrency: 'USD' }));
  }

  await ds.destroy();
  console.log(`Seed completed: ${rows.length} properties + admin user (admin@estatex.ai / admin123)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
