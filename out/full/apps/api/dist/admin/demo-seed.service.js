"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var DemoSeedService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DemoSeedService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const bcrypt = require("bcrypt");
const typeorm_2 = require("typeorm");
const shared_1 = require("@real-estate/shared");
const country_entity_1 = require("../entities/country.entity");
const property_image_entity_1 = require("../entities/property-image.entity");
const property_entity_1 = require("../entities/property.entity");
const user_entity_1 = require("../entities/user.entity");
let DemoSeedService = DemoSeedService_1 = class DemoSeedService {
    constructor(ds) {
        this.ds = ds;
        this.log = new common_1.Logger(DemoSeedService_1.name);
    }
    async run() {
        const rows = (0, shared_1.buildDemoPropertyRows)();
        await this.ds.transaction(async (em) => {
            await em.getRepository(property_image_entity_1.PropertyImageEntity).createQueryBuilder().delete().execute();
            await em.getRepository(property_entity_1.PropertyEntity).createQueryBuilder().delete().execute();
            await em.getRepository(user_entity_1.UserEntity).createQueryBuilder().delete().execute();
            await em.getRepository(country_entity_1.CountryEntity).createQueryBuilder().delete().execute();
            const countryRepo = em.getRepository(country_entity_1.CountryEntity);
            for (const c of shared_1.DEMO_COUNTRIES) {
                await countryRepo.save(countryRepo.create({
                    code: c.code,
                    name: c.name,
                    currencyCode: c.currencyCode,
                    region: c.region,
                    taxRateDefault: 8.5,
                }));
            }
            const savedCountries = await em.find(country_entity_1.CountryEntity);
            const byCode = Object.fromEntries(savedCountries.map((x) => [x.code, x.id]));
            const hash = await bcrypt.hash('admin123', 10);
            const userRepo = em.getRepository(user_entity_1.UserEntity);
            await userRepo.save(userRepo.create({
                email: 'admin@investify.com',
                passwordHash: hash,
                firstName: 'Admin',
                role: 'admin',
            }));
            const propRepo = em.getRepository(property_entity_1.PropertyEntity);
            const imgRepo = em.getRepository(property_image_entity_1.PropertyImageEntity);
            for (const r of rows) {
                const countryId = byCode[r.countryCode];
                if (!countryId)
                    continue;
                const prop = propRepo.create({
                    countryId,
                    title: r.title,
                    description: r.description,
                    city: r.city,
                    state: r.state,
                    addressLine1: r.addressLine1,
                    latitude: r.latitude,
                    longitude: r.longitude,
                    price: r.price,
                    currencyCode: r.currencyCode,
                    bedrooms: r.bedrooms,
                    bathrooms: r.bathrooms,
                    areaSqft: r.areaSqft,
                    propertyType: r.propertyType,
                    listingType: 'sale',
                    status: 'active',
                    rentalEstimate: r.rentalEstimate,
                    rentalYield: r.rentalYieldPct,
                    aiValueScore: r.aiScore,
                    aiCategory: r.aiCategory,
                    growthProjection5yr: r.growthProjection5yr,
                    cagr5y: r.cagr5y,
                    riskScore: r.riskScore,
                    isFeatured: r.isFeatured,
                    isVerified: false,
                    videoUrl: r.videoUrl ?? null,
                });
                const saved = await propRepo.save(prop);
                await imgRepo.save(imgRepo.create({
                    propertyId: saved.id,
                    url: r.imageUrl,
                    sortOrder: 0,
                }));
            }
        });
        this.log.log(`Seed completed: ${rows.length} properties + admin user created`);
        return {
            ok: true,
            properties: rows.length,
            message: `Seed completed: ${rows.length} properties + admin user created`,
        };
    }
    async runIndiaRent5000() {
        const rows = (0, shared_1.buildIndiaRentRows)(5000);
        let inserted = 0;
        await this.ds.transaction(async (em) => {
            const countryRepo = em.getRepository(country_entity_1.CountryEntity);
            let ind = await countryRepo.findOne({ where: { code: 'IND' } });
            if (!ind) {
                ind = await countryRepo.save(countryRepo.create({
                    code: 'IND',
                    name: 'India',
                    currencyCode: 'INR',
                    region: 'APAC',
                    taxRateDefault: 8.5,
                }));
            }
            const propRepo = em.getRepository(property_entity_1.PropertyEntity);
            const imgRepo = em.getRepository(property_image_entity_1.PropertyImageEntity);
            const existing = await propRepo.find({
                where: { listingType: 'rent', countryId: ind.id },
                select: { id: true },
            });
            const ids = existing.map((x) => x.id);
            if (ids.length) {
                await imgRepo.delete({ propertyId: (0, typeorm_2.In)(ids) });
                await propRepo.delete(ids);
            }
            const expires = new Date();
            expires.setDate(expires.getDate() + 30);
            const chunk = 500;
            for (let i = 0; i < rows.length; i += chunk) {
                const slice = rows.slice(i, i + chunk);
                const entities = slice.map((r) => propRepo.create({
                    countryId: ind.id,
                    title: r.title,
                    description: r.description,
                    city: r.city,
                    state: r.state,
                    addressLine1: r.addressLine1,
                    latitude: r.latitude,
                    longitude: r.longitude,
                    price: r.price,
                    currencyCode: r.currencyCode,
                    bedrooms: r.bedrooms,
                    bathrooms: r.bathrooms,
                    areaSqft: r.areaSqft,
                    propertyType: r.propertyType,
                    listingType: 'rent',
                    status: 'active',
                    rentalEstimate: r.rentalEstimate,
                    rentalYield: r.rentalYield,
                    aiValueScore: r.aiValueScore,
                    aiCategory: r.aiCategory,
                    growthProjection5yr: r.growthProjection5yr,
                    cagr5y: r.cagr5y,
                    riskScore: r.riskScore,
                    isFeatured: Math.random() > 0.94,
                    isVerified: Math.random() > 0.45,
                    videoUrl: null,
                    ownerVerified: Math.random() > 0.5,
                    trustScore: 55 + Math.floor(Math.random() * 40),
                    dataCompleteness: 65 + Math.floor(Math.random() * 35),
                    fraudFlag: Math.random() > 0.98,
                    listingExpiresAt: expires,
                }));
                const saved = await propRepo.save(entities);
                const imgEntities = saved.flatMap((s, j) => {
                    const r = slice[j];
                    return r.imageUrls.map((url, k) => imgRepo.create({ propertyId: s.id, url, sortOrder: k }));
                });
                await imgRepo.save(imgEntities);
                inserted += saved.length;
            }
        });
        this.log.log(`Inserted 5000 rent properties (India): ${inserted} rows committed`);
        return {
            ok: true,
            properties: inserted,
            message: `Inserted ${inserted} rent properties`,
        };
    }
    assertCanRunRemote(secret) {
        if (process.env.NODE_ENV !== 'production')
            return;
        const expected = process.env.ADMIN_SEED_SECRET;
        if (!expected || secret !== expected) {
            throw new common_1.ForbiddenException('Demo seed is disabled in production without ADMIN_SEED_SECRET.');
        }
    }
};
exports.DemoSeedService = DemoSeedService;
exports.DemoSeedService = DemoSeedService = DemoSeedService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.DataSource])
], DemoSeedService);
//# sourceMappingURL=demo-seed.service.js.map