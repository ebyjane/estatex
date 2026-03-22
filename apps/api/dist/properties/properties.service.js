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
var PropertiesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PropertiesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const property_entity_1 = require("../entities/property.entity");
const country_entity_1 = require("../entities/country.entity");
const property_image_entity_1 = require("../entities/property-image.entity");
const user_entity_1 = require("../entities/user.entity");
const shared_1 = require("@real-estate/shared");
const ai_score_service_1 = require("../ai/ai-score.service");
const property_public_util_1 = require("./property-public.util");
function moveUrlFirst(urls, primary) {
    if (!urls.length || !primary?.trim())
        return urls;
    const p = primary.trim();
    const i = urls.findIndex((u) => String(u).trim() === p);
    if (i <= 0)
        return urls;
    const next = [...urls];
    const [x] = next.splice(i, 1);
    return [x, ...next];
}
const REGIONAL_DEFAULTS = {
    IND: { avgYield: 4, growth: 8 },
    UAE: { avgYield: 5, growth: 6 },
    USA: { avgYield: 4, growth: 5 },
};
let PropertiesService = PropertiesService_1 = class PropertiesService {
    constructor(repo, countries, images, users, aiScore) {
        this.repo = repo;
        this.countries = countries;
        this.images = images;
        this.users = users;
        this.aiScore = aiScore;
        this.log = new common_1.Logger(PropertiesService_1.name);
    }
    async findAll(filters) {
        const limit = Math.min(filters.limit || 20, 500);
        const offset = filters.offset || 0;
        let countryId = filters.countryId;
        if (!countryId && filters.countryCode) {
            const row = await this.countries.findOne({
                where: { code: filters.countryCode.toUpperCase() },
            });
            countryId = row?.id;
        }
        const qb = this.repo
            .createQueryBuilder('p')
            .where('p.status = :status', { status: 'active' })
            .andWhere(new typeorm_2.Brackets((w) => {
            w.where('p.listing_expires_at IS NULL').orWhere('p.listing_expires_at > :now', {
                now: new Date(),
            });
        }));
        if (countryId)
            qb.andWhere('p.country_id = :countryId', { countryId });
        if (filters.type)
            qb.andWhere('p.property_type = :type', { type: filters.type });
        if (filters.listingType)
            qb.andWhere('p.listing_type = :listingType', { listingType: filters.listingType });
        if (filters.minPrice != null)
            qb.andWhere('p.price >= :minPrice', { minPrice: filters.minPrice });
        if (filters.maxPrice != null)
            qb.andWhere('p.price <= :maxPrice', { maxPrice: filters.maxPrice });
        if (filters.minBedrooms != null)
            qb.andWhere('p.bedrooms >= :minBedrooms', { minBedrooms: filters.minBedrooms });
        if (filters.maxBedrooms != null)
            qb.andWhere('p.bedrooms <= :maxBedrooms', { maxBedrooms: filters.maxBedrooms });
        if (filters.city?.trim()) {
            qb.andWhere('LOWER(p.city) LIKE LOWER(:city)', { city: `%${filters.city.trim()}%` });
        }
        if (filters.minLat != null && filters.maxLat != null && filters.minLng != null && filters.maxLng != null) {
            qb.andWhere('p.latitude BETWEEN :minLat AND :maxLat', {
                minLat: filters.minLat,
                maxLat: filters.maxLat,
            }).andWhere('p.longitude BETWEEN :minLng AND :maxLng', {
                minLng: filters.minLng,
                maxLng: filters.maxLng,
            });
        }
        const [rows, total] = await qb
            .take(limit)
            .skip(offset)
            .orderBy('p.created_at', 'DESC')
            .getManyAndCount();
        this.log.log(`Returning properties: ${rows.length} (total matching: ${total})`);
        if (rows.length === 0) {
            this.log.warn('findAll returned 0 rows — check DB seed, filters, or listing_expires_at');
        }
        if (rows.length > 0) {
            const withImages = await this.repo.find({
                where: { id: (0, typeorm_2.In)(rows.map((p) => p.id)) },
                relations: ['images'],
            });
            const imgMap = new Map(withImages.map((p) => [p.id, p.images]));
            rows.forEach((p) => {
                p.images = imgMap.get(p.id) ?? [];
            });
        }
        const data = rows.map((p) => (0, property_public_util_1.enrichProperty)(p));
        const page = Math.floor(offset / limit) + 1;
        const hasMore = offset + data.length < total;
        return {
            data,
            items: data,
            page,
            hasMore,
            total,
        };
    }
    async findOne(id) {
        const p = await this.repo.findOne({
            where: { id },
            relations: ['images'],
        });
        return p ? (0, property_public_util_1.enrichProperty)(p) : null;
    }
    async findOnePublic(id) {
        const p = await this.repo.findOne({
            where: { id },
            relations: ['images'],
        });
        if (!p || p.status !== 'active')
            return null;
        const now = new Date();
        if (p.listingExpiresAt && new Date(p.listingExpiresAt) < now)
            return null;
        return (0, property_public_util_1.enrichProperty)(p);
    }
    async submitPublicListing(dto, options) {
        const maxImages = options?.maxImages ?? 24;
        const allowMultiVideo = options?.allowMultiVideo === true;
        const countryCode = String(dto.countryCode || 'IND').toUpperCase();
        const row = await this.countries.findOne({ where: { code: countryCode } });
        if (!row)
            throw new common_1.BadRequestException(`Unknown country: ${countryCode}`);
        const ltRaw = String(dto.listingType || 'sale').toLowerCase();
        const listingType = ['rent', 'sale', 'pg', 'flatmates'].includes(ltRaw) ? ltRaw : 'sale';
        const singleVideo = dto.videoUrl != null ? String(dto.videoUrl).trim() : '';
        const multiVideos = allowMultiVideo && Array.isArray(dto.videoUrls)
            ? dto.videoUrls.map((v) => String(v).trim()).filter(Boolean)
            : [];
        let orderedVideos = [];
        if (allowMultiVideo) {
            orderedVideos = [...multiVideos];
            if (singleVideo && !orderedVideos.includes(singleVideo))
                orderedVideos.unshift(singleVideo);
            if (!orderedVideos.length && singleVideo)
                orderedVideos = [singleVideo];
        }
        else if (singleVideo) {
            orderedVideos = [singleVideo];
        }
        const primaryVid = dto.primaryVideoUrl != null ? String(dto.primaryVideoUrl).trim() : '';
        orderedVideos = moveUrlFirst(orderedVideos, primaryVid || undefined);
        const primaryVideo = orderedVideos[0] ?? null;
        const videoUrlsStored = orderedVideos.length ? orderedVideos : null;
        const prop = this.repo.create({
            countryId: row.id,
            ownerId: options?.ownerUserId ?? undefined,
            title: String(dto.title || 'New listing').slice(0, 500),
            description: dto.description != null ? String(dto.description) : undefined,
            city: dto.city != null ? String(dto.city) : undefined,
            state: dto.state != null ? String(dto.state) : undefined,
            addressLine1: dto.addressLine1 != null ? String(dto.addressLine1) : undefined,
            propertyType: dto.propertyType != null ? String(dto.propertyType) : undefined,
            listingType,
            price: Number(dto.price) || 0,
            currencyCode: String(dto.currencyCode || row.currencyCode || 'USD')
                .toUpperCase()
                .slice(0, 3),
            areaSqft: dto.areaSqft != null ? Number(dto.areaSqft) : undefined,
            bedrooms: dto.bedrooms != null ? Number(dto.bedrooms) : undefined,
            bathrooms: dto.bathrooms != null ? Number(dto.bathrooms) : undefined,
            ...(() => {
                const r = (0, shared_1.coerceOptionalLatLng)(dto.latitude, dto.longitude);
                if (!r.ok)
                    throw new common_1.BadRequestException(r.error);
                return r.coords
                    ? { latitude: r.coords.latitude, longitude: r.coords.longitude }
                    : { latitude: undefined, longitude: undefined };
            })(),
            ownerName: dto.ownerName != null ? String(dto.ownerName) : undefined,
            ownerEmail: dto.ownerEmail != null ? String(dto.ownerEmail) : undefined,
            ownerPhone: dto.ownerPhone != null ? String(dto.ownerPhone) : undefined,
            furnishing: dto.furnishing != null ? String(dto.furnishing) : undefined,
            floorNumber: dto.floorNumber != null ? Number(dto.floorNumber) : undefined,
            totalFloors: dto.totalFloors != null ? Number(dto.totalFloors) : undefined,
            depositAmount: dto.depositAmount != null ? Number(dto.depositAmount) : undefined,
            maintenanceMonthly: dto.maintenanceMonthly != null ? Number(dto.maintenanceMonthly) : undefined,
            whatsappOptIn: dto.whatsappOptIn === true,
            amenities: Array.isArray(dto.amenities) ? dto.amenities.map(String) : null,
            videoUrl: primaryVideo,
            videoUrls: videoUrlsStored,
            rentalEstimate: dto.expectedRentMonthly != null
                ? Number(dto.expectedRentMonthly)
                : listingType === 'rent' && dto.price != null
                    ? Number(dto.price)
                    : undefined,
            status: 'pending',
            listingExpiresAt: null,
            isVerified: false,
            isFeatured: false,
        });
        const saved = await this.repo.save(prop);
        const rawUrls = Array.isArray(dto.imageUrls) ? dto.imageUrls.map(String).filter(Boolean) : [];
        const primaryImg = dto.primaryImageUrl != null ? String(dto.primaryImageUrl).trim() : '';
        const urls = moveUrlFirst(rawUrls, primaryImg || undefined).slice(0, maxImages);
        let sortOrder = 0;
        for (const url of urls) {
            await this.images.save(this.images.create({ propertyId: saved.id, url, sortOrder: sortOrder++ }));
        }
        const regional = REGIONAL_DEFAULTS[countryCode] || REGIONAL_DEFAULTS.USA;
        let patch = {
            aiValueScore: 52,
            aiCategory: 'FAIR',
            riskScore: 45,
            cagr5y: regional.growth,
            rentalYield: listingType === 'rent' ? 5.2 : undefined,
        };
        if (saved.rentalEstimate != null &&
            saved.price > 0 &&
            (listingType === 'sale' || listingType === 'flatmates')) {
            const result = this.aiScore.fromRentalEstimate({
                price: Number(saved.price),
                rentalEstimate: Number(saved.rentalEstimate),
                regionalAvgYield: regional.avgYield,
                regionalGrowth: regional.growth,
                marketAvgPrice: Number(saved.price) * 1.05,
            });
            patch = {
                aiValueScore: result.valueScore,
                aiCategory: result.category,
                rentalYield: result.rentalYield,
                riskScore: result.riskScore,
                cagr5y: regional.growth,
            };
        }
        await this.repo.update(saved.id, patch);
        return this.findOne(saved.id);
    }
    async canEditProperty(id, user) {
        const p = await this.repo.findOne({ where: { id }, select: ['id', 'ownerId'] });
        if (!p)
            return { canEdit: false };
        if (user.role === 'admin')
            return { canEdit: true };
        if (!p.ownerId)
            return { canEdit: false };
        return { canEdit: p.ownerId === user.id };
    }
    async findOneForEdit(id, user) {
        const p = await this.repo.findOne({ where: { id }, relations: ['images'] });
        if (!p)
            throw new common_1.NotFoundException('Property not found');
        if (user.role !== 'admin') {
            if (!p.ownerId || p.ownerId !== user.id) {
                throw new common_1.ForbiddenException('You cannot edit this listing');
            }
        }
        const country = await this.countries.findOne({ where: { id: p.countryId } });
        let out = {
            ...(0, property_public_util_1.enrichProperty)(p),
            countryCode: country?.code ?? 'IND',
        };
        if (p.ownerId) {
            const u = await this.users.findOne({
                where: { id: p.ownerId },
                select: ['firstName', 'lastName', 'email', 'phone'],
            });
            if (u) {
                const nm = [u.firstName, u.lastName].filter(Boolean).join(' ').trim();
                if (!String(out.ownerName || '').trim() && nm)
                    out = { ...out, ownerName: nm };
                if (!String(out.ownerEmail || '').trim() && u.email)
                    out = { ...out, ownerEmail: u.email };
                if (!String(out.ownerPhone || '').trim() && u.phone)
                    out = { ...out, ownerPhone: u.phone };
            }
        }
        return out;
    }
    async updateWithAuth(id, dto, user) {
        const p = await this.repo.findOne({ where: { id }, relations: ['images'] });
        if (!p)
            throw new common_1.NotFoundException('Property not found');
        const isAdmin = user.role === 'admin';
        const isOwner = p.ownerId === user.id;
        if (!isAdmin && !isOwner)
            throw new common_1.ForbiddenException('Not allowed to edit this listing');
        if (!isAdmin && !p.ownerId)
            throw new common_1.ForbiddenException('This listing has no owner account linked');
        const maxImages = isAdmin ? 500 : 24;
        const allowMultiVideo = isAdmin;
        const patch = {};
        if (dto.countryCode !== undefined) {
            const cc = String(dto.countryCode || 'IND').toUpperCase();
            const row = await this.countries.findOne({ where: { code: cc } });
            if (!row)
                throw new common_1.BadRequestException(`Unknown country: ${cc}`);
            patch.countryId = row.id;
        }
        if (dto.title !== undefined)
            patch.title = String(dto.title || '').slice(0, 500);
        if (dto.description !== undefined)
            patch.description = String(dto.description);
        if (dto.city !== undefined)
            patch.city = dto.city != null ? String(dto.city) : undefined;
        if (dto.state !== undefined)
            patch.state = dto.state != null ? String(dto.state) : undefined;
        if (dto.addressLine1 !== undefined)
            patch.addressLine1 = dto.addressLine1 != null ? String(dto.addressLine1) : undefined;
        if (dto.propertyType !== undefined)
            patch.propertyType = dto.propertyType != null ? String(dto.propertyType) : undefined;
        if (dto.listingType !== undefined) {
            const ltRaw = String(dto.listingType || 'sale').toLowerCase();
            patch.listingType = ['rent', 'sale', 'pg', 'flatmates'].includes(ltRaw) ? ltRaw : p.listingType;
        }
        if (dto.price !== undefined)
            patch.price = Number(dto.price) || 0;
        if (dto.currencyCode !== undefined) {
            patch.currencyCode = String(dto.currencyCode || 'USD')
                .toUpperCase()
                .slice(0, 3);
        }
        if (dto.areaSqft !== undefined)
            patch.areaSqft = dto.areaSqft != null ? Number(dto.areaSqft) : undefined;
        if (dto.bedrooms !== undefined)
            patch.bedrooms = dto.bedrooms != null ? Number(dto.bedrooms) : undefined;
        if (dto.bathrooms !== undefined)
            patch.bathrooms = dto.bathrooms != null ? Number(dto.bathrooms) : undefined;
        if (dto.latitude === null || dto.longitude === null) {
            patch.latitude = undefined;
            patch.longitude = undefined;
        }
        else if (dto.latitude !== undefined || dto.longitude !== undefined) {
            const latIn = dto.latitude !== undefined ? dto.latitude : p.latitude;
            const lngIn = dto.longitude !== undefined ? dto.longitude : p.longitude;
            const r = (0, shared_1.coerceOptionalLatLng)(latIn, lngIn);
            if (!r.ok)
                throw new common_1.BadRequestException(r.error);
            if (r.coords) {
                patch.latitude = r.coords.latitude;
                patch.longitude = r.coords.longitude;
            }
            else {
                patch.latitude = undefined;
                patch.longitude = undefined;
            }
        }
        if (dto.ownerName !== undefined)
            patch.ownerName = dto.ownerName != null ? String(dto.ownerName) : undefined;
        if (dto.ownerEmail !== undefined)
            patch.ownerEmail = dto.ownerEmail != null ? String(dto.ownerEmail) : undefined;
        if (dto.ownerPhone !== undefined)
            patch.ownerPhone = dto.ownerPhone != null ? String(dto.ownerPhone) : undefined;
        if (dto.furnishing !== undefined)
            patch.furnishing = dto.furnishing != null ? String(dto.furnishing) : undefined;
        if (dto.floorNumber !== undefined)
            patch.floorNumber = dto.floorNumber != null ? Number(dto.floorNumber) : undefined;
        if (dto.totalFloors !== undefined)
            patch.totalFloors = dto.totalFloors != null ? Number(dto.totalFloors) : undefined;
        if (dto.depositAmount !== undefined)
            patch.depositAmount = dto.depositAmount != null ? Number(dto.depositAmount) : undefined;
        if (dto.maintenanceMonthly !== undefined) {
            patch.maintenanceMonthly = dto.maintenanceMonthly != null ? Number(dto.maintenanceMonthly) : undefined;
        }
        if (dto.whatsappOptIn !== undefined)
            patch.whatsappOptIn = dto.whatsappOptIn === true;
        if (dto.amenities !== undefined) {
            patch.amenities = Array.isArray(dto.amenities) ? dto.amenities.map(String) : null;
        }
        if (dto.videoUrl !== undefined || dto.videoUrls !== undefined || dto.primaryVideoUrl !== undefined) {
            const singleVideo = dto.videoUrl != null ? String(dto.videoUrl).trim() : '';
            const multiVideos = allowMultiVideo && Array.isArray(dto.videoUrls)
                ? dto.videoUrls.map((v) => String(v).trim()).filter(Boolean)
                : [];
            let orderedVideos = [];
            if (allowMultiVideo) {
                orderedVideos = [...multiVideos];
                if (singleVideo && !orderedVideos.includes(singleVideo))
                    orderedVideos.unshift(singleVideo);
                if (!orderedVideos.length && singleVideo)
                    orderedVideos = [singleVideo];
            }
            else if (dto.videoUrl !== undefined) {
                orderedVideos = singleVideo ? [singleVideo] : [];
            }
            else {
                orderedVideos = p.videoUrls?.length ? [...p.videoUrls] : p.videoUrl ? [String(p.videoUrl)] : [];
            }
            const primaryVid = dto.primaryVideoUrl != null ? String(dto.primaryVideoUrl).trim() : '';
            orderedVideos = moveUrlFirst(orderedVideos, primaryVid || undefined);
            const primaryVideo = orderedVideos[0] ?? null;
            patch.videoUrl = primaryVideo;
            patch.videoUrls = orderedVideos.length ? orderedVideos : null;
        }
        const effectiveLt = (patch.listingType ?? p.listingType);
        if (dto.expectedRentMonthly !== undefined) {
            patch.rentalEstimate =
                dto.expectedRentMonthly != null && String(dto.expectedRentMonthly).trim() !== ''
                    ? Number(dto.expectedRentMonthly)
                    : undefined;
        }
        else if (dto.listingType !== undefined || dto.price !== undefined) {
            const priceNum = patch.price != null ? Number(patch.price) : Number(p.price);
            if (effectiveLt === 'rent' && dto.price !== undefined) {
                patch.rentalEstimate = priceNum;
            }
        }
        if (isAdmin) {
            if (dto.status !== undefined)
                patch.status = String(dto.status);
            if (dto.isVerified !== undefined)
                patch.isVerified = Boolean(dto.isVerified);
            if (dto.isFeatured !== undefined)
                patch.isFeatured = Boolean(dto.isFeatured);
            if (dto.rejectReason !== undefined)
                patch.rejectReason = dto.rejectReason != null ? String(dto.rejectReason) : null;
            if (dto.ownerVerified !== undefined)
                patch.ownerVerified = Boolean(dto.ownerVerified);
            if (dto.fraudFlag !== undefined)
                patch.fraudFlag = Boolean(dto.fraudFlag);
        }
        await this.repo.update(id, patch);
        if (dto.imageUrls !== undefined) {
            const rawUrls = Array.isArray(dto.imageUrls) ? dto.imageUrls.map(String).filter(Boolean) : [];
            const primaryImg = dto.primaryImageUrl != null ? String(dto.primaryImageUrl).trim() : '';
            const urls = moveUrlFirst(rawUrls, primaryImg || undefined).slice(0, maxImages);
            await this.images.delete({ propertyId: id });
            let sortOrder = 0;
            for (const url of urls) {
                await this.images.save(this.images.create({ propertyId: id, url, sortOrder: sortOrder++ }));
            }
        }
        const updated = await this.repo.findOne({ where: { id }, relations: ['images'] });
        if (!updated)
            return null;
        const listingType = (updated.listingType || 'sale');
        const country = await this.countries.findOne({ where: { id: updated.countryId } });
        const countryCode = country?.code ?? 'USA';
        const regional = REGIONAL_DEFAULTS[countryCode] || REGIONAL_DEFAULTS.USA;
        if (updated.rentalEstimate != null &&
            Number(updated.price) > 0 &&
            (listingType === 'sale' || listingType === 'flatmates')) {
            const result = this.aiScore.fromRentalEstimate({
                price: Number(updated.price),
                rentalEstimate: Number(updated.rentalEstimate),
                regionalAvgYield: regional.avgYield,
                regionalGrowth: regional.growth,
                marketAvgPrice: Number(updated.price) * 1.05,
            });
            await this.repo.update(id, {
                aiValueScore: result.valueScore,
                aiCategory: result.category,
                rentalYield: result.rentalYield,
                riskScore: result.riskScore,
                cagr5y: regional.growth,
            });
        }
        return this.findOne(id);
    }
    async create(dto, userId) {
        const expires = new Date();
        expires.setDate(expires.getDate() + 30);
        const prop = this.repo.create({
            ...dto,
            ownerId: userId,
            status: 'active',
            listingExpiresAt: dto.listingExpiresAt ?? expires,
        });
        const saved = await this.repo.save(prop);
        if (dto.rentalEstimate != null && dto.price != null) {
            const regional = REGIONAL_DEFAULTS[dto.currencyCode] || REGIONAL_DEFAULTS.USA;
            const result = this.aiScore.fromRentalEstimate({
                price: Number(dto.price),
                rentalEstimate: Number(dto.rentalEstimate),
                regionalAvgYield: regional.avgYield,
                regionalGrowth: regional.growth,
                marketAvgPrice: Number(dto.price) * 1.05,
            });
            await this.repo.update(saved.id, {
                aiValueScore: result.valueScore,
                aiCategory: result.category,
                rentalYield: result.rentalYield,
                cagr5y: regional.growth,
                riskScore: result.riskScore,
            });
            return this.findOne(saved.id);
        }
        return saved;
    }
    async patchRaw(id, dto) {
        await this.repo.update(id, dto);
        return this.findOne(id);
    }
    async getStats() {
        const [{ count }] = await this.repo
            .createQueryBuilder('p')
            .select('COUNT(*)', 'count')
            .where('p.status = :status', { status: 'active' })
            .getRawMany();
        const total = Number(count) || 0;
        if (total === 0)
            return { total: 0, avgYield: 0, undervalued: 0 };
        const [{ avg }] = await this.repo
            .createQueryBuilder('p')
            .select('AVG(p.rental_yield)', 'avg')
            .where('p.status = :status', { status: 'active' })
            .andWhere('p.rental_yield IS NOT NULL')
            .getRawMany();
        const [{ undervalued }] = await this.repo
            .createQueryBuilder('p')
            .select('COUNT(*)', 'undervalued')
            .where('p.status = :status', { status: 'active' })
            .andWhere('p.ai_value_score >= 80')
            .getRawMany();
        return {
            total,
            avgYield: Number(avg) || 0,
            undervalued: Number(undervalued) || 0,
        };
    }
    async localityInsights(city, countryCode) {
        const c = city?.trim();
        if (!c) {
            return {
                city: '',
                listings: 0,
                avgPrice: 0,
                avgYield: 0,
                avgAiScore: 0,
                avgTrustScore: 0,
            };
        }
        let countryId;
        if (countryCode) {
            const row = await this.countries.findOne({ where: { code: countryCode.toUpperCase() } });
            countryId = row?.id;
        }
        const qb = this.repo
            .createQueryBuilder('p')
            .select('COUNT(*)', 'listings')
            .addSelect('AVG(p.price)', 'avgPrice')
            .addSelect('AVG(p.rental_yield)', 'avgYield')
            .addSelect('AVG(p.ai_value_score)', 'avgAiScore')
            .addSelect('AVG(p.trust_score)', 'avgTrustScore')
            .where('p.status = :status', { status: 'active' })
            .andWhere('LOWER(p.city) = LOWER(:city)', { city: c });
        if (countryId)
            qb.andWhere('p.country_id = :countryId', { countryId });
        const raw = await qb.getRawOne();
        return {
            city: c,
            listings: Math.round(Number(raw?.listings) || 0),
            avgPrice: Number(raw?.avgPrice) || 0,
            avgYield: Number(raw?.avgYield) || 0,
            avgAiScore: Number(raw?.avgAiScore) || 0,
            avgTrustScore: Number(raw?.avgTrustScore) || 0,
            note: 'Aggregates from active listings on Investify (not scraped third-party data).',
        };
    }
    async priceTrends(city, countryCode) {
        const ins = await this.localityInsights(city, countryCode);
        const base = ins.avgPrice > 0 ? ins.avgPrice : 5_000_000;
        const points = [];
        const now = new Date();
        for (let i = 11; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const wave = 1 + Math.sin(i / 2) * 0.02 + (i - 6) * 0.0015;
            points.push({
                label: d.toLocaleString('en', { month: 'short', year: 'numeric' }),
                avgAsk: Math.round(base * wave),
            });
        }
        return {
            city: ins.city,
            points,
            disclaimer: 'Synthetic trend shape for UX demo — derived from current average ask, not historical transactions.',
        };
    }
    async addReport(id, _reason) {
        const p = await this.repo.findOne({ where: { id } });
        if (!p)
            throw new common_1.NotFoundException('Property not found');
        const next = (p.reportCount ?? 0) + 1;
        await this.repo.update(id, {
            reportCount: next,
            fraudFlag: next >= 5 ? true : p.fraudFlag,
        });
        return { ok: true, reportCount: next, fraudFlag: next >= 5 };
    }
};
exports.PropertiesService = PropertiesService;
exports.PropertiesService = PropertiesService = PropertiesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(property_entity_1.PropertyEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(country_entity_1.CountryEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(property_image_entity_1.PropertyImageEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(user_entity_1.UserEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        ai_score_service_1.AiScoreService])
], PropertiesService);
//# sourceMappingURL=properties.service.js.map