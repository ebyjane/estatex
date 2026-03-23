import { Controller, Get, Query } from '@nestjs/common';
import { FxService } from './fx.service';

@Controller('fx')
export class FxController {
  constructor(private fx: FxService) {}

  @Get('latest')
  async latest(
    @Query('from') from: string = 'USD',
    @Query('to') to: string = 'INR',
  ) {
    try {
      const rate = await this.fx.getRate(from, to);
      return { from, to, rate };
    } catch (error) {
      console.error('GET /fx/latest', error);
      return {
        success: false,
        data: null,
        from,
        to,
        rate: 1,
        message: error instanceof Error ? error.message : 'FX rate failed',
      };
    }
  }

  @Get('convert')
  async convert(
    @Query('amount') amount: string,
    @Query('from') from: string = 'USD',
    @Query('to') to: string = 'INR',
  ) {
    try {
      return await this.fx.convert(+(amount || 1000), from, to);
    } catch (error) {
      console.error('GET /fx/convert', error);
      const amt = +(amount || 0);
      return {
        success: false,
        data: null,
        amount: amt,
        from,
        to,
        rate: 0,
        converted: amt,
        message: error instanceof Error ? error.message : 'FX convert failed',
      };
    }
  }
}
