"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTypeOrmConfig = getTypeOrmConfig;
function getTypeOrmConfig() {
    const url = process.env.DATABASE_URL?.trim();
    const base = {
        type: 'postgres',
        autoLoadEntities: true,
        extra: {
            max: Math.min(Number(process.env.DB_POOL_MAX || 10), 50),
        },
    };
    if (url) {
        try {
            const u = new URL(url);
            console.log('[database.config] DATABASE_URL host:', u.hostname, '| ssl: on');
        }
        catch {
            console.log('[database.config] DATABASE_URL set (could not parse host for log)');
        }
        return {
            ...base,
            url,
            ssl: { rejectUnauthorized: false },
        };
    }
    const host = process.env.DB_HOST || 'localhost';
    console.log('[database.config] DB_HOST:', host, '| ssl: on');
    return {
        ...base,
        host,
        port: +(process.env.DB_PORT || 5432),
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_NAME || 'postgres',
        ssl: { rejectUnauthorized: false },
    };
}
//# sourceMappingURL=database.config.js.map