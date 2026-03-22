"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.estimateDataCompleteness = estimateDataCompleteness;
exports.computeTrustScore = computeTrustScore;
exports.enrichProperty = enrichProperty;
function estimateDataCompleteness(p) {
    let n = 0;
    const checks = [
        () => !!p.description?.trim(),
        () => !!p.propertyType,
        () => !!p.city,
        () => !!p.state,
        () => p.areaSqft != null,
        () => p.bedrooms != null,
        () => p.bathrooms != null,
        () => p.latitude != null && p.longitude != null,
        () => !!(p.images && p.images.length > 0),
        () => !!p.videoUrl || !!(p.videoUrls && p.videoUrls.length > 0),
    ];
    for (const c of checks) {
        if (c())
            n++;
    }
    return Math.round((n / checks.length) * 100);
}
function computeTrustScore(p, completeness) {
    if (p.fraudFlag)
        return Math.min(30, Number(p.trustScore) || 25);
    let s = 35;
    if (p.isVerified)
        s += 25;
    if (p.ownerVerified)
        s += 20;
    s += Math.round((completeness / 100) * 20);
    return Math.max(0, Math.min(100, s));
}
function enrichProperty(p) {
    const completeness = p.dataCompleteness ?? estimateDataCompleteness(p);
    const trustScore = p.trustScore != null ? Number(p.trustScore) : computeTrustScore(p, completeness);
    const sortedImages = p.images?.length > 0
        ? [...p.images].sort((a, b) => Number(a.sortOrder ?? 0) - Number(b.sortOrder ?? 0))
        : p.images;
    return {
        ...p,
        images: sortedImages,
        dataCompleteness: completeness,
        trustScore,
        trustBreakdown: {
            verifiedListing: p.isVerified,
            ownerAuthenticated: p.ownerVerified,
            dataCompletenessPct: completeness,
            fraudReview: p.fraudFlag,
        },
    };
}
//# sourceMappingURL=property-public.util.js.map