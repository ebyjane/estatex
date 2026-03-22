import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { PropertyEntity } from '../entities/property.entity';
import { FxService } from '../fx/fx.service';

@Injectable()
export class CompareService {
  constructor(
    @InjectRepository(PropertyEntity)
    private repo: Repository<PropertyEntity>,
    private fx: FxService,
  ) {}

  async compare(
    propertyIds: string[],
    targetCurrency: string = 'USD',
  ) {
    const ids = propertyIds.slice(0, 3);
    if (ids.length === 0) return { properties: [], comparisons: [] };

    const properties = await this.repo.find({
      where: { id: In(ids) },
      relations: ['images'],
    });

    const comparisons = await Promise.all(
      properties.map(async (p) => {
        const rate = await this.fx.getRate(p.currencyCode, targetCurrency);
        const priceInTarget = Number(p.price) * rate;
        return {
          id: p.id,
          title: p.title,
          price: Number(p.price),
          currencyCode: p.currencyCode,
          priceInTarget,
          targetCurrency,
          aiValueScore: p.aiValueScore,
          rentalYield: p.rentalYield ? Number(p.rentalYield) : null,
          cagr5y: p.cagr5y ? Number(p.cagr5y) : null,
          riskScore: p.riskScore ? Number(p.riskScore) : null,
          city: p.city,
          propertyType: p.propertyType,
        };
      }),
    );

    return { properties: comparisons };
  }
}
