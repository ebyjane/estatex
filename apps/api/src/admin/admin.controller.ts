import { Body, Controller, Headers, Post } from '@nestjs/common';
import { DemoSeedService } from './demo-seed.service';
import { AdminPanelService } from './admin-panel.service';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly demoSeed: DemoSeedService,
    private readonly panel: AdminPanelService,
  ) {}

  /**
   * Body: `{ "mode": "indiaRent" }` → 5000 India rent listings (replaces existing IND rent only).
   * Omit mode or `{ "mode": "demo" }` → full demo reset (countries, admin, ~500 sale listings).
   */
  @Post('seed')
  seed(
    @Body() body: { mode?: string } | undefined,
    @Headers('x-demo-seed-secret') secret?: string,
  ) {
    this.demoSeed.assertCanRunRemote(secret);
    const mode = body?.mode?.toLowerCase();
    if (mode === 'indiarent' || mode === 'india-rent' || mode === 'india_rent') {
      return this.demoSeed.runIndiaRent5000().then((r) => {
        this.panel.pushIngestion('seed', `India rent: ${r.message ?? 'ok'}`);
        return r;
      });
    }
    return this.demoSeed.run().then((r) => {
      this.panel.pushIngestion('seed', r.message ?? 'demo seed');
      return r;
    });
  }
}
