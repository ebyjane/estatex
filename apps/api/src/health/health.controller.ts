import { Controller, Get } from '@nestjs/common';

/** Liveness for load balancers and debugging (`GET /api/v1/health`). */
@Controller('health')
export class HealthController {
  @Get()
  check() {
    return { ok: true, service: 'api', ts: new Date().toISOString() };
  }
}
