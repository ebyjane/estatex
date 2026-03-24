"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDatabaseConfig = void 0;
const getDatabaseConfig = () => {
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
exports.getDatabaseConfig = getDatabaseConfig;
//# sourceMappingURL=database.config.js.map