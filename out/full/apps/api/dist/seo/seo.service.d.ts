import { Repository } from 'typeorm';
import { SeoPageEntity } from '../entities/seo-page.entity';
export declare class SeoService {
    private readonly repo;
    constructor(repo: Repository<SeoPageEntity>);
    findByPath(path: string): Promise<SeoPageEntity | null>;
}
