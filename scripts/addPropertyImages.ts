/**
 * Add Unsplash images to properties that don't have any.
 * Run after generateLargeDataset or for existing DBs.
 * npx ts-node scripts/addPropertyImages.ts
 */

import { Client } from 'pg';

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

function getImage(propertyType: string, seed: number): string {
  const type = (propertyType || 'apartment').toLowerCase();
  const urls = UNSPLASH_BY_TYPE[type] || UNSPLASH_BY_TYPE.apartment;
  return urls[seed % urls.length];
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

  const res = await client.query<{ id: string; property_type: string }>(
    `SELECT id, property_type FROM properties p WHERE NOT EXISTS (SELECT 1 FROM property_images pi WHERE pi.property_id = p.id)`
  );
  console.log(`Adding images to ${res.rows.length} properties...`);

  for (let i = 0; i < res.rows.length; i += 200) {
    const batch = res.rows.slice(i, i + 200);
    const values = batch.map(
      (r, j) =>
        `(gen_random_uuid(), '${r.id.replace(/'/g, "''")}', '${getImage(r.property_type, i + j).replace(/'/g, "''")}', 0, NOW())`
    );
    await client.query(
      `INSERT INTO property_images (id, property_id, url, sort_order, created_at) VALUES ${values.join(',')}`
    );
    console.log(`  Done ${Math.min(i + 200, res.rows.length)} / ${res.rows.length}`);
  }

  await client.end();
  console.log('Done.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
