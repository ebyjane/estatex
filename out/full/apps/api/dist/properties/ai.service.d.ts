export declare class AiService {
    private openai;
    constructor();
    generateDescription(property: {
        title: string;
        propertyType?: string;
        bedrooms?: number;
        bathrooms?: number;
        areaSqft?: number;
        city?: string;
    }): Promise<string>;
    suggestPrice(property: {
        title: string;
        propertyType?: string;
        bedrooms?: number;
        areaSqft?: number;
        city?: string;
        countryCode?: string;
        currentPrice?: number;
    }): Promise<{
        suggestedPrice: number;
        reasoning: string;
    }>;
    valuate(property: {
        areaSqft?: number;
        latitude?: number;
    }): Promise<{
        valueScore: number;
        rentalYield: number;
        cagr5y: number;
        riskScore: number;
    }>;
}
