import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Express } from 'express';
import { AdminRoleGuard } from '../auth/guards/admin-role.guard';
import {
  buildListingDtoFromMultipart,
  createSubmitListingFileInterceptor,
} from '../properties/listing-multipart.util';
import { PropertiesService } from '../properties/properties.service';
import { AdminPanelService } from './admin-panel.service';

@Controller('admin')
@UseGuards(AuthGuard('jwt'), AdminRoleGuard)
export class AdminPanelController {
  private readonly log = new Logger(AdminPanelController.name);

  constructor(
    private readonly panel: AdminPanelService,
    private readonly properties: PropertiesService,
  ) {}

  @Get('overview')
  async overview() {
    try {
      return await this.panel.overview();
    } catch (error) {
      this.log.error('GET admin/overview', error instanceof Error ? error.stack : error);
      return {
        ...this.panel.fallbackOverviewResponse(),
        success: false,
        message: error instanceof Error ? error.message : 'Overview unavailable',
      };
    }
  }

  @Get('ingestion-logs')
  ingestionLogs() {
    return { data: this.panel.getIngestionLogs() };
  }

  @Post('ingestion-log')
  logIngestion(@Body() body: { action: string; detail?: string }) {
    this.panel.pushIngestion(body.action || 'event', body.detail || '');
    return { ok: true };
  }

  @Get('properties')
  async listProperties(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('city') city?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('minAi') minAi?: string,
    @Query('listingType') listingType?: string,
    @Query('status') status?: string,
  ) {
    const p = page ? +page : 1;
    try {
      return await this.panel.listProperties({
        page: p,
        limit: limit ? +limit : 20,
        city,
        minPrice: minPrice ? +minPrice : undefined,
        maxPrice: maxPrice ? +maxPrice : undefined,
        minAi: minAi ? +minAi : undefined,
        listingType,
        status,
      });
    } catch (error) {
      this.log.error('GET admin/properties', error instanceof Error ? error.stack : error);
      return {
        ...this.panel.fallbackPropertiesList(p),
        success: false,
        message: error instanceof Error ? error.message : 'Properties list unavailable',
      };
    }
  }

  @Get('properties/:id')
  getProperty(@Param('id') id: string) {
    return this.panel.getPropertyAdmin(id);
  }

  @Patch('properties/:id')
  patchProperty(
    @Param('id') id: string,
    @Body()
    body: {
      status?: string;
      isFeatured?: boolean;
      isVerified?: boolean;
      rejectReason?: string | null;
      title?: string;
      price?: number;
    },
  ) {
    return this.panel.patchProperty(id, body);
  }

  @Delete('properties/:id')
  deleteProperty(@Param('id') id: string) {
    return this.panel.deleteProperty(id);
  }

  @Get('users')
  listUsers(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.panel.listUsers(page ? +page : 1, limit ? +limit : 20);
  }

  @Patch('users/:id')
  patchUser(
    @Param('id') id: string,
    @Body() body: { role?: string; accountStatus?: 'active' | 'blocked' },
  ) {
    return this.panel.patchUser(id, body);
  }

  @Get('leads')
  listLeads(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.panel.listLeads(page ? +page : 1, limit ? +limit : 30);
  }

  @Patch('leads/:id')
  patchLead(@Param('id') id: string, @Body() body: { status?: string }) {
    return this.panel.patchLead(id, body);
  }

  @Get('seo')
  listSeo() {
    return this.panel.listSeo();
  }

  @Post('seo')
  upsertSeo(
    @Body()
    body: {
      id?: string;
      pagePath: string;
      metaTitle: string;
      metaDescription: string;
      keywords?: string;
      canonicalUrl?: string;
      ogTitle?: string;
      ogDescription?: string;
      jsonLd?: string | null;
    },
  ) {
    return this.panel.upsertSeo(body);
  }

  @Delete('seo/:id')
  deleteSeo(@Param('id') id: string) {
    return this.panel.deleteSeo(id);
  }

  @Get('settings')
  getSettings() {
    return this.panel.getSettings();
  }

  @Patch('settings')
  patchSettings(
    @Body()
    body: {
      defaultCurrency?: string;
      fxOverrides?: Record<string, number>;
      aiWeights?: { yieldWeight?: number; growthWeight?: number; riskWeight?: number };
    },
  ) {
    return this.panel.patchSettings(body);
  }

  /** Same fields as public submit-listing; multipart with optional `images` / `videos` files. */
  @Post('submit-listing')
  @UseInterceptors(createSubmitListingFileInterceptor(500, 80))
  submitListing(
    @UploadedFiles() files: { images?: Express.Multer.File[]; videos?: Express.Multer.File[] },
    @Body() body: Record<string, string | string[]>,
  ) {
    console.log('[POST /api/v1/admin/submit-listing] multipart field keys:', Object.keys(body ?? {}));
    console.log(
      '[POST /api/v1/admin/submit-listing] files:',
      JSON.stringify({
        images: files?.images?.map((f) => ({
          originalname: f.originalname,
          size: f.size,
          mimetype: f.mimetype,
        })),
        videos: files?.videos?.map((f) => ({
          originalname: f.originalname,
          size: f.size,
          mimetype: f.mimetype,
        })),
      }),
    );
    const dto = buildListingDtoFromMultipart(body, files ?? {}, {
      maxImages: 500,
      allowMultiVideo: true,
    });
    return this.properties.submitPublicListing(dto, { maxImages: 500, allowMultiVideo: true });
  }
}
