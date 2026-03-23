import type { TypeOrmModuleOptions } from '@nestjs/typeorm';

/**
 * PostgreSQL only (Supabase, Neon, RDS, or local Docker).
 * Prefer `DATABASE_URL` (Supabase dashboard → Connection string → URI).
 * For Supavisor pooler (serverless-friendly), use the "Transaction" pooler URL when offered.
 */
export function getTypeOrmConfig(): TypeOrmModuleOptions {
  const url = process.env.DATABASE_URL?.trim();

  const useSsl =
    process.env.DATABASE_SSL === 'true' ||
    !!url?.includes('supabase.co') ||
    !!url?.includes('neon.tech') ||
    url?.includes('sslmode=require');

  const base: TypeOrmModuleOptions = {
    type: 'postgres',
    autoLoadEntities: true,
    extra: {
      max: Math.min(Number(process.env.DB_POOL_MAX || 10), 50),
    },
  };

  if (url) {
    try {
      const u = new URL(url);
      console.log('[database.config] DATABASE_URL host:', u.hostname, '| ssl:', useSsl ? 'on' : 'off');
    } catch {
      console.log('[database.config] DATABASE_URL set (could not parse host for log)');
    }
    return {
      ...base,
      url,
      ssl: useSsl ? { rejectUnauthorized: false } : false,
    };
  }

  const host = process.env.DB_HOST || 'localhost';
  console.log('[database.config] DB_HOST:', host, '| ssl:', process.env.DB_SSL === 'true' ? 'on' : 'off');

  return {
    ...base,
    host,
    port: +(process.env.DB_PORT || 5432),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'postgres',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  };
}
