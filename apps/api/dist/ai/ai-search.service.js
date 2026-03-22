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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiSearchService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const property_entity_1 = require("../entities/property.entity");
const country_entity_1 = require("../entities/country.entity");
const property_public_util_1 = require("../properties/property-public.util");
const SAMPLE_MP4 = 'https://www.w3schools.com/html/mov_bbb.mp4';
const NON_PLACE_TOKENS = new Set([
    'find',
    'show',
    'search',
    'need',
    'want',
    'get',
    'looking',
    'for',
    'properties',
    'property',
    'the',
    'and',
    'with',
    'sale',
    'rent',
    'buy',
    'lease',
    'budget',
    'villa',
    'apartment',
    'house',
    'commercial',
]);
const STATE_EXTRA_CITY_NEEDLES = {
    karnataka: [
        'bangalore',
        'bengaluru',
        'mysore',
        'mysuru',
        'mangalore',
        'mangaluru',
        'hubli',
        'belgaum',
        'belagavi',
        'anekal',
        'davangere',
        'tumkur',
    ],
    maharashtra: ['mumbai', 'pune', 'nagpur', 'thane', 'nashik', 'aurangabad'],
    'tamil nadu': ['chennai', 'coimbatore', 'madurai', 'tiruchirappalli', 'salem'],
    telangana: ['hyderabad', 'secunderabad', 'warangal'],
    'uttar pradesh': ['lucknow', 'kanpur', 'noida', 'ghaziabad', 'agra'],
    gujarat: ['ahmedabad', 'surat', 'vadodara', 'rajkot'],
    'west bengal': ['kolkata', 'howrah', 'durgapur'],
    rajasthan: ['jaipur', 'jodhpur', 'udaipur'],
    'andhra pradesh': ['visakhapatnam', 'vijayawada', 'guntur'],
    kerala: ['kochi', 'thiruvananthapuram', 'kozhikode'],
    punjab: ['ludhiana', 'amritsar'],
    haryana: ['gurgaon', 'gurugram', 'faridabad'],
};
function buildExplicitCityOrStateWhere(ec) {
    const ect = `%${ec.toLowerCase()}%`;
    const ecKey = ec.toLowerCase().trim();
    const extras = STATE_EXTRA_CITY_NEEDLES[ecKey];
    const parts = [
        'LOWER(COALESCE(p.city,\'\')) LIKE :ecTpl',
        'LOWER(COALESCE(p.state,\'\')) LIKE :ecTpl',
    ];
    const params = { ecTpl: ect };
    if (extras?.length) {
        extras.forEach((n, i) => {
            const key = `ecCity${i}`;
            parts.push(`LOWER(COALESCE(p.city,\'\')) LIKE :${key}`);
            params[key] = `%${n}%`;
        });
    }
    return { sql: `(${parts.join(' OR ')})`, params };
}
function extractTextPlace(lower) {
    let s = lower.replace(/\b\d+\s*bhk\b/g, ' ');
    s = s.replace(/\b(find|show|search|me|need|want|get|looking|for|a|an|the|in|at|near|under|below|upto|up to|and|or|properties|property|sale|rent|buy|lease|budget)\b/g, ' ');
    s = s.replace(/\b\d+(?:\.\d+)?\s*(?:cr|crores?|l|lakh|lakhs)\b/g, ' ');
    s = s.replace(/[^a-z0-9\s]/g, ' ');
    s = s.replace(/\s+/g, ' ').trim();
    const tokens = s
        .split(' ')
        .filter((t) => t.length >= 3 && !NON_PLACE_TOKENS.has(t));
    if (tokens.length === 0)
        return undefined;
    if (tokens.length === 1)
        return tokens[0];
    const longest = [...tokens].sort((a, b) => b.length - a.length)[0];
    return longest.length >= 5 ? longest : tokens[tokens.length - 1];
}
let AiSearchService = class AiSearchService {
    constructor(repo, countries) {
        this.repo = repo;
        this.countries = countries;
    }
    parseQuery(q) {
        const s = q.trim();
        const lower = s.toLowerCase();
        const f = {};
        const bhk = s.match(/(\d+)\s*bhk/i);
        if (bhk)
            f.bedroomsMin = +bhk[1];
        const crores = lower.match(/(\d+(?:\.\d+)?)\s*cr(?:ore)?s?\b/);
        if (crores)
            f.maxPrice = +crores[1] * 1e7;
        const lakh = s.match(/(?:under|below|upto|up to|<)\s*(\d+)\s*l\b/i) || s.match(/(\d+)\s*l(?:akh)?\b/i);
        if (lakh && !f.maxPrice)
            f.maxPrice = +lakh[1] * 1e5;
        const cities = [
            ['bangalore', 'Bangalore'],
            ['bengaluru', 'Bangalore'],
            ['mumbai', 'Mumbai'],
            ['dubai', 'Dubai'],
            ['hyderabad', 'Hyderabad'],
            ['chennai', 'Chennai'],
            ['pune', 'Pune'],
            ['delhi', 'Delhi'],
            ['mysore', 'Mysore'],
            ['mysuru', 'Mysore'],
            ['anekal', 'Anekal'],
            ['austin', 'Austin'],
            ['houston', 'Houston'],
        ];
        for (const [needle, city] of cities) {
            if (lower.includes(needle)) {
                f.cityPattern = city;
                break;
            }
        }
        if (!f.cityPattern) {
            const tp = extractTextPlace(lower);
            if (tp)
                f.textPlace = tp;
        }
        if (/(villa|apartment|house|commercial)/i.test(s)) {
            const m = s.match(/(villa|apartment|house|commercial)/i);
            if (m)
                f.propertyType = m[1].toLowerCase();
        }
        if (/yield|rental|income/i.test(lower))
            f.sortByYield = true;
        return f;
    }
    applyPlaceNeedle(qb, placeNeedle, placeScope) {
        const tpl = `%${placeNeedle.toLowerCase()}%`;
        if (placeScope === 'city') {
            qb.andWhere('(LOWER(COALESCE(p.city,\'\')) LIKE :placeTpl OR LOWER(COALESCE(p.state,\'\')) LIKE :placeTpl)', { placeTpl: tpl });
            return;
        }
        if (placeScope === 'address') {
            qb.andWhere('(LOWER(COALESCE(p.address_line1,\'\')) LIKE :placeTpl OR LOWER(COALESCE(p.description,\'\')) LIKE :placeTpl OR LOWER(p.title) LIKE :placeTpl)', { placeTpl: tpl });
            return;
        }
        qb.andWhere('(LOWER(COALESCE(p.city,\'\')) LIKE :placeTpl OR LOWER(p.title) LIKE :placeTpl OR LOWER(COALESCE(p.address_line1,\'\')) LIKE :placeTpl OR LOWER(COALESCE(p.description,\'\')) LIKE :placeTpl)', { placeTpl: tpl });
    }
    async search(rawQuery, opts) {
        const parsed = this.parseQuery(rawQuery || '');
        const now = new Date();
        let countryId;
        if (opts?.countryId) {
            countryId = opts.countryId;
        }
        else if (opts?.countryCode && opts.countryCode.toLowerCase() !== 'all') {
            const row = await this.countries.findOne({
                where: { code: opts.countryCode.toUpperCase() },
            });
            countryId = row?.id;
        }
        const applyCountry = (qb) => {
            if (countryId)
                qb.andWhere('p.country_id = :countryId', { countryId });
        };
        const qb = this.repo
            .createQueryBuilder('p')
            .where('p.status = :status', { status: 'active' })
            .andWhere('(p.listing_expires_at IS NULL OR p.listing_expires_at > :now)', { now });
        applyCountry(qb);
        if (parsed.bedroomsMin != null) {
            qb.andWhere('p.bedrooms >= :beds', { beds: parsed.bedroomsMin });
        }
        const placeScope = opts?.placeScope ?? 'any';
        const placeNeedle = parsed.cityPattern
            ? parsed.cityPattern.toLowerCase()
            : parsed.textPlace
                ? parsed.textPlace.toLowerCase()
                : '';
        const ec = opts?.explicitCity?.trim();
        const ea = opts?.explicitAddress?.trim();
        if (ec) {
            const { sql, params } = buildExplicitCityOrStateWhere(ec);
            qb.andWhere(sql, params);
        }
        if (ea) {
            const eat = `%${ea.toLowerCase()}%`;
            qb.andWhere('(LOWER(COALESCE(p.address_line1,\'\')) LIKE :eaTpl OR LOWER(COALESCE(p.description,\'\')) LIKE :eaTpl OR LOWER(p.title) LIKE :eaTpl)', { eaTpl: eat });
        }
        if (placeNeedle) {
            this.applyPlaceNeedle(qb, placeNeedle, placeScope);
        }
        if (parsed.maxPrice != null) {
            qb.andWhere('p.price <= :maxP', { maxP: parsed.maxPrice });
        }
        if (parsed.propertyType) {
            qb.andWhere('LOWER(COALESCE(p.property_type,\'\')) = :pt', { pt: parsed.propertyType.toLowerCase() });
        }
        if (parsed.sortByYield) {
            qb.orderBy('p.rental_yield', 'DESC').addOrderBy('p.created_at', 'DESC');
        }
        else {
            qb.orderBy('p.created_at', 'DESC');
        }
        qb.take(100);
        let items = await qb.getMany();
        const hasPlaceIntent = !!(parsed.cityPattern ||
            parsed.textPlace ||
            (opts?.explicitCity?.trim() ?? '') ||
            (opts?.explicitAddress?.trim() ?? ''));
        const hadNonPlaceFilters = parsed.bedroomsMin != null || parsed.maxPrice != null || !!parsed.propertyType;
        if (items.length === 0 && countryId && !hasPlaceIntent && hadNonPlaceFilters) {
            const qb2 = this.repo
                .createQueryBuilder('p')
                .where('p.status = :status', { status: 'active' })
                .andWhere('(p.listing_expires_at IS NULL OR p.listing_expires_at > :now)', { now })
                .andWhere('p.country_id = :countryId', { countryId })
                .orderBy('p.created_at', 'DESC')
                .take(24);
            items = await qb2.getMany();
        }
        const withImages = items.length > 0
            ? await this.repo.find({
                where: { id: (0, typeorm_2.In)(items.map((p) => p.id)) },
                relations: ['images'],
            })
            : [];
        const imgMap = new Map(withImages.map((p) => [p.id, p.images]));
        items.forEach((p) => {
            p.images = imgMap.get(p.id) ?? [];
        });
        const top = Math.min(5, items.length);
        const out = items.map((p, i) => ({
            ...(0, property_public_util_1.enrichProperty)(p),
            aiRecommended: i < top,
        }));
        return { items: out, total: out.length, parsed };
    }
    sampleVideoUrl() {
        return SAMPLE_MP4;
    }
};
exports.AiSearchService = AiSearchService;
exports.AiSearchService = AiSearchService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(property_entity_1.PropertyEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(country_entity_1.CountryEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], AiSearchService);
//# sourceMappingURL=ai-search.service.js.map