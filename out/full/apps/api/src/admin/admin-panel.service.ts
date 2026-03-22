import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PropertyEntity } from '../entities/property.entity';
import { UserEntity } from '../entities/user.entity';
import { LeadEntity } from '../entities/lead.entity';
import { SeoPageEntity } from '../entities/seo-page.entity';
import { AppSettingsEntity } from '../entities/app-settings.entity';
import { PropertyImageEntity } from '../entities/property-image.entity';

@Injectable()
export class AdminPanelService {
  private readonly log = new Logger(AdminPanelService.name);
  private ingestionLog: { at: string; action: string; detail: string }[] = [];

  constructor(
    @InjectRepository(PropertyEntity) private readonly props: Repository<PropertyEntity>,
    @InjectRepository(UserEntity) private readonly users: Repository<UserEntity>,
    @InjectRepository(LeadEntity) private readonly leads: Repository<LeadEntity>,
    @InjectRepository(SeoPageEntity) private readonly seo: Repository<SeoPageEntity>,
    @InjectRepository(AppSettingsEntity) private readonly settingsRepo: Repository<AppSettingsEntity>,
    @InjectRepository(PropertyImageEntity) private readonly images: Repository<PropertyImageEntity>,
  ) {}

  pushIngestion(action: string, detail: string) {
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

  async overview() {
    const totalProperties = await this.props.count();
    const activeListings = await this.props.count({ where: { status: 'active' } });
    const pendingListings = await this.props.count({ where: { status: 'pending' } });
    const activeUsers = await this.users.count({ where: { accountStatus: 'active' } });
    const totalLeads = await this.leads.count();

    const [{ avgYield }] = await this.props
      .createQueryBuilder('p')
      .select('AVG(p.rental_yield)', 'avgYield')
      .where('p.status = :s', { s: 'active' })
      .andWhere('p.rental_yield IS NOT NULL')
      .getRawMany<{ avgYield: string }>();

    const undervaluedQ = await this.props
      .createQueryBuilder('p')
      .where('p.status = :s', { s: 'active' })
      .andWhere('p.ai_value_score >= 80')
      .getCount();

    const since = new Date(Date.now() - 45 * 86400000);
    const recentProps = await this.props
      .createQueryBuilder('p')
      .select(['p.id', 'p.createdAt'])
      .where('p.created_at >= :since', { since })
      .getMany();
    const byDay = new Map<string, number>();
    for (const p of recentProps) {
      const d = p.createdAt.toISOString().slice(0, 10);
      byDay.set(d, (byDay.get(d) || 0) + 1);
    }
    const listingsGrowth = [...byDay.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }));

    const cityDist = await this.props
      .createQueryBuilder('p')
      .select('p.city', 'city')
      .addSelect('COUNT(*)', 'count')
      .where('p.status = :s', { s: 'active' })
      .andWhere('p.city IS NOT NULL')
      .groupBy('p.city')
      .orderBy('count', 'DESC')
      .limit(12)
      .getRawMany<{ city: string; count: string }>();

    const typeSplit = await this.props
      .createQueryBuilder('p')
      .select('p.listing_type', 'listingType')
      .addSelect('COUNT(*)', 'count')
      .where('p.status = :s', { s: 'active' })
      .groupBy('p.listing_type')
      .getRawMany<{ listingType: string; count: string }>();

    return {
      totalProperties,
      activeListings,
      pendingListings,
      activeUsers,
      totalLeads,
      revenue: 0,
      revenueNote: 'Connect Stripe billing to populate revenue.',
      avgYield: Number(avgYield) || 0,
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

  async listProperties(q: {
    page?: number;
    limit?: number;
    city?: string;
    minPrice?: number;
    maxPrice?: number;
    minAi?: number;
    listingType?: string;
    status?: string;
  }) {
    const page = Math.max(1, q.page || 1);
    const limit = Math.min(100, Math.max(1, q.limit || 20));
    const qb = this.props.createQueryBuilder('p').orderBy('p.created_at', 'DESC');
    if (q.city?.trim()) qb.andWhere('LOWER(p.city) LIKE LOWER(:city)', { city: `%${q.city.trim()}%` });
    if (q.minPrice != null) qb.andWhere('p.price >= :minP', { minP: q.minPrice });
    if (q.maxPrice != null) qb.andWhere('p.price <= :maxP', { maxP: q.maxPrice });
    if (q.minAi != null) qb.andWhere('p.ai_value_score >= :minAi', { minAi: q.minAi });
    if (q.listingType?.trim()) qb.andWhere('p.listing_type = :lt', { lt: q.listingType });
    if (q.status?.trim()) qb.andWhere('p.status = :st', { st: q.status });
    const [rows, total] = await qb.skip((page - 1) * limit).take(limit).getManyAndCount();
    return {
      data: rows.map((p) => ({
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
      })),
      page,
      total,
      hasMore: page * limit < total,
    };
  }

  async getPropertyAdmin(id: string) {
    const p = await this.props.findOne({ where: { id }, relations: ['images'] });
    if (!p) throw new NotFoundException('Property not found');
    return p;
  }

  async patchProperty(
    id: string,
    body: {
      status?: string;
      isFeatured?: boolean;
      isVerified?: boolean;
      rejectReason?: string | null;
      title?: string;
      price?: number;
    },
  ) {
    const p = await this.props.findOne({ where: { id } });
    if (!p) throw new NotFoundException('Property not found');
    const expires = new Date();
    expires.setDate(expires.getDate() + 30);
    const patch: Partial<PropertyEntity> = { ...body };
    if (body.status === 'active' && p.status !== 'active') {
      patch.listingExpiresAt = expires;
    }
    if (body.status === 'rejected') {
      patch.listingExpiresAt = null;
    }
    await this.props.update(id, patch);
    return this.getPropertyAdmin(id);
  }

  async deleteProperty(id: string) {
    await this.images.delete({ propertyId: id });
    const r = await this.props.delete(id);
    if (!r.affected) throw new NotFoundException('Property not found');
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

  async patchUser(
    id: string,
    body: { role?: string; accountStatus?: 'active' | 'blocked' },
  ) {
    const u = await this.users.findOne({ where: { id } });
    if (!u) throw new NotFoundException('User not found');
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
    const [rows, total] = await this.leads.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['property'],
    });
    return { data: rows, page, total, hasMore: page * limit < total };
  }

  async patchLead(id: string, body: { status?: string }) {
    const l = await this.leads.findOne({ where: { id } });
    if (!l) throw new NotFoundException('Lead not found');
    await this.leads.update(id, body);
    return this.leads.findOne({ where: { id }, relations: ['property'] });
  }

  async listSeo() {
    return this.seo.find({ order: { updatedAt: 'DESC' } });
  }

  buildDefaultJsonLd(meta: {
    metaTitle: string;
    metaDescription: string;
    canonicalUrl?: string | null;
    pagePath: string;
  }) {
    return JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: meta.metaTitle,
      description: meta.metaDescription,
      url: meta.canonicalUrl || meta.pagePath,
    });
  }

  async upsertSeo(body: {
    id?: string;
    pagePath: string;
    metaTitle: string;
    metaDescription: string;
    keywords?: string;
    canonicalUrl?: string;
    ogTitle?: string;
    ogDescription?: string;
    jsonLd?: string | null;
  }) {
    const pathNorm = body.pagePath.startsWith('/') ? body.pagePath : `/${body.pagePath}`;
    const jsonLd =
      body.jsonLd?.trim() ||
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

  async deleteSeo(id: string) {
    await this.seo.delete(id);
    return { ok: true };
  }

  async getSettings() {
    return this.ensureSettingsRow();
  }

  async patchSettings(body: {
    defaultCurrency?: string;
    fxOverrides?: Record<string, number>;
    aiWeights?: { yieldWeight?: number; growthWeight?: number; riskWeight?: number };
  }) {
    const row = await this.ensureSettingsRow();
    if (body.defaultCurrency) row.defaultCurrency = body.defaultCurrency.toUpperCase();
    if (body.fxOverrides) row.fxOverridesJson = JSON.stringify(body.fxOverrides);
    if (body.aiWeights) row.aiWeightsJson = JSON.stringify(body.aiWeights);
    await this.settingsRepo.save(row);
    return row;
  }
}
