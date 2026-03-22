import { PropertyEntity } from '../entities/property.entity';
export type TrustBreakdown = {
    verifiedListing: boolean;
    ownerAuthenticated: boolean;
    dataCompletenessPct: number;
    fraudReview: boolean;
};
export declare function estimateDataCompleteness(p: PropertyEntity): number;
export declare function computeTrustScore(p: PropertyEntity, completeness: number): number;
export declare function enrichProperty(p: PropertyEntity): PropertyEntity & {
    trustBreakdown: TrustBreakdown;
    trustScore: number;
    dataCompleteness: number;
};
