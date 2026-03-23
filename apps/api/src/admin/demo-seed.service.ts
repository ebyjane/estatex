import { ForbiddenException, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';
import { DataSource, In, QueryFailedError } from 'typeorm';
import { buildDemoPropertyRows, buildIndiaRentRows, DEMO_COUNTRIES } from '@real-estate/shared';
import { AppSettingsEntity } from '../entities/app-settings.entity';
import { CountryEntity } from '../entities/country.entity';
import { PropertyImageEntity } from '../entities/property-image.entity';
import { PropertyEntity } from '../entities/property.entity';
import { UserEntity } from '../entities/user.entity';

const DEFAULT_ADMIN_EMAIL = 'admin@estatex.ai';

@Injectable()
export class DemoSeedService implements OnModuleInit {
  private readonly log = new Logger(DemoSeedService.name);

  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  async onModuleInit() {
    try {
      await this.ensureDemoCatalogIfEmpty();
    } catch (e) {
      this.log.warn(`Demo catalog bootstrap: ${(e as Error).message}`);
    }
  }

  /**
   * If the DB has zero properties (fresh Postgres / auto-created admin only), insert
   * countries + demo sale listings + images. Idempotent; skips when any property exists.
   * Set AUTO_DEMO_PROPERTIES=false to disable.
   */
  async ensureDemoCatalogIfEmpty(): Promise<{ seeded: boolean; properties: number }> {
    if (process.env.AUTO_DEMO_PROPERTIES === 'false') {
      return { seeded: false, properties: 0 };
    }

    const propRepo = this.ds.getRepository(PropertyEntity);
    const anyExisting = await propRepo.find({ take: 1, select: { id: true } });
    if (anyExisting.length > 0) {
      return { seeded: false, properties: 0 };
    }

    const rows = buildDemoPropertyRows();
    const listingExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const result = await this.ds.transaction(async (em) => {
      const pRepo = em.getRepository(PropertyEntity);
      const raced = await pRepo.find({ take: 1, select: { id: true } });
      if (raced.length > 0) {
        return { seeded: false as const, inserted: 0 };
      }

      const countryRepo = em.getRepository(CountryEntity);
      for (const c of DEMO_COUNTRIES) {
        const found = await countryRepo.findOne({ where: { code: c.code } });
        if (!found) {
          await countryRepo.save(
            countryRepo.create({
              code: c.code,
              name: c.name,
              currencyCode: c.currencyCode,
              region: c.region,
              taxRateDefault: 8.5,
            }),
          );
        }
      }

      const savedCountries = await countryRepo.find();
      const byCode = Object.fromEntries(savedCountries.map((x) => [x.code, x.id]));

      const userRepo = em.getRepository(UserEntity);
      let admin = await userRepo.findOne({ where: { email: DEFAULT_ADMIN_EMAIL } });
      if (!admin) {
        const plain = process.env.ADMIN_BOOTSTRAP_PASSWORD?.trim() || 'admin123';
        const hash = await bcrypt.hash(plain, 10);
        const created = userRepo.create({
          email: DEFAULT_ADMIN_EMAIL,
          passwordHash: hash,
          firstName: 'Admin',
          role: 'admin',
        });
        try {
          admin = await userRepo.save(created);
        } catch (e) {
          if (!this.isUniqueViolation(e)) throw e;
          admin = await userRepo.findOne({ where: { email: DEFAULT_ADMIN_EMAIL } });
        }
      }
      if (!admin) throw new Error('Could not resolve admin user for demo properties');

      const imgRepo = em.getRepository(PropertyImageEntity);
      let inserted = 0;

      for (let i = 0; i < rows.length; i++) {
        const r = rows[i]!;
        const countryId = byCode[r.countryCode];
        if (!countryId) continue;

        const id = randomUUID();
        const trust = 55 + Math.floor(Math.random() * 40);
        const completeness = 65 + Math.floor(Math.random() * 35);
        const ownerV = Math.random() > 0.45;
        const fraud = Math.random() > 0.96;
        const ownerName = `Demo owner · ${r.city}`;
        const ownerEmail = `listings.${id.slice(0, 8)}@demo.estatex.ai`;
        const ownerPhone = `+9198765${String(40000 + i).padStart(5, '0')}`;

        const prop = pRepo.create({
          id,
          countryId,
          ownerId: admin.id,
          ownerName,
          ownerEmail,
          ownerPhone,
          whatsappOptIn: false,
          title: r.title,
          description: r.description,
          city: r.city,
          state: r.state ?? undefined,
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
          aiValueScore: Number(r.aiScore),
          aiCategory: r.aiCategory,
          growthProjection5yr: r.growthProjection5yr,
          cagr5y: r.cagr5y,
          riskScore: r.riskScore,
          isFeatured: r.isFeatured,
          isVerified: Math.random() > 0.35,
          videoUrl: r.videoUrl ?? null,
          ownerVerified: ownerV,
          trustScore: trust,
          dataCompleteness: completeness,
          fraudFlag: fraud,
          listingExpiresAt,
          reportCount: 0,
        });
        await pRepo.save(prop);
        await imgRepo.save(
          imgRepo.create({
            propertyId: id,
            url: r.imageUrl,
            sortOrder: 0,
          }),
        );
        inserted++;
      }

      const settingsRepo = em.getRepository(AppSettingsEntity);
      const settingsRow = await settingsRepo.findOne({ where: { id: 'default' } });
      if (!settingsRow) {
        await settingsRepo.save(settingsRepo.create({ id: 'default', defaultCurrency: 'USD' }));
      }

      return { seeded: true as const, inserted };
    });

    if (result.seeded && result.inserted > 0) {
      this.log.log(`Auto-seeded ${result.inserted} demo properties (empty database)`);
    }
    return { seeded: result.seeded, properties: result.inserted };
  }

  private isUniqueViolation(err: unknown): boolean {
    if (!(err instanceof QueryFailedError)) return false;
    return (err.driverError as { code?: string } | undefined)?.code === '23505';
  }

  async run(): Promise<{ ok: boolean; properties: number; message: string }> {
    const rows = buildDemoPropertyRows();
    await this.ds.transaction(async (em) => {
      await em.getRepository(PropertyImageEntity).createQueryBuilder().delete().execute();
      await em.getRepository(PropertyEntity).createQueryBuilder().delete().execute();
      await em.getRepository(UserEntity).createQueryBuilder().delete().execute();
      await em.getRepository(CountryEntity).createQueryBuilder().delete().execute();

      const countryRepo = em.getRepository(CountryEntity);
      for (const c of DEMO_COUNTRIES) {
        await countryRepo.save(
          countryRepo.create({
            code: c.code,
            name: c.name,
            currencyCode: c.currencyCode,
            region: c.region,
            taxRateDefault: 8.5,
          }),
        );
      }

      const savedCountries = await em.find(CountryEntity);
      const byCode = Object.fromEntries(savedCountries.map((x) => [x.code, x.id]));

      const hash = await bcrypt.hash('admin123', 10);
      const userRepo = em.getRepository(UserEntity);
      await userRepo.save(
        userRepo.create({
          email: 'admin@estatex.ai',
          passwordHash: hash,
          firstName: 'Admin',
          role: 'admin',
        }),
      );

      const propRepo = em.getRepository(PropertyEntity);
      const imgRepo = em.getRepository(PropertyImageEntity);
      for (const r of rows) {
        const countryId = byCode[r.countryCode];
        if (!countryId) continue;
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
          aiValueScore: Number(r.aiScore),
          aiCategory: r.aiCategory,
          growthProjection5yr: r.growthProjection5yr,
          cagr5y: r.cagr5y,
          riskScore: r.riskScore,
          isFeatured: r.isFeatured,
          isVerified: false,
          videoUrl: r.videoUrl ?? null,
        });
        const saved = await propRepo.save(prop);
        await imgRepo.save(
          imgRepo.create({
            propertyId: saved.id,
            url: r.imageUrl,
            sortOrder: 0,
          }),
        );
      }
    });

    this.log.log(`Seed completed: ${rows.length} properties + admin user created`);
    return {
      ok: true,
      properties: rows.length,
      message: `Seed completed: ${rows.length} properties + admin user created`,
    };
  }

  /**
   * Replace all India (IND) **rent** listings with 5000 synthetic rent rows.
   * Does not delete sale listings or other countries. Ensures IND country exists.
   */
  async runIndiaRent5000(): Promise<{ ok: boolean; properties: number; message: string }> {
    const rows = buildIndiaRentRows(5000);
    let inserted = 0;
    await this.ds.transaction(async (em) => {
      const countryRepo = em.getRepository(CountryEntity);
      let ind = await countryRepo.findOne({ where: { code: 'IND' } });
      if (!ind) {
        ind = await countryRepo.save(
          countryRepo.create({
            code: 'IND',
            name: 'India',
            currencyCode: 'INR',
            region: 'APAC',
            taxRateDefault: 8.5,
          }),
        );
      }

      const propRepo = em.getRepository(PropertyEntity);
      const imgRepo = em.getRepository(PropertyImageEntity);
      const existing = await propRepo.find({
        where: { listingType: 'rent', countryId: ind.id },
        select: { id: true },
      });
      const ids = existing.map((x) => x.id);
      if (ids.length) {
        await imgRepo.delete({ propertyId: In(ids) });
        await propRepo.delete(ids);
      }

      const expires = new Date();
      expires.setDate(expires.getDate() + 30);
      const chunk = 500;

      for (let i = 0; i < rows.length; i += chunk) {
        const slice = rows.slice(i, i + chunk);
        const entities = slice.map((r) =>
          propRepo.create({
            countryId: ind!.id,
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
          }),
        );
        const saved = await propRepo.save(entities);
        const imgEntities = saved.flatMap((s, j) => {
          const r = slice[j]!;
          return r.imageUrls.map((url, k) =>
            imgRepo.create({ propertyId: s.id, url, sortOrder: k }),
          );
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

  assertCanRunRemote(secret?: string) {
    if (process.env.NODE_ENV !== 'production') return;
    const expected = process.env.ADMIN_SEED_SECRET;
    if (!expected || secret !== expected) {
      throw new ForbiddenException('Demo seed is disabled in production without ADMIN_SEED_SECRET.');
    }
  }
}
