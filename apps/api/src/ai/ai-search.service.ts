import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { PropertyEntity } from '../entities/property.entity';
import { CountryEntity } from '../entities/country.entity';
import { enrichProperty } from '../properties/property-public.util';

const SAMPLE_MP4 = 'https://www.w3schools.com/html/mov_bbb.mp4';

export interface AiSearchFilters {
  bedroomsMin?: number;
  cityPattern?: string;
  /** Free-text locality (e.g. "anekal") matched against city/title/address */
  textPlace?: string;
  maxPrice?: number;
  propertyType?: string;
  sortByYield?: boolean;
}

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

/**
 * When users type a state in "City or state" (e.g. Karnataka) but DB rows only have
 * `city = Bangalore` and `state` empty, `city LIKE %karnataka%` fails. OR in known
 * city needles for that state so Bangalore listings still match.
 */
const STATE_EXTRA_CITY_NEEDLES: Record<string, string[]> = {
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

function buildExplicitCityOrStateWhere(
  ec: string,
): { sql: string; params: Record<string, string> } {
  const ect = `%${ec.toLowerCase()}%`;
  const ecKey = ec.toLowerCase().trim();
  const extras = STATE_EXTRA_CITY_NEEDLES[ecKey];
  const parts: string[] = [
    'LOWER(COALESCE(p.city,\'\')) LIKE :ecTpl',
    'LOWER(COALESCE(p.state,\'\')) LIKE :ecTpl',
  ];
  const params: Record<string, string> = { ecTpl: ect };
  if (extras?.length) {
    extras.forEach((n, i) => {
      const key = `ecCity${i}`;
      parts.push(`LOWER(COALESCE(p.city,\'\')) LIKE :${key}`);
      params[key] = `%${n}%`;
    });
  }
  return { sql: `(${parts.join(' OR ')})`, params };
}

function extractTextPlace(lower: string): string | undefined {
  let s = lower.replace(/\b\d+\s*bhk\b/g, ' ');
  s = s.replace(
    /\b(find|show|search|me|need|want|get|looking|for|a|an|the|in|at|near|under|below|upto|up to|and|or|properties|property|sale|rent|buy|lease|budget)\b/g,
    ' ',
  );
  s = s.replace(/\b\d+(?:\.\d+)?\s*(?:cr|crores?|l|lakh|lakhs)\b/g, ' ');
  s = s.replace(/[^a-z0-9\s]/g, ' ');
  s = s.replace(/\s+/g, ' ').trim();
  const tokens = s
    .split(' ')
    .filter((t) => t.length >= 3 && !NON_PLACE_TOKENS.has(t));
  if (tokens.length === 0) return undefined;
  if (tokens.length === 1) return tokens[0];
  const longest = [...tokens].sort((a, b) => b.length - a.length)[0];
  return longest.length >= 5 ? longest : tokens[tokens.length - 1];
}

@Injectable()
export class AiSearchService {
  constructor(
    @InjectRepository(PropertyEntity)
    private readonly repo: Repository<PropertyEntity>,
    @InjectRepository(CountryEntity)
    private readonly countries: Repository<CountryEntity>,
  ) {}

  parseQuery(q: string): AiSearchFilters {
    const s = q.trim();
    const lower = s.toLowerCase();
    const f: AiSearchFilters = {};

    const bhk = s.match(/(\d+)\s*bhk/i);
    if (bhk) f.bedroomsMin = +bhk[1];

    const crores = lower.match(/(\d+(?:\.\d+)?)\s*cr(?:ore)?s?\b/);
    if (crores) f.maxPrice = +crores[1] * 1e7;

    const lakh = s.match(/(?:under|below|upto|up to|<)\s*(\d+)\s*l\b/i) || s.match(/(\d+)\s*l(?:akh)?\b/i);
    if (lakh && !f.maxPrice) f.maxPrice = +lakh[1] * 1e5;

    const cities: [string, string][] = [
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
      if (tp) f.textPlace = tp;
    }

    if (/(villa|apartment|house|commercial)/i.test(s)) {
      const m = s.match(/(villa|apartment|house|commercial)/i);
      if (m) f.propertyType = m[1].toLowerCase();
    }

    if (/yield|rental|income/i.test(lower)) f.sortByYield = true;

    return f;
  }

  /** How the main-query place needle is applied (explicit city/address fields are separate AND filters). */
  private applyPlaceNeedle(
    qb: ReturnType<Repository<PropertyEntity>['createQueryBuilder']>,
    placeNeedle: string,
    placeScope: 'any' | 'city' | 'address',
  ) {
    const tpl = `%${placeNeedle.toLowerCase()}%`;
    if (placeScope === 'city') {
      qb.andWhere(
        '(LOWER(COALESCE(p.city,\'\')) LIKE :placeTpl OR LOWER(COALESCE(p.state,\'\')) LIKE :placeTpl)',
        { placeTpl: tpl },
      );
      return;
    }
    if (placeScope === 'address') {
      qb.andWhere(
        '(LOWER(COALESCE(p.address_line1,\'\')) LIKE :placeTpl OR LOWER(COALESCE(p.description,\'\')) LIKE :placeTpl OR LOWER(p.title) LIKE :placeTpl)',
        { placeTpl: tpl },
      );
      return;
    }
    qb.andWhere(
      '(LOWER(COALESCE(p.city,\'\')) LIKE :placeTpl OR LOWER(p.title) LIKE :placeTpl OR LOWER(COALESCE(p.address_line1,\'\')) LIKE :placeTpl OR LOWER(COALESCE(p.description,\'\')) LIKE :placeTpl)',
      { placeTpl: tpl },
    );
  }

  async search(
    rawQuery: string,
    opts?: {
      countryCode?: string;
      countryId?: string;
      /** Where to match the place parsed from the main query (default any). */
      placeScope?: 'any' | 'city' | 'address';
      /** Extra AND on city or state (e.g. "Bangalore", "Karnataka") — independent of NLP place. */
      explicitCity?: string;
      /** Extra AND on address line / title / description (e.g. "Anekal"). */
      explicitAddress?: string;
    },
  ): Promise<{
    items: (PropertyEntity & { aiRecommended?: boolean })[];
    total: number;
    parsed: AiSearchFilters;
  }> {
    const parsed = this.parseQuery(rawQuery || '');
    const now = new Date();

    let countryId: string | undefined;
    if (opts?.countryId) {
      countryId = opts.countryId;
    } else if (opts?.countryCode && opts.countryCode.toLowerCase() !== 'all') {
      const row = await this.countries.findOne({
        where: { code: opts.countryCode.toUpperCase() },
      });
      countryId = row?.id;
    }

    const applyCountry = (qb: ReturnType<Repository<PropertyEntity>['createQueryBuilder']>) => {
      if (countryId) qb.andWhere('p.country_id = :countryId', { countryId });
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
    /** City/state box: match literal text OR known cities when user typed a state name (see STATE_EXTRA_CITY_NEEDLES). */
    if (ec) {
      const { sql, params } = buildExplicitCityOrStateWhere(ec);
      qb.andWhere(sql, params);
    }
    if (ea) {
      const eat = `%${ea.toLowerCase()}%`;
      qb.andWhere(
        '(LOWER(COALESCE(p.address_line1,\'\')) LIKE :eaTpl OR LOWER(COALESCE(p.description,\'\')) LIKE :eaTpl OR LOWER(p.title) LIKE :eaTpl)',
        { eaTpl: eat },
      );
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
    } else {
      qb.orderBy('p.created_at', 'DESC');
    }

    qb.take(100);
    let items = await qb.getMany();

    const hasPlaceIntent = !!(
      parsed.cityPattern ||
      parsed.textPlace ||
      (opts?.explicitCity?.trim() ?? '') ||
      (opts?.explicitAddress?.trim() ?? '')
    );
    const hadNonPlaceFilters =
      parsed.bedroomsMin != null || parsed.maxPrice != null || !!parsed.propertyType;

    /**
     * Do not substitute 24 random country listings when the user asked for a locality
     * (e.g. "anekal") and we found none — that looked like a successful search but was wrong.
     * Only widen when filters were budget/BHK/type-only and country is set.
     */
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

    const withImages =
      items.length > 0
        ? await this.repo.find({
            where: { id: In(items.map((p) => p.id)) },
            relations: ['images'],
          })
        : [];
    const imgMap = new Map(withImages.map((p) => [p.id, p.images]));
    items.forEach((p) => {
      (p as PropertyEntity & { images: PropertyEntity['images'] }).images = imgMap.get(p.id) ?? [];
    });

    const top = Math.min(5, items.length);
    const out = items.map((p, i) => ({
      ...enrichProperty(p),
      aiRecommended: i < top,
    })) as (ReturnType<typeof enrichProperty> & { aiRecommended?: boolean })[];

    return { items: out, total: out.length, parsed };
  }

  sampleVideoUrl() {
    return SAMPLE_MP4;
  }
}
