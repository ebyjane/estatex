import { Controller, Get, Query } from '@nestjs/common';
import { SeoService } from './seo.service';

@Controller('seo')
export class SeoController {
  constructor(private readonly seo: SeoService) {}

  /** Public metadata for Next.js `generateMetadata` (falls back if not configured). */
  @Get('page')
  async page(@Query('path') path: string) {
    if (!path?.trim()) return null;
    const row = await this.seo.findByPath(decodeURIComponent(path.trim()));
    if (!row) return null;
    return {
      pagePath: row.pagePath,
      metaTitle: row.metaTitle,
      metaDescription: row.metaDescription,
      keywords: row.keywords,
      canonicalUrl: row.canonicalUrl,
      openGraph: {
        title: row.ogTitle || row.metaTitle,
        description: row.ogDescription || row.metaDescription,
      },
      jsonLd: row.jsonLd,
    };
  }
}
