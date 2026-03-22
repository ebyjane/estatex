import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CountryEntity } from '../entities/country.entity';

const SEED: Partial<CountryEntity>[] = [
  { code: 'IND', name: 'India', currencyCode: 'INR', region: 'APAC' },
  { code: 'UAE', name: 'United Arab Emirates', currencyCode: 'AED', region: 'GCC' },
  { code: 'USA', name: 'United States', currencyCode: 'USD', region: 'NA' },
  { code: 'GBR', name: 'United Kingdom', currencyCode: 'GBP', region: 'EU' },
  { code: 'SAU', name: 'Saudi Arabia', currencyCode: 'SAR', region: 'GCC' },
  { code: 'QAT', name: 'Qatar', currencyCode: 'QAR', region: 'GCC' },
  { code: 'OMN', name: 'Oman', currencyCode: 'OMR', region: 'GCC' },
  { code: 'BHR', name: 'Bahrain', currencyCode: 'BHD', region: 'GCC' },
  { code: 'KWT', name: 'Kuwait', currencyCode: 'KWD', region: 'GCC' },
];

@Injectable()
export class CountriesService {
  constructor(
    @InjectRepository(CountryEntity)
    private repo: Repository<CountryEntity>,
  ) {}

  async findAll() {
    let list = await this.repo.find({ order: { name: 'ASC' } });
    if (list.length === 0) {
      for (const c of SEED) {
        const entity = this.repo.create(c);
        await this.repo.save(entity);
      }
      list = await this.repo.find({ order: { name: 'ASC' } });
    }
    return list;
  }

  async findOne(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  async findByCode(code: string) {
    return this.repo.findOne({ where: { code: code.toUpperCase() } });
  }
}
