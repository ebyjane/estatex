import { SeoService } from './seo.service';
export declare class SeoController {
    private readonly seo;
    constructor(seo: SeoService);
    page(path: string): Promise<{
        pagePath: string;
        metaTitle: string;
        metaDescription: string;
        keywords: string | null;
        canonicalUrl: string | null;
        openGraph: {
            title: string;
            description: string;
        };
        jsonLd: string | null;
    } | null>;
}
