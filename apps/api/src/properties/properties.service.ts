import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, In, Repository } from 'typeorm';
import { PropertyEntity } from '../entities/property.entity';
import { CountryEntity } from '../entities/country.entity';
import { PropertyImageEntity } from '../entities/property-image.entity';
import { UserEntity } from '../entities/user.entity';
import { coerceOptionalLatLng } from '@real-estate/shared';
import { AiScoreService } from '../ai/ai-score.service';
import { enrichProperty } from './property-public.util';

/** Move matching URL to index 0; keeps relative order of the rest. */
function moveUrlFirst(urls: string[], primary: string | undefined | null): string[] {
  if (!urls.length || !primary?.trim()) return urls;
  const p = primary.trim();
  const i = urls.findIndex((u) => String(u).trim() === p);
  if (i <= 0) return urls;
  const next = [...urls];
  const [x] = next.splice(i, 1);
  return [x, ...next];
}

const REGIONAL_DEFAULTS: Record<string, { avgYield: number; growth: number }> = {
  IND: { avgYield: 4, growth: 8 },
  UAE: { avgYield: 5, growth: 6 },
  USA: { avgYield: 4, growth: 5 },
};

@Injectable()
export class PropertiesService {
  private readonly log = new Logger(PropertiesService.name);

  constructor(
    @InjectRepository(PropertyEntity)
    private repo: Repository<PropertyEntity>,
    @InjectRepository(CountryEntity)
    private countries: Repository<CountryEntity>,
    @InjectRepository(PropertyImageEntity)
    private images: Repository<PropertyImageEntity>,
    @InjectRepository(UserEntity)
    private users: Repository<UserEntity>,
    private aiScore: AiScoreService,
  ) {}

  async findAll(filters: {
    countryId?: string;
    countryCode?: string;
    type?: string;
    listingType?: string;
    minPrice?: number;
    maxPrice?: number;
    minBedrooms?: number;
    maxBedrooms?: number;
    city?: string;
    minLat?: number;
    maxLat?: number;
    minLng?: number;
    maxLng?: number;
    currency?: string;
    limit?: number;
    offset?: number;
  }) {
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
      .andWhere(
        new Brackets((w) => {
          w.where('p.listing_expires_at IS NULL').orWhere('p.listing_expires_at > :now', {
            now: new Date(),
          });
        }),
      );
    if (countryId) qb.andWhere('p.country_id = :countryId', { countryId });
    if (filters.type) qb.andWhere('p.property_type = :type', { type: filters.type });
    if (filters.listingType) qb.andWhere('p.listing_type = :listingType', { listingType: filters.listingType });
    if (filters.minPrice != null) qb.andWhere('p.price >= :minPrice', { minPrice: filters.minPrice });
    if (filters.maxPrice != null) qb.andWhere('p.price <= :maxPrice', { maxPrice: filters.maxPrice });
    if (filters.minBedrooms != null) qb.andWhere('p.bedrooms >= :minBedrooms', { minBedrooms: filters.minBedrooms });
    if (filters.maxBedrooms != null) qb.andWhere('p.bedrooms <= :maxBedrooms', { maxBedrooms: filters.maxBedrooms });
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
        where: { id: In(rows.map((p) => p.id)) },
        relations: ['images'],
      });
      const imgMap = new Map(withImages.map((p) => [p.id, p.images]));
      rows.forEach((p) => {
        (p as PropertyEntity & { images: PropertyEntity['images'] }).images = imgMap.get(p.id) ?? [];
      });
    }

    const data = rows.map((p) => enrichProperty(p as PropertyEntity));
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

  async findOne(id: string) {
    const p = await this.repo.findOne({
      where: { id },
      relations: ['images'],
    });
    return p ? enrichProperty(p) : null;
  }

  /** Public detail + SEO: only active, non-expired listings. */
  async findOnePublic(id: string) {
    const p = await this.repo.findOne({
      where: { id },
      relations: ['images'],
    });
    if (!p || p.status !== 'active') return null;
    const now = new Date();
    if (p.listingExpiresAt && new Date(p.listingExpiresAt) < now) return null;
    return enrichProperty(p);
  }

  /**
   * NoBroker-style public submission → pending moderation.
   * `imageUrls`: optional CDN URLs (client uploads to storage first, or paste links).
   * @param options.allowMultiVideo — only admin submit-listing should set true (multiple `videoUrls`).
   * @param options.maxImages — default 24; admin can raise (e.g. 500).
   */
  async submitPublicListing(
    dto: Record<string, unknown>,
    options?: { maxImages?: number; allowMultiVideo?: boolean; ownerUserId?: string },
  ) {
    const maxImages = options?.maxImages ?? 24;
    const allowMultiVideo = options?.allowMultiVideo === true;
    const countryCode = String(dto.countryCode || 'IND').toUpperCase();
    const row = await this.countries.findOne({ where: { code: countryCode } });
    if (!row) throw new BadRequestException(`Unknown country: ${countryCode}`);

    const ltRaw = String(dto.listingType || 'sale').toLowerCase();
    const listingType = ['rent', 'sale', 'pg', 'flatmates'].includes(ltRaw) ? ltRaw : 'sale';

    const singleVideo = dto.videoUrl != null ? String(dto.videoUrl).trim() : '';
    const fromVideoUrls = Array.isArray(dto.videoUrls)
      ? (dto.videoUrls as unknown[]).map((v) => String(v).trim()).filter(Boolean)
      : [];
    let orderedVideos: string[] = [];
    if (allowMultiVideo) {
      orderedVideos = [...fromVideoUrls];
      if (singleVideo && !orderedVideos.includes(singleVideo)) orderedVideos.unshift(singleVideo);
      if (!orderedVideos.length && singleVideo) orderedVideos = [singleVideo];
    } else if (singleVideo) {
      orderedVideos = [singleVideo];
    } else if (fromVideoUrls.length) {
      orderedVideos = [fromVideoUrls[0]];
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
        const r = coerceOptionalLatLng(dto.latitude, dto.longitude);
        if (!r.ok) throw new BadRequestException(r.error);
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
      amenities: Array.isArray(dto.amenities) ? (dto.amenities as unknown[]).map(String) : null,
      videoUrl: primaryVideo,
      videoUrls: videoUrlsStored,
      rentalEstimate:
        dto.expectedRentMonthly != null
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
    const rawUrls = Array.isArray(dto.imageUrls) ? (dto.imageUrls as unknown[]).map(String).filter(Boolean) : [];
    const primaryImg = dto.primaryImageUrl != null ? String(dto.primaryImageUrl).trim() : '';
    const urls = moveUrlFirst(rawUrls, primaryImg || undefined).slice(0, maxImages);
    let sortOrder = 0;
    for (const url of urls) {
      await this.images.save(
        this.images.create({ propertyId: saved.id, url, sortOrder: sortOrder++ }),
      );
    }

    const regional = REGIONAL_DEFAULTS[countryCode] || REGIONAL_DEFAULTS.USA;
    let patch: Partial<PropertyEntity> = {
      aiValueScore: 52,
      aiCategory: 'FAIR',
      riskScore: 45,
      cagr5y: regional.growth,
      rentalYield: listingType === 'rent' ? 5.2 : undefined,
    };

    if (
      saved.rentalEstimate != null &&
      saved.price > 0 &&
      (listingType === 'sale' || listingType === 'flatmates')
    ) {
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

  async canEditProperty(id: string, user: { id: string; role: string }) {
    const p = await this.repo.findOne({ where: { id }, select: ['id', 'ownerId'] });
    if (!p) return { canEdit: false };
    if (user.role === 'admin') return { canEdit: true };
    if (!p.ownerId) return { canEdit: false };
    return { canEdit: p.ownerId === user.id };
  }

  /** Full listing for the post wizard (any status); owner or admin only. */
  async findOneForEdit(id: string, user: { id: string; role: string }) {
    const p = await this.repo.findOne({ where: { id }, relations: ['images'] });
    if (!p) throw new NotFoundException('Property not found');
    if (user.role !== 'admin') {
      if (!p.ownerId || p.ownerId !== user.id) {
        throw new ForbiddenException('You cannot edit this listing');
      }
    }
    const country = await this.countries.findOne({ where: { id: p.countryId } });
    let out: ReturnType<typeof enrichProperty> & { countryCode: string } = {
      ...enrichProperty(p),
      countryCode: country?.code ?? 'IND',
    };

    /**
     * Only backfill from the **listing owner** user row when property contact columns are empty.
     * Never use the signed-in editor (e.g. admin) — that replaced saved listing contact with admin profile.
     */
    if (p.ownerId) {
      const u = await this.users.findOne({
        where: { id: p.ownerId },
        select: ['firstName', 'lastName', 'email', 'phone'],
      });
      if (u) {
        const nm = [u.firstName, u.lastName].filter(Boolean).join(' ').trim();
        if (!String(out.ownerName || '').trim() && nm) out = { ...out, ownerName: nm };
        if (!String(out.ownerEmail || '').trim() && u.email) out = { ...out, ownerEmail: u.email };
        if (!String(out.ownerPhone || '').trim() && u.phone) out = { ...out, ownerPhone: u.phone };
      }
    }

    return out;
  }

  /**
   * Owner: listing fields only (no moderation flags). Admin: full listing + media replacement.
   * Body shape matches public submit-listing (partial keys update only when present).
   */
  async updateWithAuth(id: string, dto: Record<string, unknown>, user: { id: string; role: string }) {
    const p = await this.repo.findOne({ where: { id }, relations: ['images'] });
    if (!p) throw new NotFoundException('Property not found');
    const isAdmin = user.role === 'admin';
    const isOwner = p.ownerId === user.id;
    if (!isAdmin && !isOwner) throw new ForbiddenException('Not allowed to edit this listing');
    if (!isAdmin && !p.ownerId) throw new ForbiddenException('This listing has no owner account linked');

    const maxImages = isAdmin ? 500 : 24;
    const allowMultiVideo = isAdmin;

    const patch: Partial<PropertyEntity> = {};

    if (dto.countryCode !== undefined) {
      const cc = String(dto.countryCode || 'IND').toUpperCase();
      const row = await this.countries.findOne({ where: { code: cc } });
      if (!row) throw new BadRequestException(`Unknown country: ${cc}`);
      patch.countryId = row.id;
    }

    if (dto.title !== undefined) patch.title = String(dto.title || '').slice(0, 500);
    if (dto.description !== undefined) patch.description = String(dto.description);
    if (dto.city !== undefined) patch.city = dto.city != null ? String(dto.city) : undefined;
    if (dto.state !== undefined) patch.state = dto.state != null ? String(dto.state) : undefined;
    if (dto.addressLine1 !== undefined) patch.addressLine1 = dto.addressLine1 != null ? String(dto.addressLine1) : undefined;
    if (dto.propertyType !== undefined) patch.propertyType = dto.propertyType != null ? String(dto.propertyType) : undefined;
    if (dto.listingType !== undefined) {
      const ltRaw = String(dto.listingType || 'sale').toLowerCase();
      patch.listingType = ['rent', 'sale', 'pg', 'flatmates'].includes(ltRaw) ? ltRaw : p.listingType;
    }
    if (dto.price !== undefined) patch.price = Number(dto.price) || 0;
    if (dto.currencyCode !== undefined) {
      patch.currencyCode = String(dto.currencyCode || 'USD')
        .toUpperCase()
        .slice(0, 3);
    }
    if (dto.areaSqft !== undefined) patch.areaSqft = dto.areaSqft != null ? Number(dto.areaSqft) : undefined;
    if (dto.bedrooms !== undefined) patch.bedrooms = dto.bedrooms != null ? Number(dto.bedrooms) : undefined;
    if (dto.bathrooms !== undefined) patch.bathrooms = dto.bathrooms != null ? Number(dto.bathrooms) : undefined;
    if (dto.latitude === null || dto.longitude === null) {
      patch.latitude = undefined;
      patch.longitude = undefined;
    } else if (dto.latitude !== undefined || dto.longitude !== undefined) {
      const latIn = dto.latitude !== undefined ? dto.latitude : p.latitude;
      const lngIn = dto.longitude !== undefined ? dto.longitude : p.longitude;
      const r = coerceOptionalLatLng(latIn, lngIn);
      if (!r.ok) throw new BadRequestException(r.error);
      if (r.coords) {
        patch.latitude = r.coords.latitude;
        patch.longitude = r.coords.longitude;
      } else {
        patch.latitude = undefined;
        patch.longitude = undefined;
      }
    }
    if (dto.ownerName !== undefined) patch.ownerName = dto.ownerName != null ? String(dto.ownerName) : undefined;
    if (dto.ownerEmail !== undefined) patch.ownerEmail = dto.ownerEmail != null ? String(dto.ownerEmail) : undefined;
    if (dto.ownerPhone !== undefined) patch.ownerPhone = dto.ownerPhone != null ? String(dto.ownerPhone) : undefined;
    if (dto.furnishing !== undefined) patch.furnishing = dto.furnishing != null ? String(dto.furnishing) : undefined;
    if (dto.floorNumber !== undefined) patch.floorNumber = dto.floorNumber != null ? Number(dto.floorNumber) : undefined;
    if (dto.totalFloors !== undefined) patch.totalFloors = dto.totalFloors != null ? Number(dto.totalFloors) : undefined;
    if (dto.depositAmount !== undefined) patch.depositAmount = dto.depositAmount != null ? Number(dto.depositAmount) : undefined;
    if (dto.maintenanceMonthly !== undefined) {
      patch.maintenanceMonthly = dto.maintenanceMonthly != null ? Number(dto.maintenanceMonthly) : undefined;
    }
    if (dto.whatsappOptIn !== undefined) patch.whatsappOptIn = dto.whatsappOptIn === true;
    if (dto.amenities !== undefined) {
      patch.amenities = Array.isArray(dto.amenities) ? (dto.amenities as unknown[]).map(String) : null;
    }

    if (dto.videoUrl !== undefined || dto.videoUrls !== undefined || dto.primaryVideoUrl !== undefined) {
      const singleVideo = dto.videoUrl != null ? String(dto.videoUrl).trim() : '';
      const fromVideoUrls =
        dto.videoUrls !== undefined && Array.isArray(dto.videoUrls)
          ? (dto.videoUrls as unknown[]).map((v) => String(v).trim()).filter(Boolean)
          : null;
      let orderedVideos: string[] = [];
      if (allowMultiVideo) {
        if (fromVideoUrls !== null) {
          orderedVideos = [...fromVideoUrls];
          if (dto.videoUrl !== undefined) {
            if (singleVideo && !orderedVideos.includes(singleVideo)) orderedVideos.unshift(singleVideo);
            if (!orderedVideos.length && singleVideo) orderedVideos = [singleVideo];
          }
        } else if (dto.videoUrl !== undefined) {
          orderedVideos = singleVideo ? [singleVideo] : [];
        } else {
          orderedVideos = p.videoUrls?.length ? [...p.videoUrls] : p.videoUrl ? [String(p.videoUrl)] : [];
        }
      } else if (dto.videoUrl !== undefined) {
        orderedVideos = singleVideo ? [singleVideo] : [];
      } else if (fromVideoUrls !== null) {
        orderedVideos = fromVideoUrls.length ? [fromVideoUrls[0]] : [];
      } else {
        orderedVideos = p.videoUrls?.length ? [...p.videoUrls] : p.videoUrl ? [String(p.videoUrl)] : [];
      }
      const primaryVid = dto.primaryVideoUrl != null ? String(dto.primaryVideoUrl).trim() : '';
      orderedVideos = moveUrlFirst(orderedVideos, primaryVid || undefined);
      const primaryVideo = orderedVideos[0] ?? null;
      patch.videoUrl = primaryVideo;
      patch.videoUrls = orderedVideos.length ? orderedVideos : null;
    }

    const effectiveLt = (patch.listingType ?? p.listingType) as string;
    if (dto.expectedRentMonthly !== undefined) {
      patch.rentalEstimate =
        dto.expectedRentMonthly != null && String(dto.expectedRentMonthly).trim() !== ''
          ? Number(dto.expectedRentMonthly)
          : undefined;
    } else if (dto.listingType !== undefined || dto.price !== undefined) {
      const priceNum = patch.price != null ? Number(patch.price) : Number(p.price);
      if (effectiveLt === 'rent' && dto.price !== undefined) {
        patch.rentalEstimate = priceNum;
      }
    }

    if (isAdmin) {
      if (dto.status !== undefined) patch.status = String(dto.status);
      if (dto.isVerified !== undefined) patch.isVerified = Boolean(dto.isVerified);
      if (dto.isFeatured !== undefined) patch.isFeatured = Boolean(dto.isFeatured);
      if (dto.rejectReason !== undefined) patch.rejectReason = dto.rejectReason != null ? String(dto.rejectReason) : null;
      if (dto.ownerVerified !== undefined) patch.ownerVerified = Boolean(dto.ownerVerified);
      if (dto.fraudFlag !== undefined) patch.fraudFlag = Boolean(dto.fraudFlag);
    }

    await this.repo.update(id, patch as object);

    if (dto.imageUrls !== undefined) {
      const rawUrls = Array.isArray(dto.imageUrls) ? (dto.imageUrls as unknown[]).map(String).filter(Boolean) : [];
      const primaryImg = dto.primaryImageUrl != null ? String(dto.primaryImageUrl).trim() : '';
      const urls = moveUrlFirst(rawUrls, primaryImg || undefined).slice(0, maxImages);
      await this.images.delete({ propertyId: id });
      let sortOrder = 0;
      for (const url of urls) {
        await this.images.save(this.images.create({ propertyId: id, url, sortOrder: sortOrder++ }));
      }
    }

    const updated = await this.repo.findOne({ where: { id }, relations: ['images'] });
    if (!updated) return null;
    const listingType = (updated.listingType || 'sale') as string;
    const country = await this.countries.findOne({ where: { id: updated.countryId } });
    const countryCode = country?.code ?? 'USA';
    const regional = REGIONAL_DEFAULTS[countryCode] || REGIONAL_DEFAULTS.USA;

    if (
      updated.rentalEstimate != null &&
      Number(updated.price) > 0 &&
      (listingType === 'sale' || listingType === 'flatmates')
    ) {
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

  async create(dto: Partial<PropertyEntity>, userId?: string) {
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
      const regional = REGIONAL_DEFAULTS[dto.currencyCode as string] || REGIONAL_DEFAULTS.USA;
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
      return this.findOne(saved.id) as Promise<PropertyEntity>;
    }
    return saved;
  }

  /** Internal / AI hooks — no auth. Prefer `updateWithAuth` from the API. */
  async patchRaw(id: string, dto: Partial<PropertyEntity>) {
    await this.repo.update(id, dto as object);
    return this.findOne(id);
  }

  async getStats(): Promise<{ total: number; avgYield: number; undervalued: number }> {
    const [{ count }] = await this.repo
      .createQueryBuilder('p')
      .select('COUNT(*)', 'count')
      .where('p.status = :status', { status: 'active' })
      .getRawMany();

    const total = Number(count) || 0;
    if (total === 0) return { total: 0, avgYield: 0, undervalued: 0 };

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

  async localityInsights(city: string, countryCode?: string) {
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
    let countryId: string | undefined;
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
    if (countryId) qb.andWhere('p.country_id = :countryId', { countryId });
    const raw = await qb.getRawOne<{
      listings: string;
      avgPrice: string;
      avgYield: string;
      avgAiScore: string;
      avgTrustScore: string;
    }>();
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

  /** Indicative 12-point series from current listing average (no external price index). */
  async priceTrends(city: string, countryCode?: string) {
    const ins = await this.localityInsights(city, countryCode);
    const base = ins.avgPrice > 0 ? ins.avgPrice : 5_000_000;
    const points: { label: string; avgAsk: number }[] = [];
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
      disclaimer:
        'Synthetic trend shape for UX demo — derived from current average ask, not historical transactions.',
    };
  }

  async addReport(id: string, _reason?: string) {
    const p = await this.repo.findOne({ where: { id } });
    if (!p) throw new NotFoundException('Property not found');
    const next = (p.reportCount ?? 0) + 1;
    await this.repo.update(id, {
      reportCount: next,
      fraudFlag: next >= 5 ? true : p.fraudFlag,
    });
    return { ok: true, reportCount: next, fraudFlag: next >= 5 };
  }
}
