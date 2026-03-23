"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTypeOrmConfig = getTypeOrmConfig;
function getTypeOrmConfig() {
    return {
        type: 'postgres',
        url: process.env.DATABASE_URL,
        autoLoadEntities: true,
        synchronize: process.env.DATABASE_SYNC === 'true',
    };
}
//# sourceMappingURL=database.config.js.map