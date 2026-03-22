import { Controller, Get, Query } from '@nestjs/common';
import { FxService } from './fx.service';

@Controller('fx')
export class FxController {
  constructor(private fx: FxService) {}

  @Get('latest')
  latest(
    @Query('from') from: string = 'USD',
    @Query('to') to: string = 'INR',
  ) {
    return this.fx.getRate(from, to).then((rate) => ({ from, to, rate }));
  }

  @Get('convert')
  convert(
    @Query('amount') amount: string,
    @Query('from') from: string = 'USD',
    @Query('to') to: string = 'INR',
  ) {
    return this.fx.convert(+(amount || 1000), from, to);
  }
}
