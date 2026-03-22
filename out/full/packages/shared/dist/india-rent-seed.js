"use strict";
/**
 * Pure generator for India-wide RENT listings (no DB).
 * Used by CLI `scripts/generateIndiaRentData.ts` and API `DemoSeedService.runIndiaRent5000`.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.INDIA_RENT_TOTAL_DEFAULT = void 0;
exports.buildIndiaRentRows = buildIndiaRentRows;
const india_listing_thumbnails_1 = require("./india-listing-thumbnails");
exports.INDIA_RENT_TOTAL_DEFAULT = 5000;
function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
function rand(a, b) {
    return a + Math.random() * (b - a);
}
function randInt(a, b) {
    return Math.floor(rand(a, b + 1));
}
function rentInRange(min, max) {
    const v = rand(min, max);
    return Math.round(v / 500) * 500;
}
/** Extrapolate 4BHK band from 3BHK */
function fourBhkFromThree(t) {
    return [Math.round(t[0] * 1.2), Math.round(t[1] * 1.35)];
}
const CITIES = [
    {
        name: 'Bangalore',
        state: 'Karnataka',
        tier: 1,
        lat: 12.9716,
        lng: 77.5946,
        localities: ['Whitefield', 'Electronic City', 'Indiranagar', 'HSR Layout', 'Marathahalli'],
        rentByBhk: {
            1: [8000, 20000],
            2: [15000, 40000],
            3: [25000, 80000],
            4: fourBhkFromThree([25000, 80000]),
        },
    },
    {
        name: 'Mumbai',
        state: 'Maharashtra',
        tier: 1,
        lat: 19.076,
        lng: 72.8777,
        localities: ['Andheri', 'Bandra', 'Powai', 'Navi Mumbai'],
        rentByBhk: {
            1: [15000, 40000],
            2: [30000, 90000],
            3: [60000, 200000],
            4: fourBhkFromThree([60000, 200000]),
        },
    },
    {
        name: 'Delhi',
        state: 'Delhi',
        tier: 1,
        lat: 28.7041,
        lng: 77.1025,
        localities: ['Dwarka', 'Rohini', 'Vasant Kunj', 'Greater Kailash', 'Connaught Place'],
        rentByBhk: {
            1: [10000, 24000],
            2: [18000, 48000],
            3: [30000, 95000],
            4: fourBhkFromThree([30000, 95000]),
        },
    },
    {
        name: 'Hyderabad',
        state: 'Telangana',
        tier: 1,
        lat: 17.385,
        lng: 78.4867,
        localities: ['Gachibowli', 'Madhapur', 'Kondapur', 'Banjara Hills', 'Kukatpally'],
        rentByBhk: {
            1: [7000, 18000],
            2: [12000, 30000],
            3: [20000, 50000],
            4: fourBhkFromThree([20000, 50000]),
        },
    },
    {
        name: 'Chennai',
        state: 'Tamil Nadu',
        tier: 1,
        lat: 13.0827,
        lng: 80.2707,
        localities: ['OMR', 'Adyar', 'Velachery', 'T Nagar', 'Anna Nagar'],
        rentByBhk: {
            1: [8000, 20000],
            2: [14000, 33000],
            3: [22000, 55000],
            4: fourBhkFromThree([22000, 55000]),
        },
    },
    {
        name: 'Pune',
        state: 'Maharashtra',
        tier: 1,
        lat: 18.5204,
        lng: 73.8567,
        localities: ['Koregaon Park', 'Hinjewadi', 'Baner', 'Viman Nagar', 'Kharadi'],
        rentByBhk: {
            1: [7500, 19000],
            2: [14000, 38000],
            3: [24000, 75000],
            4: fourBhkFromThree([24000, 75000]),
        },
    },
    {
        name: 'Ahmedabad',
        state: 'Gujarat',
        tier: 2,
        lat: 23.0225,
        lng: 72.5714,
        localities: ['Satellite', 'Bodakdev', 'SG Highway', 'Maninagar'],
        rentByBhk: {
            1: [6000, 15000],
            2: [11000, 28000],
            3: [18000, 45000],
            4: fourBhkFromThree([18000, 45000]),
        },
    },
    {
        name: 'Kolkata',
        state: 'West Bengal',
        tier: 2,
        lat: 22.5726,
        lng: 88.3639,
        localities: ['Salt Lake', 'New Town', 'Park Street', 'Alipore'],
        rentByBhk: {
            1: [7000, 17000],
            2: [12000, 32000],
            3: [20000, 55000],
            4: fourBhkFromThree([20000, 55000]),
        },
    },
    {
        name: 'Jaipur',
        state: 'Rajasthan',
        tier: 2,
        lat: 26.9124,
        lng: 75.7873,
        localities: ['Malviya Nagar', 'C-Scheme', 'Vaishali Nagar', 'Mansarovar'],
        rentByBhk: {
            1: [5500, 14000],
            2: [10000, 25000],
            3: [16000, 42000],
            4: fourBhkFromThree([16000, 42000]),
        },
    },
    {
        name: 'Lucknow',
        state: 'Uttar Pradesh',
        tier: 2,
        lat: 26.8467,
        lng: 80.9462,
        localities: ['Gomti Nagar', 'Hazratganj', 'Aliganj', 'Indira Nagar'],
        rentByBhk: {
            1: [5000, 12000],
            2: [9000, 22000],
            3: [15000, 38000],
            4: fourBhkFromThree([15000, 38000]),
        },
    },
    {
        name: 'Kochi',
        state: 'Kerala',
        tier: 2,
        lat: 9.9312,
        lng: 76.2673,
        localities: ['Kakkanad', 'Edappally', 'Marine Drive', 'Vyttila'],
        rentByBhk: {
            1: [6500, 16000],
            2: [12000, 30000],
            3: [20000, 48000],
            4: fourBhkFromThree([20000, 48000]),
        },
    },
    {
        name: 'Chandigarh',
        state: 'Chandigarh',
        tier: 2,
        lat: 30.7333,
        lng: 76.7794,
        localities: ['Sector 17', 'Sector 35', 'Mohali Phase 7', 'Panchkula'],
        rentByBhk: {
            1: [8000, 19000],
            2: [14000, 35000],
            3: [22000, 55000],
            4: fourBhkFromThree([22000, 55000]),
        },
    },
    {
        name: 'Coimbatore',
        state: 'Tamil Nadu',
        tier: 3,
        lat: 11.0168,
        lng: 76.9558,
        localities: ['RS Puram', 'Peelamedu', 'Gandhipuram', 'Saibaba Colony'],
        rentByBhk: {
            1: [4500, 11000],
            2: [8000, 20000],
            3: [13000, 35000],
            4: fourBhkFromThree([13000, 35000]),
        },
    },
    {
        name: 'Indore',
        state: 'Madhya Pradesh',
        tier: 3,
        lat: 22.7196,
        lng: 75.8577,
        localities: ['Vijay Nagar', 'Scheme 54', 'MR 10 Road', 'Rau'],
        rentByBhk: {
            1: [4500, 11000],
            2: [8000, 19000],
            3: [13000, 32000],
            4: fourBhkFromThree([13000, 32000]),
        },
    },
    {
        name: 'Nagpur',
        state: 'Maharashtra',
        tier: 3,
        lat: 21.1458,
        lng: 79.0882,
        localities: ['Dharampeth', 'Sadar', 'Wardha Road', 'Koradi'],
        rentByBhk: {
            1: [4500, 11000],
            2: [8500, 20000],
            3: [14000, 34000],
            4: fourBhkFromThree([14000, 34000]),
        },
    },
    {
        name: 'Vizag',
        state: 'Andhra Pradesh',
        tier: 3,
        lat: 17.6868,
        lng: 83.2185,
        localities: ['RK Beach', 'MVP Colony', 'Gajuwaka', 'Madhurawada'],
        rentByBhk: {
            1: [4500, 11000],
            2: [8000, 20000],
            3: [13000, 33000],
            4: fourBhkFromThree([13000, 33000]),
        },
    },
    {
        name: 'Mysore',
        state: 'Karnataka',
        tier: 3,
        lat: 12.2958,
        lng: 76.6394,
        localities: ['Gokulam', 'Vijayanagar', 'Hebbal', 'Kuvempunagar'],
        rentByBhk: {
            1: [4000, 10000],
            2: [7500, 18000],
            3: [12000, 30000],
            4: fourBhkFromThree([12000, 30000]),
        },
    },
    {
        name: 'Bhopal',
        state: 'Madhya Pradesh',
        tier: 3,
        lat: 23.2599,
        lng: 77.4126,
        localities: ['Arera Colony', 'MP Nagar', 'Hoshangabad Road', 'Kolar'],
        rentByBhk: {
            1: [4000, 10000],
            2: [7500, 18000],
            3: [12000, 28000],
            4: fourBhkFromThree([12000, 28000]),
        },
    },
];
function pickCityByTierWeight() {
    const r = Math.random();
    let pool;
    if (r < 0.48)
        pool = CITIES.filter((c) => c.tier === 1);
    else if (r < 0.9)
        pool = CITIES.filter((c) => c.tier === 2);
    else
        pool = CITIES.filter((c) => c.tier === 3);
    return pick(pool);
}
function weightedBhk() {
    const r = Math.random();
    if (r < 0.22)
        return 1;
    if (r < 0.52)
        return 2;
    if (r < 0.82)
        return 3;
    return 4;
}
function buildOneRow(index) {
    const city = pickCityByTierWeight();
    const bhk = weightedBhk();
    const [rMin, rMax] = city.rentByBhk[bhk];
    const monthlyRent = rentInRange(rMin, rMax);
    const locality = pick(city.localities);
    const furnishing = pick(['Semi-furnished', 'Fully furnished', 'Unfurnished']);
    const bathrooms = Math.min(randInt(1, 3), bhk + 1);
    const areaSqft = randInt(400, 2000);
    const propertyType = pick(['apartment', 'apartment', 'apartment', 'house']);
    const lat = city.lat + rand(-0.03, 0.03);
    const lng = city.lng + rand(-0.03, 0.03);
    const rentalYield = rand(3, 6);
    const growthProjection5yr = rand(6, 15);
    const riskScore = rand(10, 40);
    const aiValueScore = randInt(55, 90);
    const aiCategory = aiValueScore >= 72 ? 'UNDERVALUED' : aiValueScore >= 62 ? 'GOOD' : 'FAIR';
    const cagr5y = rand(6, 12);
    const rentalEstimate = Math.round(monthlyRent * rand(0.97, 1.03));
    const nImg = randInt(2, 3);
    const imageUrls = (0, india_listing_thumbnails_1.pickThumbUrlsForRentRow)(index, nImg);
    const title = `${bhk}BHK in ${locality}`;
    const description = `${bhk} bedroom ${propertyType} for rent in ${locality}, ${city.name}. ${furnishing}. ~${areaSqft} sq ft. Near metro & IT corridors. Listing #${index + 1}.`;
    return {
        title,
        description,
        city: city.name,
        state: city.state,
        locality,
        addressLine1: `${randInt(1, 220)} ${locality} Main Road`,
        latitude: Math.round(lat * 1e7) / 1e7,
        longitude: Math.round(lng * 1e7) / 1e7,
        price: monthlyRent,
        currencyCode: 'INR',
        bedrooms: bhk,
        bathrooms,
        areaSqft,
        propertyType,
        furnishing,
        rentalYield: Math.round(rentalYield * 100) / 100,
        growthProjection5yr: Math.round(growthProjection5yr * 100) / 100,
        riskScore: Math.round(riskScore * 100) / 100,
        aiValueScore,
        aiCategory,
        cagr5y: Math.round(cagr5y * 100) / 100,
        rentalEstimate,
        imageUrls,
    };
}
function buildIndiaRentRows(count = exports.INDIA_RENT_TOTAL_DEFAULT) {
    const out = [];
    for (let i = 0; i < count; i++)
        out.push(buildOneRow(i));
    return out;
}
