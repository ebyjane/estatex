/**
 * INVESTIFY — Large-Scale Realistic Data Generator
 * Generates 10,000 properties: 4K India, 3K Dubai, 3K Texas
 * NO scraping - synthetic realistic data only
 * Run: npx ts-node scripts/generateLargeDataset.ts
 */

import { Client } from 'pg';

const BATCH_SIZE = 500;

// Validated coordinates per user spec (with small random offset ±0.02)
const INDIA_CITIES = [
  { name: 'Mumbai', lat: 19.076, lng: 72.8777 },
  { name: 'Delhi', lat: 28.7041, lng: 77.1025 },
  { name: 'Bangalore', lat: 12.9716, lng: 77.5946 },
  { name: 'Hyderabad', lat: 17.385, lng: 78.4867 },
  { name: 'Chennai', lat: 13.0827, lng: 80.2707 },
  { name: 'Pune', lat: 18.5204, lng: 73.8567 },
  { name: 'Kolkata', lat: 22.5726, lng: 88.3639 },
  { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714 },
  { name: 'Gurgaon', lat: 28.4595, lng: 77.0266 },
  { name: 'Noida', lat: 28.5355, lng: 77.391 },
];

const DUBAI_AREAS = [
  { name: 'Downtown Dubai', lat: 25.2048, lng: 55.2708 },
  { name: 'Dubai Marina', lat: 25.0762, lng: 55.1342 },
  { name: 'Palm Jumeirah', lat: 25.1124, lng: 55.139 },
  { name: 'Business Bay', lat: 25.1852, lng: 55.2792 },
  { name: 'JBR', lat: 25.0785, lng: 55.1313 },
  { name: 'Jumeirah Lake Towers', lat: 25.0755, lng: 55.1396 },
  { name: 'Arabian Ranches', lat: 25.0549, lng: 55.3862 },
  { name: 'Damac Hills', lat: 25.0567, lng: 55.3876 },
  { name: 'Emirates Hills', lat: 25.0946, lng: 55.1685 },
];

const TEXAS_CITIES = [
  { name: 'Houston', lat: 29.7604, lng: -95.3698, state: 'Texas' },
  { name: 'Austin', lat: 30.2672, lng: -97.7431, state: 'Texas' },
  { name: 'Dallas', lat: 32.7767, lng: -96.797, state: 'Texas' },
  { name: 'San Antonio', lat: 29.4241, lng: -98.4936, state: 'Texas' },
  { name: 'Fort Worth', lat: 32.7555, lng: -97.3308, state: 'Texas' },
  { name: 'Plano', lat: 33.0198, lng: -96.6989, state: 'Texas' },
  { name: 'Frisco', lat: 33.1507, lng: -96.8236, state: 'Texas' },
  { name: 'The Woodlands', lat: 30.1658, lng: -95.4613, state: 'Texas' },
];

// Unsplash image IDs (real photos, optimized for 800x600)
const UNSPLASH_BY_TYPE: Record<string, string[]> = {
  apartment: [
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1764996915324-91919cee14d3?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
  ],
  villa: [
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop',
  ],
  house: [
    'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop',
  ],
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function randOffset(): number {
  return rand(-0.02, 0.02);
}

function randInt(min: number, max: number): number {
  return Math.floor(rand(min, max + 1));
}

function computeAIStats(rentalYield: number, growth: number, priceAdvantage: number, demand: number, risk: number) {
  const yieldScore = Math.min(100, (rentalYield / 6) * 100);
  const growthScore = Math.min(100, (growth / 12) * 100);
  const valueScore = Math.round(
    Math.max(0, Math.min(100,
      yieldScore * 0.30 +
      growthScore * 0.25 +
      priceAdvantage * 0.20 +
      demand * 0.15 -
      risk * 0.10
    ))
  );
  const category = valueScore >= 80 ? 'UNDERVALUED' : valueScore >= 60 ? 'FAIR' : valueScore >= 40 ? 'PREMIUM' : 'HIGH_RISK';
  return { valueScore, category };
}

async function generateIndia(client: Client, countryId: string, count: number) {
  const types = ['apartment', 'apartment', 'apartment', 'villa'];
  const props: string[] = [];
  for (let i = 0; i < count; i++) {
    const city = pick(INDIA_CITIES);
    const type = pick(types);
    const isVilla = type === 'villa';
    const price = isVilla ? rand(10000000, 80000000) : rand(4000000, 25000000);
    const bedrooms = isVilla ? randInt(3, 5) : randInt(1, 4);
    const bathrooms = Math.min(bedrooms + randInt(0, 2), 6);
    const areaSqft = isVilla ? randInt(2000, 6000) : randInt(600, 2500);
    const rentalYield = rand(3, 7);
    const rentalEstimate = (price * (rentalYield / 100)) / 12;
    const growth = rand(5, 18);
    const demand = randInt(40, 95);
    const risk = rand(15, 45);
    const priceAdv = rand(-5, 15);
    const { valueScore, category } = computeAIStats(rentalYield, growth, priceAdv, demand, risk);
    const title = `${type === 'villa' ? 'Luxury Villa' : 'Premium Apartment'} in ${city.name} - ${bedrooms}BHK`;
    const desc = `Investment-grade ${type} in prime ${city.name} location. ${bedrooms} bed, ${bathrooms} bath, ${areaSqft} sqft.`;
    props.push(`(
      '${countryId}', '${title.replace(/'/g, "''")}', '${desc.replace(/'/g, "''")}', '${type}', 'sale',
      ${Math.round(price)}, 'INR', ${areaSqft}, ${bedrooms}, ${bathrooms},
      ${city.lat + randOffset()}, ${city.lng + randOffset()}, '${city.name}', NULL, 'active',
      ${valueScore}, ${rentalYield.toFixed(2)}, ${growth.toFixed(2)}, ${risk.toFixed(2)},
      '${category}', ${growth.toFixed(2)}, ${Math.round(rentalEstimate)}, ${demand}
    )`);
  }
  return props;
}

async function generateDubai(client: Client, countryId: string, count: number) {
  const types = ['apartment', 'apartment', 'villa'];
  const props: string[] = [];
  for (let i = 0; i < count; i++) {
    const area = pick(DUBAI_AREAS);
    const type = pick(types);
    const isVilla = type === 'villa';
    const price = isVilla ? rand(1500000, 10000000) : rand(500000, 3000000);
    const bedrooms = isVilla ? randInt(3, 6) : randInt(1, 4);
    const bathrooms = Math.min(bedrooms + randInt(0, 2), 5);
    const areaSqft = isVilla ? randInt(1800, 5000) : randInt(700, 2200);
    const rentalYield = rand(5, 9);
    const rentalEstimate = (price * (rentalYield / 100)) / 12;
    const growth = rand(4, 12);
    const demand = randInt(50, 95);
    const risk = rand(10, 35);
    const priceAdv = rand(-3, 12);
    const { valueScore, category } = computeAIStats(rentalYield, growth, priceAdv, demand, risk);
    const title = `${type === 'villa' ? 'Villa' : 'Apartment'} in ${area.name}`;
    const desc = `Premium ${type} in ${area.name}. ${bedrooms} bed, ${bathrooms} bath, ${areaSqft} sqft.`;
    props.push(`(
      '${countryId}', '${title.replace(/'/g, "''")}', '${desc.replace(/'/g, "''")}', '${type}', 'sale',
      ${Math.round(price)}, 'AED', ${areaSqft}, ${bedrooms}, ${bathrooms},
      ${area.lat + randOffset()}, ${area.lng + randOffset()}, '${area.name}', 'Dubai', 'active',
      ${valueScore}, ${rentalYield.toFixed(2)}, ${growth.toFixed(2)}, ${risk.toFixed(2)},
      '${category}', ${growth.toFixed(2)}, ${Math.round(rentalEstimate)}, ${demand}
    )`);
  }
  return props;
}

async function generateTexas(client: Client, countryId: string, count: number) {
  const types = ['house', 'house', 'apartment'];
  const props: string[] = [];
  for (let i = 0; i < count; i++) {
    const city = pick(TEXAS_CITIES);
    const type = pick(types);
    const price = rand(150000, 900000);
    const bedrooms = randInt(2, 5);
    const bathrooms = Math.min(bedrooms + randInt(0, 1), 5);
    const areaSqft = randInt(1200, 4500);
    const rentalYield = rand(4, 8);
    const rentalEstimate = (price * (rentalYield / 100)) / 12;
    const growth = rand(5, 15);
    const demand = randInt(45, 90);
    const risk = rand(15, 40);
    const priceAdv = rand(-5, 10);
    const { valueScore, category } = computeAIStats(rentalYield, growth, priceAdv, demand, risk);
    const title = `${bedrooms}BR ${type} in ${city.name}`;
    const desc = `Investment ${type} in ${city.name}, ${city.state}. ${bedrooms} bed, ${bathrooms} bath, ${areaSqft} sqft.`;
    props.push(`(
      '${countryId}', '${title.replace(/'/g, "''")}', '${desc.replace(/'/g, "''")}', '${type}', 'sale',
      ${Math.round(price)}, 'USD', ${areaSqft}, ${bedrooms}, ${bathrooms},
      ${city.lat + randOffset()}, ${city.lng + randOffset()}, '${city.name}', '${city.state}', 'active',
      ${valueScore}, ${rentalYield.toFixed(2)}, ${growth.toFixed(2)}, ${risk.toFixed(2)},
      '${category}', ${growth.toFixed(2)}, ${Math.round(rentalEstimate)}, ${demand}
    )`);
  }
  return props;
}

async function insertBatch(client: Client, values: string[]) {
  if (values.length === 0) return;
  const cols = `country_id, title, description, property_type, listing_type, price, currency_code, area_sqft, bedrooms, bathrooms, latitude, longitude, city, state, status, ai_value_score, rental_yield, cagr_5y, risk_score, ai_category, growth_projection_5yr, rental_estimate, area_demand_index`;
  const sql = `INSERT INTO properties (${cols}) VALUES ${values.join(',')}`;
  await client.query(sql);
}

function getImageForType(propertyType: string, seed: number): string {
  const type = (propertyType || 'apartment').toLowerCase();
  const urls = UNSPLASH_BY_TYPE[type] || UNSPLASH_BY_TYPE.apartment;
  return urls[seed % urls.length];
}

async function addImagesToProperties(client: Client) {
  const res = await client.query<{ id: string; property_type: string }>(
    `SELECT id, property_type FROM properties p WHERE NOT EXISTS (SELECT 1 FROM property_images pi WHERE pi.property_id = p.id) LIMIT 15000`
  );
  if (res.rows.length === 0) return;
  console.log(`Adding images to ${res.rows.length} properties...`);
  let inserted = 0;
  for (let i = 0; i < res.rows.length; i += 200) {
    const batch = res.rows.slice(i, i + 200);
    const values = batch.map(
      (r, j) =>
        `(gen_random_uuid(), '${r.id.replace(/'/g, "''")}', '${getImageForType(r.property_type, i + j).replace(/'/g, "''")}', 0, NOW())`
    );
    await client.query(
      `INSERT INTO property_images (id, property_id, url, sort_order, created_at) VALUES ${values.join(',')}`
    );
    inserted += batch.length;
    console.log(`  Added images: ${inserted} / ${res.rows.length}`);
  }
}

async function main() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5434', 10),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'real_estate',
  });

  await client.connect();

  // Ensure V2 schema columns exist
  await client.query(`ALTER TABLE properties ADD COLUMN IF NOT EXISTS ai_category VARCHAR(20)`);
  await client.query(`ALTER TABLE properties ADD COLUMN IF NOT EXISTS growth_projection_5yr DECIMAL(5,2)`);
  await client.query(`ALTER TABLE properties ADD COLUMN IF NOT EXISTS rental_estimate DECIMAL(18,2)`);
  await client.query(`ALTER TABLE properties ADD COLUMN IF NOT EXISTS area_demand_index INT`);

  // Ensure countries exist (seed if empty)
  const countRes = await client.query(`SELECT COUNT(*) as c FROM countries WHERE code IN ('IND','UAE','USA')`);
  if (parseInt((countRes.rows[0] as { c: string }).c, 10) < 3) {
    console.log('Seeding countries...');
    for (const row of [
      ['IND', 'India', 'INR', 'APAC'],
      ['UAE', 'United Arab Emirates', 'AED', 'GCC'],
      ['USA', 'United States', 'USD', 'NA'],
    ]) {
      await client.query(
        `INSERT INTO countries (id, code, name, currency_code, region, created_at, updated_at)
         SELECT gen_random_uuid(), $1, $2, $3, $4, NOW(), NOW()
         WHERE NOT EXISTS (SELECT 1 FROM countries WHERE code = $1)`,
        row
      );
    }
  }

  const countryRes = await client.query(`SELECT id, code FROM countries WHERE code IN ('IND','UAE','USA','AE','IN','US')`);
  const byCode: Record<string, string> = {};
  countryRes.rows.forEach((r: { id: string; code: string }) => { byCode[r.code.toUpperCase()] = r.id; });

  const ind = byCode['IND'] || byCode['IN'];
  const uae = byCode['UAE'] || byCode['AE'];
  const usa = byCode['USA'] || byCode['US'];

  if (!ind || !uae || !usa) {
    console.error('Missing countries (IND, UAE, USA).');
    process.exit(1);
  }

  console.log('Generating India properties (4000)...');
  const indiaProps = await generateIndia(client, ind, 4000);
  for (let i = 0; i < indiaProps.length; i += BATCH_SIZE) {
    await insertBatch(client, indiaProps.slice(i, i + BATCH_SIZE));
    console.log(`  Inserted ${Math.min(i + BATCH_SIZE, indiaProps.length)} / 4000`);
  }

  console.log('Generating Dubai properties (3000)...');
  const dubaiProps = await generateDubai(client, uae, 3000);
  for (let i = 0; i < dubaiProps.length; i += BATCH_SIZE) {
    await insertBatch(client, dubaiProps.slice(i, i + BATCH_SIZE));
    console.log(`  Inserted ${Math.min(i + BATCH_SIZE, dubaiProps.length)} / 3000`);
  }

  console.log('Generating Texas properties (3000)...');
  const texasProps = await generateTexas(client, usa, 3000);
  for (let i = 0; i < texasProps.length; i += BATCH_SIZE) {
    await insertBatch(client, texasProps.slice(i, i + BATCH_SIZE));
    console.log(`  Inserted ${Math.min(i + BATCH_SIZE, texasProps.length)} / 3000`);
  }

  console.log('Adding property images (Unsplash)...');
  await addImagesToProperties(client);

  await client.end();
  console.log('Done. 10,000 properties + images inserted.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
