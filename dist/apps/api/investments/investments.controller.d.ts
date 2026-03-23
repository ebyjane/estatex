import { Repository } from 'typeorm';
import type { Request } from 'express';
import { InvestmentEntity } from '../entities/investment.entity';
type JwtUser = {
    id: string;
};
export declare class InvestmentsController {
    private readonly repo;
    constructor(repo: Repository<InvestmentEntity>);
    list(req: Request & {
        user: JwtUser;
    }): Promise<{
        data: InvestmentEntity[];
    }>;
}
export {};
