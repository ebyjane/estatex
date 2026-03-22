import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SeoPageEntity } from '../entities/seo-page.entity';

@Injectable()
export class SeoService {
  constructor(@InjectRepository(SeoPageEntity) private readonly repo: Repository<SeoPageEntity>) {}

  async findByPath(path: string) {
    const norm = path.startsWith('/') ? path : `/${path}`;
    return this.repo.findOne({ where: { pagePath: norm } });
  }
}
