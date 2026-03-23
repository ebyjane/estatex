import { DemoSeedService } from './demo-seed.service';
import { AdminPanelService } from './admin-panel.service';
export declare class AdminController {
    private readonly demoSeed;
    private readonly panel;
    constructor(demoSeed: DemoSeedService, panel: AdminPanelService);
    seed(body: {
        mode?: string;
    } | undefined, secret?: string): Promise<{
        ok: boolean;
        properties: number;
        message: string;
    }>;
}
