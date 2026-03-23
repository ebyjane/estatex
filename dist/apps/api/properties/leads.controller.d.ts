import { Repository } from 'typeorm';
import { LeadEntity } from '../entities/lead.entity';
export declare class LeadsController {
    private readonly leads;
    constructor(leads: Repository<LeadEntity>);
    create(body: {
        propertyId?: string;
        name?: string;
        email?: string;
        phone?: string;
        message?: string;
    }): Promise<LeadEntity>;
}
