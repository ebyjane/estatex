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
            console.log('Connected to DB');
            const o = ds.options;
            console.log(o.url
                ? 'DB host: PostgreSQL via DATABASE_URL'
                : `DB host: PostgreSQL / ${o.database ?? 'default'}`);
        }
    }
    catch {
        console.error('DB connection check failed at startup');
    }
    app.enableCors({
        origin: '*',
        credentials: false,
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