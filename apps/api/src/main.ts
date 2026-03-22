import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DataSource } from 'typeorm';
import { join } from 'path';
import * as fs from 'fs';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const uploadRoot = join(process.cwd(), 'uploads');
  fs.mkdirSync(join(uploadRoot, 'listings'), { recursive: true });
  app.useStaticAssets(uploadRoot, { prefix: '/uploads/', index: false });
  try {
    const ds = app.get(DataSource);
    if (ds.isInitialized) {
      const dbPath =
        typeof (ds.options as { database?: string }).database === 'string'
          ? (ds.options as { database: string }).database
          : '';
      console.log(dbPath ? `DB Connected: ${dbPath}` : 'DB Connected');
    }
  } catch {
    console.log('DB Connected');
  }
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') || [
      'http://localhost:3000',
      'http://localhost:3002',
      'http://127.0.0.1:3002',
    ],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  const port = Number(process.env.PORT) || 8000;
  await app.listen(port);
  console.log(`Server running on port ${port}`);
  console.log(`API base: http://localhost:${port}/api/v1`);
}
bootstrap();
