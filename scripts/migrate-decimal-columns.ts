import 'reflect-metadata';
import * as fs from 'fs';
import * as path from 'path';
import { DataSource } from 'typeorm';

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

function buildDataSource(): DataSource {
  const url = process.env.DATABASE_URL?.trim();
  const useSsl =
    process.env.DATABASE_SSL === 'true' ||
    !!url?.includes('supabase.co') ||
    !!url?.includes('neon.tech') ||
    url?.includes('sslmode=require');

  return new DataSource({
    type: 'postgres',
    url: url || undefined,
    host: url ? undefined : process.env.DB_HOST || 'localhost',
    port: url ? undefined : +(process.env.DB_PORT || 5432),
    username: url ? undefined : process.env.DB_USER || 'postgres',
    password: url ? undefined : process.env.DB_PASSWORD || 'postgres',
    database: url ? undefined : process.env.DB_NAME || 'postgres',
    ssl: useSsl ? { rejectUnauthorized: false } : false,
  });
}

async function main() {
  tryLoadApiEnv();
  if (!process.env.DATABASE_URL && !process.env.DB_HOST) {
    throw new Error('Set DATABASE_URL (recommended) or DB_HOST/DB_USER/DB_PASSWORD/DB_NAME.');
  }

  const ds = buildDataSource();
  await ds.initialize();
  console.log('Connected to DB');

  try {
    await ds.query(`
      ALTER TABLE properties
        ALTER COLUMN rental_yield TYPE numeric(5,2) USING NULLIF(rental_yield::text, '')::numeric(5,2),
        ALTER COLUMN cagr_5y TYPE numeric(5,2) USING NULLIF(cagr_5y::text, '')::numeric(5,2),
        ALTER COLUMN risk_score TYPE numeric(5,2) USING NULLIF(risk_score::text, '')::numeric(5,2),
        ALTER COLUMN ai_value_score TYPE numeric(5,2) USING NULLIF(ai_value_score::text, '')::numeric(5,2),
        ALTER COLUMN growth_projection_5yr TYPE numeric(5,2) USING NULLIF(growth_projection_5yr::text, '')::numeric(5,2);
    `);
    console.log('Decimal migration applied on properties numeric fields.');
  } finally {
    await ds.destroy();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
