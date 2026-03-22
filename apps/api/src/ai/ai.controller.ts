import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { IsIn, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { AiSearchService } from './ai-search.service';

class AiSearchDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  query?: string;

  /** ISO-like code (IND/UAE/USA) — scopes results to that country when set. */
  @IsOptional()
  @IsString()
  countryCode?: string;

  @IsOptional()
  @IsUUID()
  countryId?: string;

  /** How the main-query location phrase is matched: any column, city/state only, or address/title/description. */
  @IsOptional()
  @IsIn(['any', 'city', 'address'])
  placeScope?: 'any' | 'city' | 'address';

  @IsOptional()
  @IsString()
  @MaxLength(200)
  explicitCity?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  explicitAddress?: string;
}

@Controller('ai')
export class AiController {
  constructor(private readonly searchSvc: AiSearchService) {}

  /** Natural-language property search (location, BHK, budget L/Cr, yield intent). */
  @Post('search')
  search(@Body() body: AiSearchDto) {
    const q = (body.query ?? '').trim();
    const ec = (body.explicitCity ?? '').trim();
    const ea = (body.explicitAddress ?? '').trim();
    if (q.length < 2 && ec.length < 2 && ea.length < 2) {
      throw new BadRequestException(
        'Enter at least 2 characters in the search box, or in City or Address.',
      );
    }
    return this.searchSvc.search(q, {
      countryCode: body.countryCode?.trim() || undefined,
      countryId: body.countryId?.trim() || undefined,
      placeScope: body.placeScope,
      explicitCity: ec || undefined,
      explicitAddress: ea || undefined,
    });
  }
}
