import { DataSource } from 'typeorm';
export declare class HealthController {
    private readonly ds;
    constructor(ds: DataSource);
    check(): Promise<{
        status: "ok";
    }>;
}
