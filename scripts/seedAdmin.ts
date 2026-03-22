/**
 * Seed admin user for testing
 * Run: npx ts-node scripts/seedAdmin.ts
 * Login: admin@estatex.ai / admin123
 */

import { Client } from 'pg';
import * as bcrypt from 'bcrypt';

async function main() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5434', 10),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'real_estate',
  });
  await client.connect();

  const hash = await bcrypt.hash('admin123', 10);
  const email = 'admin@estatex.ai';

  const res = await client.query(
    `SELECT id FROM users WHERE email = $1`,
    [email]
  );
  if (res.rows.length > 0) {
    await client.query(
      `UPDATE users SET password_hash = $1, role = 'admin' WHERE email = $2`,
      [hash, email]
    );
  } else {
    await client.query(
      `INSERT INTO users (id, email, password_hash, first_name, role, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, $2, 'Admin', 'admin', NOW(), NOW())`,
      [email, hash]
    );
  }

  console.log('Admin user ready:', email, '/ admin123');
  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
