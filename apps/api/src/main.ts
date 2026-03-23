import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DataSource } from 'typeorm';
import { join } from 'path';
import * as fs from 'fs';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.get('/', (_req: unknown, res: { send: (body: string) => void }) => {
    res.send('API OK');
  });
  const uploadRoot = join(process.cwd(), 'uploads');
  fs.mkdirSync(join(uploadRoot, 'listings'), { recursive: true });
  app.useStaticAssets(uploadRoot, { prefix: '/uploads/', index: false });
  try {
    const ds = app.get(DataSource);
    if (ds.isInitialized) {
      console.log('Connected to DB');
      const o = ds.options as { url?: string; database?: string };
      console.log(
        o.url
          ? 'DB host: PostgreSQL via DATABASE_URL'
          : `DB host: PostgreSQL / ${o.database ?? 'default'}`,
      );
    }
  } catch {
    console.error('DB connection check failed at startup');
  }
  app.enableCors({
    origin: '*',
    credentials: false,
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  const PORT = Number(process.env.PORT) || 8000;
  await app.listen(PORT);
  console.log('Server running on port', PORT);
  console.log(`API base: http://localhost:${PORT}/api/v1`);
}
bootstrap();
