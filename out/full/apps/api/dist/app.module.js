"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const auth_module_1 = require("./auth/auth.module");
const properties_module_1 = require("./properties/properties.module");
const countries_module_1 = require("./countries/countries.module");
const calculator_module_1 = require("./calculator/calculator.module");
const fx_module_1 = require("./fx/fx.module");
const compare_module_1 = require("./compare/compare.module");
const stripe_module_1 = require("./stripe/stripe.module");
const ai_module_1 = require("./ai/ai.module");
const admin_module_1 = require("./admin/admin.module");
const seo_module_1 = require("./seo/seo.module");
const health_module_1 = require("./health/health.module");
const path = require("path");
const getDatabaseConfig = () => {
    const dbType = process.env.DATABASE_TYPE || 'sqlite';
    if (dbType === 'postgres') {
        return {
            type: 'postgres',
            host: process.env.DB_HOST || 'localhost',
            port: +(process.env.DB_PORT || 5432),
            username: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'postgres',
            database: process.env.DB_NAME || 'real_estate',
        };
    }
    const fs = require('fs');
    const cwd = process.cwd();
    let databasePath;
    if (process.env.DATABASE_PATH) {
        databasePath = path.isAbsolute(process.env.DATABASE_PATH)
            ? process.env.DATABASE_PATH
            : path.join(cwd, process.env.DATABASE_PATH);
    }
    else {
        const repoRootDb = path.join(cwd, '..', '..', 'real-estate.db');
        const cwdDb = path.join(cwd, 'real-estate.db');
        if (fs.existsSync(repoRootDb))
            databasePath = repoRootDb;
        else if (fs.existsSync(cwdDb))
            databasePath = cwdDb;
        else
            databasePath = repoRootDb;
    }
    return {
        type: 'better-sqlite3',
        database: databasePath,
    };
};
const dbConfig = getDatabaseConfig();
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            health_module_1.HealthModule,
            typeorm_1.TypeOrmModule.forRoot({
                ...dbConfig,
                autoLoadEntities: true,
                synchronize: process.env.NODE_ENV !== 'production',
            }),
            ai_module_1.AiModule,
            admin_module_1.AdminModule,
            seo_module_1.SeoModule,
            auth_module_1.AuthModule,
            properties_module_1.PropertiesModule,
            countries_module_1.CountriesModule,
            calculator_module_1.CalculatorModule,
            fx_module_1.FxModule,
            compare_module_1.CompareModule,
            stripe_module_1.StripeModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map