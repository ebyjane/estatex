"use strict";
/** Pure data + generators for CLI seed and API demo-seed (no DB imports). */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SAMPLE_VIDEO_MP4 = exports.DEMO_COUNTRIES = void 0;
exports.pickListingImageUrl = pickListingImageUrl;
exports.buildDemoPropertyRows = buildDemoPropertyRows;
exports.DEMO_COUNTRIES = [
    { code: 'IND', name: 'India', currencyCode: 'INR', region: 'APAC' },
    { code: 'UAE', name: 'United Arab Emirates', currencyCode: 'AED', region: 'GCC' },
    { code: 'USA', name: 'United States', currencyCode: 'USD', region: 'NA' },
    { code: 'GBR', name: 'United Kingdom', currencyCode: 'GBP', region: 'EU' },
    { code: 'SAU', name: 'Saudi Arabia', currencyCode: 'SAR', region: 'GCC' },
];
const INDIA_LOCS = [
    { city: 'Mumbai', state: 'Maharashtra', lat: 19.076, lng: 72.8777 },
    { city: 'Bangalore', state: 'Karnataka', lat: 12.9716, lng: 77.5946 },
    { city: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707 },
    { city: 'Hyderabad', state: 'Telangana', lat: 17.385, lng: 78.4867 },
    { city: 'Pune', state: 'Maharashtra', lat: 18.5204, lng: 73.8567 },
];
const DUBAI_LOCS = [
    { city: 'Dubai', state: 'Dubai', lat: 25.2048, lng: 55.2708 },
    { city: 'Dubai Marina', state: 'Dubai', lat: 25.0762, lng: 55.1342 },
    { city: 'Business Bay', state: 'Dubai', lat: 25.1852, lng: 55.2792 },
    { city: 'Palm Jumeirah', state: 'Dubai', lat: 25.1124, lng: 55.139 },
];
const TEXAS_LOCS = [
    { city: 'Houston', state: 'Texas', lat: 29.7604, lng: -95.3698 },
    { city: 'Austin', state: 'Texas', lat: 30.2672, lng: -97.7431 },
    { city: 'Dallas', state: 'Texas', lat: 32.7767, lng: -96.797 },
    { city: 'San Antonio', state: 'Texas', lat: 29.4241, lng: -98.4936 },
];
const PROPERTY_TYPES = ['apartment', 'villa', 'house', 'commercial'];
/** Public sample MP4 for demo listings (rights: W3Schools sample). */
exports.SAMPLE_VIDEO_MP4 = 'https://www.w3schools.com/html/mov_bbb.mp4';
const HERO_IMAGES = [
    'https://images.unsplash.com/photo-1764996915324-91919cee14d3?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1630986431773-170e9215b8b3?w=800&h=600&fit=crop',
];
const EXTRA_BY_TYPE = {
    apartment: [
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1594146032116-80033545b0b8?w=800&h=600&fit=crop',
    ],
    villa: ['https://images.unsplash.com/photo-1613490493576-6eaa921f6746?w=800&h=600&fit=crop'],
    house: ['https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop'],
    commercial: ['https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop'],
};
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
function pickListingImageUrl(propertyType, index) {
    const t = (propertyType || 'apartment').toLowerCase();
    const extra = EXTRA_BY_TYPE[t] || EXTRA_BY_TYPE.apartment;
    const pool = [...HERO_IMAGES, ...extra];
    return pool[index % pool.length];
}
function makeRow(countryCode, loc, index) {
    const propertyType = pick(PROPERTY_TYPES);
    const basePrice = countryCode === 'IND'
        ? randomInt(4000000, 45000000)
        : countryCode === 'UAE'
            ? randomInt(800000, 4000000)
            : randomInt(180000, 950000);
    const bedrooms = randomInt(1, 5);
    const bathrooms = randomInt(1, Math.min(4, bedrooms + 1));
    const areaSqft = randomInt(650, 4200);
    const rentalEstimate = Math.round((basePrice * (countryCode === 'IND' ? 0.04 : 0.05) / 12) * (0.85 + Math.random() * 0.3));
    const rentalYieldPct = +(((rentalEstimate * 12) / basePrice) * 100).toFixed(2);
    const baseScore = Math.random() * 35 + 52;
    const rentBonus = Math.min(rentalYieldPct * 2, 18);
    const aiScore = Math.min(100, Math.round((baseScore + rentBonus) * 100) / 100);
    let aiCategory = 'FAIR';
    if (aiScore > 80)
        aiCategory = 'UNDERVALUED';
    else if (aiScore > 70)
        aiCategory = 'GOOD';
    else if (aiScore < 55)
        aiCategory = 'PREMIUM';
    return {
        countryCode,
        title: `${propertyType.charAt(0).toUpperCase() + propertyType.slice(1)} in ${loc.city}`,
        description: `Investment-grade ${propertyType} in ${loc.city}. Strong rental story and liquidity.`,
        city: loc.city,
        state: loc.state,
        addressLine1: `${randomInt(10, 9999)} ${loc.city} ${randomInt(1, 99)} Main`,
        latitude: loc.lat + (Math.random() - 0.5) * 0.06,
        longitude: loc.lng + (Math.random() - 0.5) * 0.06,
        price: basePrice,
        currencyCode: countryCode === 'IND' ? 'INR' : countryCode === 'UAE' ? 'AED' : 'USD',
        bedrooms,
        bathrooms,
        areaSqft,
        propertyType,
        rentalEstimate,
        isFeatured: Math.random() < 0.2,
        imageUrl: pickListingImageUrl(propertyType, index),
        rentalYieldPct,
        aiScore,
        aiCategory,
        growthProjection5yr: Math.round((6 + Math.random() * 12) * 100) / 100,
        cagr5y: Math.round((6 + Math.random() * 7) * 100) / 100,
        riskScore: Math.round((2 + Math.random() * 4) * 100) / 100,
        videoUrl: index < 4 ? exports.SAMPLE_VIDEO_MP4 : null,
    };
}
/** India + Dubai + Texas distribution (default 500). */
function buildDemoPropertyRows(counts) {
    const india = counts?.india ?? 200;
    const dubai = counts?.dubai ?? 150;
    const texas = counts?.texas ?? 150;
    const rows = [];
    let idx = 0;
    for (let i = 0; i < india; i++) {
        rows.push(makeRow('IND', pick(INDIA_LOCS), idx++));
    }
    for (let i = 0; i < dubai; i++) {
        rows.push(makeRow('UAE', pick(DUBAI_LOCS), idx++));
    }
    for (let i = 0; i < texas; i++) {
        rows.push(makeRow('USA', pick(TEXAS_LOCS), idx++));
    }
    return rows;
}
