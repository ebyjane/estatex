import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const getDatabaseConfig = (): TypeOrmModuleOptions => {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    type: 'postgres',
    url: process.env.DATABASE_URL,
    autoLoadEntities: true,
    synchronize: process.env.DATABASE_SYNC === 'true',

    ssl: isProduction
      ? {
          rejectUnauthorized: false,
        }
      : false,

    extra: isProduction
      ? {
          ssl: {
            rejectUnauthorized: false,
          },
        }
      : {},
  };
};
