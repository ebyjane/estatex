process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
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

  app.enableCors({
    origin: '*',
    credentials: false,
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const port = Number(process.env.PORT) || 3000;

  await app.listen(port);

  console.log('🚀 Server running on port:', port);
}

bootstrap();
