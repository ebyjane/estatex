"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const path_1 = require("path");
const fs = require("fs");
const app_module_1 = require("./app.module");
function listRoutes(app) {
    const expressApp = app.getHttpAdapter().getInstance();
    const stack = expressApp._router?.stack ?? [];
    const routes = [];
    const collect = (layers) => {
        for (const layer of layers) {
            if (layer.route?.path && layer.route.methods) {
                const methods = Object.keys(layer.route.methods).map((m) => m.toUpperCase());
                for (const method of methods)
                    routes.push(`${method} ${layer.route.path}`);
            }
            else if (layer.name === 'router' && layer.handle?.stack) {
                collect(layer.handle.stack);
            }
        }
    };
    collect(stack);
    return [...new Set(routes)].sort();
}
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const expressApp = app.getHttpAdapter().getInstance();
    expressApp.get('/', (_req, res) => {
        res.send('API OK');
    });
    const uploadRoot = (0, path_1.join)(process.cwd(), 'uploads');
    fs.mkdirSync((0, path_1.join)(uploadRoot, 'listings'), { recursive: true });
    app.useStaticAssets(uploadRoot, { prefix: '/uploads/', index: false });
    expressApp.get('/api/v1/test', (_req, res) => {
        res.json({ message: 'API working' });
    });
    app.enableCors({
        origin: '*',
        credentials: false,
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    });
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, transform: true }));
    const swaggerConfig = new swagger_1.DocumentBuilder()
        .setTitle('Real Estate API')
        .setDescription('API documentation')
        .setVersion('1.0')
        .build();
    const swaggerDoc = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
    swagger_1.SwaggerModule.setup('api/docs', app, swaggerDoc);
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
//# sourceMappingURL=main.js.map