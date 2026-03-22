import { DataSource } from 'typeorm';
export declare class DemoSeedService {
    private readonly ds;
    private readonly log;
    constructor(ds: DataSource);
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
