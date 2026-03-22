import { Controller, Get, Query } from '@nestjs/common';
import { CompareService } from './compare.service';

@Controller('compare')
export class CompareController {
  constructor(private compareService: CompareService) {}

  @Get()
  getCompare(
    @Query('ids') ids: string,
    @Query('currency') currency: string = 'USD',
  ) {
    const propertyIds = ids ? ids.split(',').map((s) => s.trim()).filter(Boolean) : [];
    return this.compareService.compare(propertyIds, currency);
  }
}
