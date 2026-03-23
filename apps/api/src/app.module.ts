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
import { InvestmentsModule } from './investments/investments.module';
import { SupabaseModule } from './supabase/supabase.module';
import { getTypeOrmConfig } from './database/database.config';

const orm = getTypeOrmConfig();

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    HealthModule,
    SupabaseModule,
    TypeOrmModule.forRoot({
      ...orm,
      synchronize:
        process.env.DATABASE_SYNC === 'true' ||
        (process.env.NODE_ENV !== 'production' && process.env.DATABASE_SYNC !== 'false'),
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
    InvestmentsModule,
  ],
})
export class AppModule {}
