import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  FindOptionsWhere,
  ILike,
  LessThanOrEqual,
  MoreThan,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { PropertyEntity } from '../entities/property.entity';
import { UserEntity } from '../entities/user.entity';
import { LeadEntity } from '../entities/lead.entity';
import { SeoPageEntity } from '../entities/seo-page.entity';
import { AppSettingsEntity } from '../entities/app-settings.entity';
import { PropertyImageEntity } from '../entities/property-image.entity';
import { InvestmentEntity } from '../entities/investment.entity';
import { DemoSeedService } from './demo-seed.service';

@Injectable()
export class AdminPanelService {
  private readonly log = new Logger(AdminPanelService.name);
  private ingestionLog: { at: string; action: string; detail: string }[] = [];

  constructor(
    private readonly demoSeed: DemoSeedService,
    @InjectRepository(PropertyEntity) private readonly props: Repository<PropertyEntity>,
    @InjectRepository(UserEntity) private readonly users: Repository<UserEntity>,
    @InjectRepository(LeadEntity) private readonly leads: Repository<LeadEntity>,
    @InjectRepository(SeoPageEntity) private readonly seo: Repository<SeoPageEntity>,
    @InjectRepository(AppSettingsEntity) private readonly settingsRepo: Repository<AppSettingsEntity>,
    @InjectRepository(PropertyImageEntity) private readonly images: Repository<PropertyImageEntity>,
    @InjectRepository(InvestmentEntity) private readonly investments: Repository<InvestmentEntity>,
  ) {}

  /** Demo seed must never take down admin APIs. */
  private async safeEnsureDemoCatalog(): Promise<void> {
    try {
      await this.demoSeed.ensureDemoCatalogIfEmpty();
    } catch (e) {
      this.log.warn(`ensureDemoCatalogIfEmpty skipped: ${(e as Error).message}`);
    }
  }

  private async safeExec<T>(fallback: T, fn: () => Promise<T>, label?: string): Promise<T> {
    try {
      return await fn();
    } catch (e) {
      if (label) this.log.warn(`${label}: ${(e as Error).message}`);
      return fallback;
    }
  }

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

  /** Last resort if an unexpected error escapes `overview()` (e.g. controller catch). */
  fallbackOverviewResponse() {
    return this.emptyOverview();
  }

  fallbackPropertiesList(page = 1) {
    return { data: [], page, total: 0, hasMore: false };
  }

  /** Safe defaults when overview queries fail (empty DB, migration drift, transient errors). */
  private emptyOverview() {
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
        listingsGrowth: [] as { date: string; count: number }[],
        cityDistribution: [] as { city: string; count: number }[],
        listingTypeSplit: [] as { type: string; count: number }[],
      },
    };
  }

  async overview() {
    await this.safeEnsureDemoCatalog();
    try {
      const totalProperties = await this.safeExec(0, () => this.props.count(), 'overview.totalProperties');
      const activeListings = await this.safeExec(0, () =>
        this.props.count({ where: { status: 'active' } }),
      );
      const pendingListings = await this.safeExec(0, () =>
        this.props.count({ where: { status: 'pending' } }),
      );
      const activeUsers = await this.safeExec(0, () =>
        this.users.count({ where: { accountStatus: 'active' } }),
      );
      const totalLeads = await this.safeExec(0, () => this.leads.count());
      const totalInvestments = await this.safeExec(0, () => this.investments.count());

      const avgYieldNum = await this.safeExec(0, async () => {
        const avgRows = await this.props
          .createQueryBuilder('p')
          .select('AVG(p.rental_yield)', 'avgYield')
          .where('p.status = :s', { s: 'active' })
          .andWhere('p.rental_yield IS NOT NULL')
          .getRawMany<{ avgYield: string }>();
        return Number(avgRows[0]?.avgYield) || 0;
      }, 'overview.avgYield');

      const undervaluedQ = await this.safeExec(0, () =>
        this.props
          .createQueryBuilder('p')
          .where('p.status = :s', { s: 'active' })
          .andWhere('p.ai_value_score >= 80')
          .getCount(),
      );

      const listingsGrowth = await this.safeExec(
        [] as { date: string; count: number }[],
        async () => {
          const since = new Date(Date.now() - 45 * 86400000);
          const recentProps = await this.props.find({
            where: { createdAt: MoreThan(since) },
            select: { id: true, createdAt: true },
            take: 5000,
            order: { createdAt: 'DESC' },
          });
          const byDay = new Map<string, number>();
          for (const p of recentProps) {
            if (!p.createdAt) continue;
            const d = p.createdAt.toISOString().slice(0, 10);
            byDay.set(d, (byDay.get(d) || 0) + 1);
          }
          return [...byDay.entries()]
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, count]) => ({ date, count }));
        },
        'overview.listingsGrowth',
      );

      const cityDist = await this.safeExec(
        [] as { city: string; count: string }[],
        () =>
          this.props
            .createQueryBuilder('p')
            .select('p.city', 'city')
            .addSelect('COUNT(*)', 'count')
            .where('p.status = :s', { s: 'active' })
            .andWhere('p.city IS NOT NULL')
            .groupBy('p.city')
            .orderBy('count', 'DESC')
            .limit(12)
            .getRawMany<{ city: string; count: string }>(),
        'overview.cityDist',
      );

      const typeSplit = await this.safeExec(
        [] as { listingType: string; count: string }[],
        () =>
          this.props
            .createQueryBuilder('p')
            .select('p.listing_type', 'listingType')
            .addSelect('COUNT(*)', 'count')
            .where('p.status = :s', { s: 'active' })
            .groupBy('p.listing_type')
            .getRawMany<{ listingType: string; count: string }>(),
        'overview.typeSplit',
      );

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
    } catch (error) {
      this.log.error(
        'Admin overview error',
        error instanceof Error ? error.stack : String(error),
      );
      return this.emptyOverview();
    }
  }

  private buildAdminPropertyWhere(q: {
    city?: string;
    minPrice?: number;
    maxPrice?: number;
    minAi?: number;
    listingType?: string;
    status?: string;
  }): FindOptionsWhere<PropertyEntity> {
    const w: FindOptionsWhere<PropertyEntity> = {};
    if (q.city?.trim()) w.city = ILike(`%${q.city.trim()}%`);
    if (q.status?.trim()) w.status = q.status.trim();
    if (q.listingType?.trim()) w.listingType = q.listingType.trim();
    if (q.minPrice != null && q.maxPrice != null) {
      w.price = Between(Number(q.minPrice), Number(q.maxPrice));
    } else if (q.minPrice != null) {
      w.price = MoreThanOrEqual(Number(q.minPrice));
    } else if (q.maxPrice != null) {
      w.price = LessThanOrEqual(Number(q.maxPrice));
    }
    if (q.minAi != null) w.aiValueScore = MoreThanOrEqual(Number(q.minAi));
    return w;
  }

  private mapPropertyAdminRow(p: PropertyEntity) {
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
    } catch (error) {
      this.log.error(
        'listProperties',
        error instanceof Error ? error.stack : String(error),
      );
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
      } catch {
        return { data: [], page, total: 0, hasMore: false };
      }
    }
  }

  async getPropertyAdmin(id: string) {
    try {
      const p = await this.props.findOne({ where: { id }, relations: ['images'] });
      if (!p) throw new NotFoundException('Property not found');
      return p;
    } catch (e) {
      if (e instanceof NotFoundException) throw e;
      this.log.warn(`getPropertyAdmin without images relation: ${(e as Error).message}`);
      const p = await this.props.findOne({ where: { id } });
      if (!p) throw new NotFoundException('Property not found');
      return p;
    }
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
    const skip = (page - 1) * limit;
    try {
      const [rows, total] = await this.leads.findAndCount({
        order: { createdAt: 'DESC' },
        skip,
        take: limit,
        relations: ['property'],
      });
      return { data: rows, page, total, hasMore: page * limit < total };
    } catch (e) {
      this.log.warn(`listLeads without property relation: ${(e as Error).message}`);
      const [rows, total] = await this.leads.findAndCount({
        order: { createdAt: 'DESC' },
        skip,
        take: limit,
      });
      return { data: rows, page, total, hasMore: page * limit < total };
    }
  }

  async patchLead(id: string, body: { status?: string }) {
    const l = await this.leads.findOne({ where: { id } });
    if (!l) throw new NotFoundException('Lead not found');
    await this.leads.update(id, body);
    try {
      return await this.leads.findOne({ where: { id }, relations: ['property'] });
    } catch {
      return this.leads.findOne({ where: { id } });
    }
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
