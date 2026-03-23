import { OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
export declare class DemoSeedService implements OnModuleInit {
    private readonly ds;
    private readonly log;
    constructor(ds: DataSource);
    onModuleInit(): Promise<void>;
    ensureDemoCatalogIfEmpty(): Promise<{
        seeded: boolean;
        properties: number;
    }>;
    private isUniqueViolation;
    run(): Promise<{
        ok: boolean;
        properties: number;
        message: string;
    }>;
    runIndiaRent5000(): Promise<{
        ok: boolean;
        properties: number;
        message: string;
    }>;
    assertCanRunRemote(secret?: string): void;
}
