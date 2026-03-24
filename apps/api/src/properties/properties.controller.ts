import { Body, Controller, Get, Headers, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AiService } from './ai.service';
import { PropertiesService } from './properties.service';

@Controller('properties')
export class PropertiesController {
  constructor(
    private service: PropertiesService,
    private ai: AiService,
    private jwt: JwtService,
  ) {}

  @Get('stats')
  stats() {
    return this.service.getStats();
  }

  @Get('insights/locality')
  localityInsights(@Query('city') city: string, @Query('countryCode') countryCode?: string) {
    return this.service.localityInsights(city || '', countryCode);
  }

  @Get('insights/price-trends')
  priceTrends(@Query('city') city: string, @Query('countryCode') countryCode?: string) {
    return this.service.priceTrends(city || '', countryCode);
  }

  @Get()
  async list(
    @Query('countryId') countryId?: string,
    @Query('countryCode') countryCode?: string,
    @Query('type') type?: string,
    @Query('listingType') listingType?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('minBedrooms') minBedrooms?: string,
    @Query('maxBedrooms') maxBedrooms?: string,
    @Query('city') city?: string,
    @Query('minLat') minLat?: string,
    @Query('maxLat') maxLat?: string,
    @Query('minLng') minLng?: string,
    @Query('maxLng') maxLng?: string,
    @Query('limit') limit?: string,
    @Query('page') page?: string,
    @Query('offset') offset?: string,
    /** When `flat=1` or `format=array`, response is a bare JSON array (items only). */
    @Query('flat') flat?: string,
    @Query('format') format?: string,
  ) {
    const wantArray =
      flat === '1' || flat === 'true' || format?.toLowerCase() === 'array';
    const limitNum = limit ? Math.min(500, Math.max(1, Number(limit) || 20)) : 20;
    let offsetNum = 0;
    if (page != null && page !== '') {
      const p = Math.max(1, Math.floor(Number(page)) || 1);
      offsetNum = (p - 1) * limitNum;
    } else if (offset != null && offset !== '') {
      offsetNum = Math.max(0, Math.floor(Number(offset)) || 0);
    }
    try {
      const payload = await this.service.findAll({
        countryId,
        countryCode: countryCode?.trim() || undefined,
        type,
        listingType,
        minPrice: minPrice ? +minPrice : undefined,
        maxPrice: maxPrice ? +maxPrice : undefined,
        minBedrooms: minBedrooms ? +minBedrooms : undefined,
        maxBedrooms: maxBedrooms ? +maxBedrooms : undefined,
        city: city?.trim() || undefined,
        minLat: minLat ? +minLat : undefined,
        maxLat: maxLat ? +maxLat : undefined,
        minLng: minLng ? +minLng : undefined,
        maxLng: maxLng ? +maxLng : undefined,
        limit: limitNum,
        offset: offsetNum,
      });
      if (wantArray) {
        return payload.items ?? payload.data ?? [];
      }
      return payload;
    } catch (error) {
      console.error('GET /properties', error);
      const message = error instanceof Error ? error.message : 'Failed to load properties';
      if (wantArray) {
        return [];
      }
      return {
        success: false,
        data: [],
        items: [],
        page: 1,
        hasMore: false,
        total: 0,
        message,
      };
    }
  }

  @Post('submit-listing')
  submitListing(@Body() body: Record<string, unknown>, @Headers('authorization') auth?: string) {
    let ownerUserId: string | undefined;
    if (auth?.startsWith('Bearer ')) {
      try {
        const payload = this.jwt.verify<{ sub: string }>(auth.slice(7));
        ownerUserId = payload.sub;
      } catch {
        /* anonymous submit */
      }
    }
    return this.service.submitPublicListing(body, { ownerUserId });
  }

  @Get(':id/can-edit')
  @UseGuards(AuthGuard('jwt'))
  canEdit(@Param('id') id: string, @CurrentUser() user: { id: string; role: string }) {
    return this.service.canEditProperty(id, user);
  }

  @Get(':id/for-edit')
  @UseGuards(AuthGuard('jwt'))
  forEdit(@Param('id') id: string, @CurrentUser() user: { id: string; role: string }) {
    return this.service.findOneForEdit(id, user);
  }

  @Get(':id')
  one(@Param('id') id: string) {
    return this.service.findOnePublic(id);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(@Body() dto: Record<string, unknown>, @CurrentUser() user: { id: string }) {
    return this.service.create(dto, user.id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  patch(
    @Param('id') id: string,
    @Body() dto: Record<string, unknown>,
    @CurrentUser() user: { id: string; role: string },
  ) {
    return this.service.updateWithAuth(id, dto, user);
  }

  @Post(':id/report')
  report(@Param('id') id: string, @Body() body: { reason?: string }) {
    return this.service.addReport(id, body?.reason);
  }

  @Post(':id/ai/description')
  @UseGuards(AuthGuard('jwt'))
  aiDescription(@Param('id') id: string) {
    return this.service.findOne(id).then(async (p) => {
      if (!p) return { description: '' };
      const description = await this.ai.generateDescription({
        title: p.title,
        propertyType: p.propertyType || undefined,
        bedrooms: p.bedrooms || undefined,
        bathrooms: p.bathrooms || undefined,
        areaSqft: p.areaSqft ? +p.areaSqft : undefined,
        city: p.city || undefined,
      });
      return { description };
    });
  }

  @Post(':id/ai/valuate')
  @UseGuards(AuthGuard('jwt'))
  aiValuate(@Param('id') id: string) {
    return this.service.findOne(id).then(async (p) => {
      if (!p) return null;
      const result = await this.ai.valuate(p);
      await this.service.patchRaw(id, {
        aiValueScore: result.valueScore,
        rentalYield: result.rentalYield,
        cagr5y: result.cagr5y,
        riskScore: result.riskScore,
      });
      return result;
    });
  }
}
