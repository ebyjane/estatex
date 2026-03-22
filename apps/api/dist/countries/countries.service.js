"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CountriesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const country_entity_1 = require("../entities/country.entity");
const SEED = [
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
let CountriesService = class CountriesService {
    constructor(repo) {
        this.repo = repo;
    }
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
    async findOne(id) {
        return this.repo.findOne({ where: { id } });
    }
    async findByCode(code) {
        return this.repo.findOne({ where: { code: code.toUpperCase() } });
    }
};
exports.CountriesService = CountriesService;
exports.CountriesService = CountriesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(country_entity_1.CountryEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CountriesService);
//# sourceMappingURL=countries.service.js.map