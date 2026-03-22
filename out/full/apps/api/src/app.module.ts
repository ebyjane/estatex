import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { PropertiesModule } from './properties/properties.module';
import { CountriesModule } from './countries/countries.module';
import { CalculatorModule } from './calculator/calculator.module';
import { FxModule } from './fx/fx.module';
import { CompareModule } from './compare/compare.module';
import { StripeModule } from './stripe/stripe.module';
import { AiModule } from './ai/ai.module';
import { AdminModule } from './admin/admin.module';
import { SeoModule } from './seo/seo.module';
import { HealthModule } from './health/health.module';
import * as path from 'path';

const getDatabaseConfig = () => {
  const dbType = process.env.DATABASE_TYPE || 'sqlite';
  
  if (dbType === 'postgres') {
    return {
      type: 'postgres' as const,
      host: process.env.DB_HOST || 'localhost',
      port: +(process.env.DB_PORT || 5432),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'real_estate',
    };
  }
  
  // SQLite: align with `npm run seed:data` (repo-root real-estate.db). Avoid reading an empty apps/api/real-estate.db.
  const fs = require('fs') as typeof import('fs');
  const cwd = process.cwd();
  let databasePath: string;
  if (process.env.DATABASE_PATH) {
    databasePath = path.isAbsolute(process.env.DATABASE_PATH)
      ? process.env.DATABASE_PATH
      : path.join(cwd, process.env.DATABASE_PATH);
  } else {
    const repoRootDb = path.join(cwd, '..', '..', 'real-estate.db');
    const cwdDb = path.join(cwd, 'real-estate.db');
    if (fs.existsSync(repoRootDb)) databasePath = repoRootDb;
    else if (fs.existsSync(cwdDb)) databasePath = cwdDb;
    else databasePath = repoRootDb;
  }

  return {
    type: 'better-sqlite3' as const,
    database: databasePath,
  };
};

const dbConfig = getDatabaseConfig();
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    HealthModule,
    TypeOrmModule.forRoot({
      ...dbConfig,
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV !== 'production',
    }),
    AiModule,
    AdminModule,
    SeoModule,
    AuthModule,
    PropertiesModule,
    CountriesModule,
    CalculatorModule,
    FxModule,
    CompareModule,
    StripeModule,
  ],
})
export class AppModule {}
