import { Controller, Get } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

/** `GET /api/v1/health` — liveness; DB is pinged but failures do not return HTTP 500. */
@Controller('health')
export class HealthController {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  @Get()
  async check() {
    try {
      if (this.ds.isInitialized) {
        await this.ds.query('SELECT 1');
      }
    } catch (e) {
      console.error('Health DB ping failed:', e);
    }
    return { status: 'ok' as const };
  }
}
