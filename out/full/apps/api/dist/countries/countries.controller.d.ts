import { CountriesService } from './countries.service';
export declare class CountriesController {
    private service;
    constructor(service: CountriesService);
    list(): Promise<import("../entities").CountryEntity[]>;
    one(id: string): Promise<import("../entities").CountryEntity | null>;
}
