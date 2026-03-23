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
var AdminPanelService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminPanelService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const property_entity_1 = require("../entities/property.entity");
const user_entity_1 = require("../entities/user.entity");
const lead_entity_1 = require("../entities/lead.entity");
const seo_page_entity_1 = require("../entities/seo-page.entity");
const app_settings_entity_1 = require("../entities/app-settings.entity");
const property_image_entity_1 = require("../entities/property-image.entity");
const investment_entity_1 = require("../entities/investment.entity");
const demo_seed_service_1 = require("./demo-seed.service");
let AdminPanelService = AdminPanelService_1 = class AdminPanelService {
    constructor(demoSeed, props, users, leads, seo, settingsRepo, images, investments) {
        this.demoSeed = demoSeed;
        this.props = props;
        this.users = users;
        this.leads = leads;
        this.seo = seo;
        this.settingsRepo = settingsRepo;
        this.images = images;
        this.investments = investments;
        this.log = new common_1.Logger(AdminPanelService_1.name);
        this.ingestionLog = [];
    }
    async safeEnsureDemoCatalog() {
        try {
            await this.demoSeed.ensureDemoCatalogIfEmpty();
        }
        catch (e) {
            this.log.warn(`ensureDemoCatalogIfEmpty skipped: ${e.message}`);
        }
    }
    async safeExec(fallback, fn, label) {
        try {
            return await fn();
        }
        catch (e) {
            if (label)
                this.log.warn(`${label}: ${e.message}`);
            return fallback;
        }
    }
    pushIngestion(action, detail) {
        this.ingestionLog.unshift({
            at: new Date().toISOString(),
            action,
            detail,
        });
        this.ingestionLog = this.ingestionLog.slice(0, 200);
    }
    getIngestionLogs() {
        return this.ingestionLog;
    }
    async ensureSettingsRow() {
        let row = await this.settingsRepo.findOne({ where: { id: 'default' } });
        if (!row) {
            row = this.settingsRepo.create({ id: 'default', defaultCurrency: 'USD' });
            await this.settingsRepo.save(row);
        }
        return row;
    }
    fallbackOverviewResponse() {
        return this.emptyOverview();
    }
    fallbackPropertiesList(page = 1) {
        return { data: [], page, total: 0, hasMore: false };
    }
    emptyOverview() {
        return {
            totalProperties: 0,
            activeListings: 0,
            pendingListings: 0,
            activeUsers: 0,
            totalLeads: 0,
            totalInvestments: 0,
            revenue: 0,
            revenueNote: 'Connect Stripe billing to populate revenue.',
            avgYield: 0,
            undervaluedListings: 0,
            charts: {
                listingsGrowth: [],
                cityDistribution: [],
                listingTypeSplit: [],
            },
        };
    }
    async overview() {
        await this.safeEnsureDemoCatalog();
        try {
            const totalProperties = await this.safeExec(0, () => this.props.count(), 'overview.totalProperties');
            const activeListings = await this.safeExec(0, () => this.props.count({ where: { status: 'active' } }));
            const pendingListings = await this.safeExec(0, () => this.props.count({ where: { status: 'pending' } }));
            const activeUsers = await this.safeExec(0, () => this.users.count({ where: { accountStatus: 'active' } }));
            const totalLeads = await this.safeExec(0, () => this.leads.count());
            const totalInvestments = await this.safeExec(0, () => this.investments.count());
            const avgYieldNum = await this.safeExec(0, async () => {
                const avgRows = await this.props
                    .createQueryBuilder('p')
                    .select('AVG(p.rental_yield)', 'avgYield')
                    .where('p.status = :s', { s: 'active' })
                    .andWhere('p.rental_yield IS NOT NULL')
                    .getRawMany();
                return Number(avgRows[0]?.avgYield) || 0;
            }, 'overview.avgYield');
            const undervaluedQ = await this.safeExec(0, () => this.props
                .createQueryBuilder('p')
                .where('p.status = :s', { s: 'active' })
                .andWhere('p.ai_value_score >= 80')
                .getCount());
            const listingsGrowth = await this.safeExec([], async () => {
                const since = new Date(Date.now() - 45 * 86400000);
                const recentProps = await this.props.find({
                    where: { createdAt: (0, typeorm_2.MoreThan)(since) },
                    select: { id: true, createdAt: true },
                    take: 5000,
                    order: { createdAt: 'DESC' },
                });
                const byDay = new Map();
                for (const p of recentProps) {
                    if (!p.createdAt)
                        continue;
                    const d = p.createdAt.toISOString().slice(0, 10);
                    byDay.set(d, (byDay.get(d) || 0) + 1);
                }
                return [...byDay.entries()]
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([date, count]) => ({ date, count }));
            }, 'overview.listingsGrowth');
            const cityDist = await this.safeExec([], () => this.props
                .createQueryBuilder('p')
                .select('p.city', 'city')
                .addSelect('COUNT(*)', 'count')
                .where('p.status = :s', { s: 'active' })
                .andWhere('p.city IS NOT NULL')
                .groupBy('p.city')
                .orderBy('count', 'DESC')
                .limit(12)
                .getRawMany(), 'overview.cityDist');
            const typeSplit = await this.safeExec([], () => this.props
                .createQueryBuilder('p')
                .select('p.listing_type', 'listingType')
                .addSelect('COUNT(*)', 'count')
                .where('p.status = :s', { s: 'active' })
                .groupBy('p.listing_type')
                .getRawMany(), 'overview.typeSplit');
            return {
                totalProperties,
                activeListings,
                pendingListings,
                activeUsers,
                totalLeads,
                totalInvestments,
                revenue: 0,
                revenueNote: 'Connect Stripe billing to populate revenue.',
                avgYield: avgYieldNum,
                undervaluedListings: undervaluedQ,
                charts: {
                    listingsGrowth,
                    cityDistribution: cityDist.map((r) => ({ city: r.city || 'Unknown', count: Number(r.count) })),
                    listingTypeSplit: typeSplit.map((r) => ({
                        type: r.listingType || 'unknown',
                        count: Number(r.count),
                    })),
                },
            };
        }
        catch (error) {
            this.log.error('Admin overview error', error instanceof Error ? error.stack : String(error));
            return this.emptyOverview();
        }
    }
    buildAdminPropertyWhere(q) {
        const w = {};
        if (q.city?.trim())
            w.city = (0, typeorm_2.ILike)(`%${q.city.trim()}%`);
        if (q.status?.trim())
            w.status = q.status.trim();
        if (q.listingType?.trim())
            w.listingType = q.listingType.trim();
        if (q.minPrice != null && q.maxPrice != null) {
            w.price = (0, typeorm_2.Between)(Number(q.minPrice), Number(q.maxPrice));
        }
        else if (q.minPrice != null) {
            w.price = (0, typeorm_2.MoreThanOrEqual)(Number(q.minPrice));
        }
        else if (q.maxPrice != null) {
            w.price = (0, typeorm_2.LessThanOrEqual)(Number(q.maxPrice));
        }
        if (q.minAi != null)
            w.aiValueScore = (0, typeorm_2.MoreThanOrEqual)(Number(q.minAi));
        return w;
    }
    mapPropertyAdminRow(p) {
        return {
            id: p.id,
            title: p.title,
            city: p.city,
            price: Number(p.price),
            currencyCode: p.currencyCode,
            listingType: p.listingType,
            propertyType: p.propertyType,
            aiValueScore: p.aiValueScore,
            status: p.status,
            isFeatured: p.isFeatured,
            isVerified: p.isVerified,
            createdAt: p.createdAt,
        };
    }
    async listProperties(q) {
        await this.safeEnsureDemoCatalog();
        const page = Math.max(1, q.page || 1);
        const limit = Math.min(100, Math.max(1, q.limit || 20));
        const skip = (page - 1) * limit;
        try {
            const where = this.buildAdminPropertyWhere(q);
            const hasWhere = Object.keys(where).length > 0;
            const [rows, total] = await this.props.findAndCount({
                ...(hasWhere ? { where } : {}),
                order: { createdAt: 'DESC' },
                skip,
                take: limit,
            });
            return {
                data: rows.map((p) => this.mapPropertyAdminRow(p)),
                page,
                total,
                hasMore: page * limit < total,
            };
        }
        catch (error) {
            this.log.error('listProperties', error instanceof Error ? error.stack : String(error));
            try {
                const [rows, total] = await this.props.findAndCount({
                    order: { createdAt: 'DESC' },
                    skip,
                    take: limit,
                });
                return {
                    data: rows.map((p) => this.mapPropertyAdminRow(p)),
                    page,
                    total,
                    hasMore: page * limit < total,
                };
            }
            catch {
                return { data: [], page, total: 0, hasMore: false };
            }
        }
    }
    async getPropertyAdmin(id) {
        try {
            const p = await this.props.findOne({ where: { id }, relations: ['images'] });
            if (!p)
                throw new common_1.NotFoundException('Property not found');
            return p;
        }
        catch (e) {
            if (e instanceof common_1.NotFoundException)
                throw e;
            this.log.warn(`getPropertyAdmin without images relation: ${e.message}`);
            const p = await this.props.findOne({ where: { id } });
            if (!p)
                throw new common_1.NotFoundException('Property not found');
            return p;
        }
    }
    async patchProperty(id, body) {
        const p = await this.props.findOne({ where: { id } });
        if (!p)
            throw new common_1.NotFoundException('Property not found');
        const expires = new Date();
        expires.setDate(expires.getDate() + 30);
        const patch = { ...body };
        if (body.status === 'active' && p.status !== 'active') {
            patch.listingExpiresAt = expires;
        }
        if (body.status === 'rejected') {
            patch.listingExpiresAt = null;
        }
        await this.props.update(id, patch);
        return this.getPropertyAdmin(id);
    }
    async deleteProperty(id) {
        await this.images.delete({ propertyId: id });
        const r = await this.props.delete(id);
        if (!r.affected)
            throw new common_1.NotFoundException('Property not found');
        return { ok: true };
    }
    async listUsers(page = 1, limit = 20) {
        limit = Math.min(100, Math.max(1, limit));
        const [rows, total] = await this.users.findAndCount({
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
            select: [
                'id',
                'email',
                'firstName',
                'lastName',
                'phone',
                'role',
                'accountStatus',
                'createdAt',
            ],
        });
        return { data: rows, page, total, hasMore: page * limit < total };
    }
    async patchUser(id, body) {
        const u = await this.users.findOne({ where: { id } });
        if (!u)
            throw new common_1.NotFoundException('User not found');
        await this.users.update(id, body);
        return this.users.findOne({
            where: { id },
            select: [
                'id',
                'email',
                'firstName',
                'lastName',
                'phone',
                'role',
                'accountStatus',
                'createdAt',
            ],
        });
    }
    async listLeads(page = 1, limit = 30) {
        limit = Math.min(100, Math.max(1, limit));
        const skip = (page - 1) * limit;
        try {
            const [rows, total] = await this.leads.findAndCount({
                order: { createdAt: 'DESC' },
                skip,
                take: limit,
                relations: ['property'],
            });
            return { data: rows, page, total, hasMore: page * limit < total };
        }
        catch (e) {
            this.log.warn(`listLeads without property relation: ${e.message}`);
            const [rows, total] = await this.leads.findAndCount({
                order: { createdAt: 'DESC' },
                skip,
                take: limit,
            });
            return { data: rows, page, total, hasMore: page * limit < total };
        }
    }
    async patchLead(id, body) {
        const l = await this.leads.findOne({ where: { id } });
        if (!l)
            throw new common_1.NotFoundException('Lead not found');
        await this.leads.update(id, body);
        try {
            return await this.leads.findOne({ where: { id }, relations: ['property'] });
        }
        catch {
            return this.leads.findOne({ where: { id } });
        }
    }
    async listSeo() {
        return this.seo.find({ order: { updatedAt: 'DESC' } });
    }
    buildDefaultJsonLd(meta) {
        return JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: meta.metaTitle,
            description: meta.metaDescription,
            url: meta.canonicalUrl || meta.pagePath,
        });
    }
    async upsertSeo(body) {
        const pathNorm = body.pagePath.startsWith('/') ? body.pagePath : `/${body.pagePath}`;
        const jsonLd = body.jsonLd?.trim() ||
            this.buildDefaultJsonLd({
                metaTitle: body.metaTitle,
                metaDescription: body.metaDescription,
                canonicalUrl: body.canonicalUrl,
                pagePath: pathNorm,
            });
        const optional = {
            keywords: body.keywords ?? undefined,
            canonicalUrl: body.canonicalUrl ?? undefined,
            ogTitle: body.ogTitle ?? undefined,
            ogDescription: body.ogDescription ?? undefined,
        };
        if (body.id) {
            await this.seo.update(body.id, {
                pagePath: pathNorm,
                metaTitle: body.metaTitle,
                metaDescription: body.metaDescription,
                ...optional,
                jsonLd,
            });
            return this.seo.findOne({ where: { id: body.id } });
        }
        const existing = await this.seo.findOne({ where: { pagePath: pathNorm } });
        if (existing) {
            await this.seo.update(existing.id, {
                metaTitle: body.metaTitle,
                metaDescription: body.metaDescription,
                ...optional,
                jsonLd,
            });
            return this.seo.findOne({ where: { id: existing.id } });
        }
        const row = this.seo.create({
            pagePath: pathNorm,
            metaTitle: body.metaTitle,
            metaDescription: body.metaDescription,
            keywords: body.keywords ?? null,
            canonicalUrl: body.canonicalUrl ?? null,
            ogTitle: body.ogTitle ?? null,
            ogDescription: body.ogDescription ?? null,
            jsonLd,
        });
        return this.seo.save(row);
    }
    async deleteSeo(id) {
        await this.seo.delete(id);
        return { ok: true };
    }
    async getSettings() {
        return this.ensureSettingsRow();
    }
    async patchSettings(body) {
        const row = await this.ensureSettingsRow();
        if (body.defaultCurrency)
            row.defaultCurrency = body.defaultCurrency.toUpperCase();
        if (body.fxOverrides)
            row.fxOverridesJson = JSON.stringify(body.fxOverrides);
        if (body.aiWeights)
            row.aiWeightsJson = JSON.stringify(body.aiWeights);
        await this.settingsRepo.save(row);
        return row;
    }
};
exports.AdminPanelService = AdminPanelService;
exports.AdminPanelService = AdminPanelService = AdminPanelService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(property_entity_1.PropertyEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.UserEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(lead_entity_1.LeadEntity)),
    __param(4, (0, typeorm_1.InjectRepository)(seo_page_entity_1.SeoPageEntity)),
    __param(5, (0, typeorm_1.InjectRepository)(app_settings_entity_1.AppSettingsEntity)),
    __param(6, (0, typeorm_1.InjectRepository)(property_image_entity_1.PropertyImageEntity)),
    __param(7, (0, typeorm_1.InjectRepository)(investment_entity_1.InvestmentEntity)),
    __metadata("design:paramtypes", [demo_seed_service_1.DemoSeedService,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AdminPanelService);
//# sourceMappingURL=admin-panel.service.js.map