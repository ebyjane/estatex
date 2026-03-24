"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const path_1 = require("path");
const fs = require("fs");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const expressApp = app.getHttpAdapter().getInstance();
    expressApp.get('/', (_req, res) => {
        res.send('API OK');
    });
    const uploadRoot = (0, path_1.join)(process.cwd(), 'uploads');
    fs.mkdirSync((0, path_1.join)(uploadRoot, 'listings'), { recursive: true });
    app.useStaticAssets(uploadRoot, { prefix: '/uploads/', index: false });
    app.enableCors({
        origin: '*',
        credentials: false,
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    });
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, transform: true }));
    const port = Number(process.env.PORT) || 3000;
    await app.listen(port);
    console.log('🚀 Server running on port:', port);
}
bootstrap();
//# sourceMappingURL=main.js.map