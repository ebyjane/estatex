"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const typeorm_1 = require("typeorm");
const path_1 = require("path");
const fs = require("fs");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const uploadRoot = (0, path_1.join)(process.cwd(), 'uploads');
    fs.mkdirSync((0, path_1.join)(uploadRoot, 'listings'), { recursive: true });
    app.useStaticAssets(uploadRoot, { prefix: '/uploads/', index: false });
    try {
        const ds = app.get(typeorm_1.DataSource);
        if (ds.isInitialized) {
            const dbPath = typeof ds.options.database === 'string'
                ? ds.options.database
                : '';
            console.log(dbPath ? `DB Connected: ${dbPath}` : 'DB Connected');
        }
    }
    catch {
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
    app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, transform: true }));
    const port = Number(process.env.PORT) || 8000;
    await app.listen(port);
    console.log(`Server running on port ${port}`);
    console.log(`API base: http://localhost:${port}/api/v1`);
}
bootstrap();
//# sourceMappingURL=main.js.map