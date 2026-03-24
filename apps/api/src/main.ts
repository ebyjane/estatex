process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import * as fs from 'fs';
import { AppModule } from './app.module';

type ExpressLayer = {
  route?: { path?: string; methods?: Record<string, boolean> };
  name?: string;
  handle?: { stack?: ExpressLayer[] };
};

function listRoutes(app: NestExpressApplication): string[] {
  const expressApp = app.getHttpAdapter().getInstance() as {
    _router?: { stack?: ExpressLayer[] };
  };
  const stack = expressApp._router?.stack ?? [];
  const routes: string[] = [];

  const collect = (layers: ExpressLayer[]) => {
    for (const layer of layers) {
      if (layer.route?.path && layer.route.methods) {
        const methods = Object.keys(layer.route.methods).map((m) => m.toUpperCase());
        for (const method of methods) routes.push(`${method} ${layer.route.path}`);
      } else if (layer.name === 'router' && layer.handle?.stack) {
        collect(layer.handle.stack);
      }
    }
  };

  collect(stack);
  return [...new Set(routes)].sort();
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.get('/', (_req: unknown, res: { send: (body: string) => void }) => {
    res.send('API OK');
  });
  const uploadRoot = join(process.cwd(), 'uploads');
  fs.mkdirSync(join(uploadRoot, 'listings'), { recursive: true });
  app.useStaticAssets(uploadRoot, { prefix: '/uploads/', index: false });

  expressApp.get('/api/v1/test', (_req: unknown, res: { json: (body: object) => void }) => {
    res.json({ message: 'API working' });
  });

  app.enableCors({
    origin: '*',
    credentials: false,
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Real Estate API')
    .setDescription('API documentation')
    .setVersion('1.0')
    .build();
  const swaggerDoc = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, swaggerDoc);

  const port = Number(process.env.PORT) || 3000;

  await app.listen(port);

  console.log('🚀 Server running on port:', port);
  console.log('📚 Swagger docs: /api/docs');
  console.log('📍 Registered routes:');
  for (const route of listRoutes(app)) {
    console.log(`- ${route}`);
  }
}

bootstrap();
