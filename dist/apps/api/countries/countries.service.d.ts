import { Repository } from 'typeorm';
import { CountryEntity } from '../entities/country.entity';
export declare class CountriesService {
    private repo;
    constructor(repo: Repository<CountryEntity>);
    findAll(): Promise<CountryEntity[]>;
    findOne(id: string): Promise<CountryEntity | null>;
    findByCode(code: string): Promise<CountryEntity | null>;
}
