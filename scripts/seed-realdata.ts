/**
 * @deprecated — use `npm run seed:data` (scripts/seed.ts). Kept for reference.
 */

import * as path from 'path';
import Database from 'better-sqlite3';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

/** Repo root when invoked via `npm run seed:data` (npm sets cwd to package root). */
const dbPath =
  process.env.DATABASE_PATH || path.join(process.cwd(), 'real-estate.db');
const db = new Database(dbPath);

db.pragma('foreign_keys = ON');

interface CountryRow {
  code: string;
  name: string;
  currencyCode: string;
  region: string;
}

interface Property {
  title: string;
  description: string;
  city: string;
  state?: string;
  countryCode: string;
  addressLine1: string;
  latitude: number;
  longitude: number;
  price: number;
  currencyCode: string;
  bedrooms: number;
  bathrooms: number;
  areaSqft: number;
  propertyType: string;
  rentalEstimate: number;
  isFeatured: boolean;
}

const countries: CountryRow[] = [
  { code: 'IND', name: 'India', currencyCode: 'INR', region: 'APAC' },
  { code: 'UAE', name: 'United Arab Emirates', currencyCode: 'AED', region: 'GCC' },
  { code: 'USA', name: 'United States', currencyCode: 'USD', region: 'NA' },
  { code: 'GBR', name: 'United Kingdom', currencyCode: 'GBP', region: 'EU' },
  { code: 'SAU', name: 'Saudi Arabia', currencyCode: 'SAR', region: 'GCC' },
];

const indiaLocations = [
  { state: 'Maharashtra', city: 'Mumbai', lat: 19.076, lng: 72.8777 },
  { state: 'Karnataka', city: 'Bangalore', lat: 12.9716, lng: 77.5946 },
  { state: 'Tamil Nadu', city: 'Chennai', lat: 13.0827, lng: 80.2707 },
  { state: 'Delhi', city: 'New Delhi', lat: 28.6139, lng: 77.209 },
  { state: 'West Bengal', city: 'Kolkata', lat: 22.5726, lng: 88.3639 },
  { state: 'Gujarat', city: 'Ahmedabad', lat: 23.0225, lng: 72.5714 },
  { state: 'Telangana', city: 'Hyderabad', lat: 17.385, lng: 78.4867 },
  { state: 'Madhya Pradesh', city: 'Indore', lat: 22.7196, lng: 75.8577 },
  { state: 'Rajasthan', city: 'Jaipur', lat: 26.9124, lng: 75.7873 },
  { state: 'Uttar Pradesh', city: 'Lucknow', lat: 26.8467, lng: 80.9462 },
];

const globalLocations = [
  { countryCode: 'UAE', state: 'Dubai', city: 'Dubai', lat: 25.2048, lng: 55.2708 },
  { countryCode: 'USA', state: 'California', city: 'San Francisco', lat: 37.7749, lng: -122.4194 },
  { countryCode: 'USA', state: 'Texas', city: 'Austin', lat: 30.2672, lng: -97.7431 },
  { countryCode: 'GBR', state: 'England', city: 'London', lat: 51.5074, lng: -0.1278 },
  { countryCode: 'SAU', state: 'Riyadh', city: 'Riyadh', lat: 24.7136, lng: 46.6753 },
  { countryCode: 'UAE', state: 'Abu Dhabi', city: 'Abu Dhabi', lat: 24.4539, lng: 54.3773 },
  { countryCode: 'USA', state: 'New York', city: 'New York', lat: 40.7128, lng: -74.006 },
];

const baseProperties: Property[] = [
  {
    title: 'Luxury 4BHK Virupax Nagar, Bangalore',
    description:
      'Premium apartment with sunrise views, spacious balconies, smart home features',
    city: 'Bangalore',
    state: 'Karnataka',
    countryCode: 'IND',
    addressLine1: '123 Virupax Street, Virupax Nagar, Bangalore 560001',
    latitude: 12.9716,
    longitude: 77.5946,
    price: 12500000,
    currencyCode: 'INR',
    bedrooms: 4,
    bathrooms: 3,
    areaSqft: 2200,
    propertyType: 'apartment',
    rentalEstimate: 85000,
    isFeatured: true,
  },
  {
    title: 'Modern 3BHK Indiranagar',
    description: 'Contemporary design, high-speed internet, excellent connectivity',
    city: 'Bangalore',
    state: 'Karnataka',
    countryCode: 'IND',
    addressLine1: '456 Main Road, Indiranagar, Bangalore 560038',
    latitude: 13.0673,
    longitude: 77.6343,
    price: 8500000,
    currencyCode: 'INR',
    bedrooms: 3,
    bathrooms: 2,
    areaSqft: 1650,
    propertyType: 'apartment',
    rentalEstimate: 58000,
    isFeatured: false,
  },
];

const targetPropertyCount = 1000;

/** Curated Unsplash URLs for listing thumbnails (synthetic “catalog” imagery). */
const LISTING_IMAGES: Record<string, string[]> = {
  apartment: [
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1764996915324-91919cee14d3?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
  ],
  villa: [
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop',
  ],
  house: [
    'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop',
  ],
  commercial: [
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop',
  ],
};

function listingImageUrl(propertyType: string, stableSeed: number): string {
  const t = (propertyType || 'apartment').toLowerCase();
  const urls = LISTING_IMAGES[t] || LISTING_IMAGES.apartment;
  return urls[Math.abs(stableSeed) % urls.length];
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

function currencyForCountry(countryCode: string): string {
  const row = countries.find((c) => c.code === countryCode);
  return row?.currencyCode || 'USD';
}

function createPropertyFromLocation(
  location: {
    city: string;
    state?: string;
    lat: number;
    lng: number;
    countryCode?: string;
  },
  isFeatured = false,
): Property {
  const propertyTypes = ['apartment', 'villa', 'house', 'commercial'];
  const propertyType = pick(propertyTypes);
  const countryCode = location.countryCode || 'IND';
  const basePrice =
    countryCode === 'IND'
      ? randomInt(3000000, 65000000)
      : randomInt(250000, 8500000);
  const bedrooms = randomInt(1, 5);
  const bathrooms = randomInt(1, Math.min(4, bedrooms + 1));
  const areaSqft = randomInt(500, 5000);
  const rentalEstimate = Math.round(
    (basePrice * (countryCode === 'IND' ? 0.04 : 0.05) / 12) *
      (0.8 + Math.random() * 0.4),
  );

  return {
    title: `${propertyType.charAt(0).toUpperCase() + propertyType.slice(1)} in ${location.city}`,
    description: `Prime ${propertyType} in ${location.city}, well-located and investment-ready.`,
    city: location.city,
    state: location.state,
    countryCode,
    addressLine1: `${randomInt(100, 9999)} ${location.city} Road`,
    latitude: location.lat + (Math.random() - 0.5) * 0.08,
    longitude: location.lng + (Math.random() - 0.5) * 0.08,
    price: basePrice,
    currencyCode: currencyForCountry(countryCode),
    bedrooms,
    bathrooms,
    areaSqft,
    propertyType,
    rentalEstimate,
    isFeatured: isFeatured || Math.random() < 0.25,
  };
}

function generateProperties(): Property[] {
  const existingCount = baseProperties.length;
  const target = targetPropertyCount;

  const firstPhaseCount = 250;
  const secondPhaseCount = 350;
  const remainingCount = target - existingCount - firstPhaseCount - secondPhaseCount;

  const bangaloreChennai = indiaLocations.filter((loc) =>
    ['Bangalore', 'Chennai'].includes(loc.city),
  );
  const restIndia = indiaLocations.filter((loc) => !['Bangalore', 'Chennai'].includes(loc.city));

  const properties: Property[] = [];

  for (let i = 0; i < firstPhaseCount; i++) {
    const location = pick(bangaloreChennai);
    properties.push(
      createPropertyFromLocation(
        { ...location, countryCode: 'IND' },
        Math.random() < 0.3,
      ),
    );
  }

  for (let i = 0; i < secondPhaseCount; i++) {
    const location = pick(restIndia);
    properties.push(createPropertyFromLocation({ ...location, countryCode: 'IND' }));
  }

  for (let i = 0; i < remainingCount; i++) {
    const location = pick(globalLocations);
    properties.push(
      createPropertyFromLocation({
        city: location.city,
        state: location.state,
        lat: location.lat,
        lng: location.lng,
        countryCode: location.countryCode,
      }),
    );
  }

  return properties;
}

function createSchema() {
  db.exec(`
    DROP TABLE IF EXISTS property_images;
    DROP TABLE IF EXISTS properties;
    DROP TABLE IF EXISTS users;
    DROP TABLE IF EXISTS countries;

    CREATE TABLE countries (
      id varchar PRIMARY KEY NOT NULL,
      code varchar(3) NOT NULL UNIQUE,
      name varchar(100) NOT NULL,
      currency_code varchar(3) NOT NULL,
      region varchar(50),
      timezone varchar,
      tax_rate_default decimal(5,2),
      created_at datetime DEFAULT (datetime('now')),
      updated_at datetime DEFAULT (datetime('now'))
    );

    CREATE TABLE users (
      id varchar PRIMARY KEY NOT NULL,
      email varchar NOT NULL UNIQUE,
      password_hash varchar,
      first_name varchar,
      last_name varchar,
      phone varchar,
      country_id varchar,
      investor_type varchar,
      preferred_currency varchar DEFAULT 'USD',
      role varchar DEFAULT 'buyer',
      avatar_url varchar,
      oauth_provider varchar,
      oauth_id varchar,
      created_at datetime DEFAULT (datetime('now')),
      updated_at datetime DEFAULT (datetime('now')),
      FOREIGN KEY (country_id) REFERENCES countries (id)
    );

    CREATE TABLE properties (
      id varchar PRIMARY KEY NOT NULL,
      country_id varchar NOT NULL,
      owner_id varchar,
      agent_id varchar,
      title varchar NOT NULL,
      description text,
      property_type varchar,
      listing_type varchar NOT NULL,
      price decimal(18,2) NOT NULL,
      currency_code varchar(3) NOT NULL,
      area_sqft decimal(12,2),
      bedrooms integer,
      bathrooms integer,
      latitude decimal(10,7),
      longitude decimal(10,7),
      address_line1 varchar,
      city varchar,
      state varchar,
      zip varchar,
      status varchar DEFAULT 'draft',
      ai_value_score real,
      ai_price_suggestion decimal(18,2),
      rental_yield decimal(5,2),
      cagr_5y decimal(5,2),
      risk_score decimal(4,2),
      is_verified boolean NOT NULL DEFAULT 0,
      ai_category varchar,
      growth_projection_5yr decimal(5,2),
      rental_estimate decimal(18,2),
      area_demand_index real,
      is_featured boolean NOT NULL DEFAULT 0,
      created_at datetime DEFAULT (datetime('now')),
      updated_at datetime DEFAULT (datetime('now')),
      FOREIGN KEY (country_id) REFERENCES countries (id)
    );

    CREATE TABLE property_images (
      id varchar PRIMARY KEY NOT NULL,
      property_id varchar NOT NULL,
      url varchar NOT NULL,
      thumb_url varchar,
      sort_order integer NOT NULL DEFAULT 0,
      created_at datetime DEFAULT (datetime('now')),
      FOREIGN KEY (property_id) REFERENCES properties (id) ON DELETE CASCADE
    );
  `);
}

async function seedData() {
  console.log('🌱 Starting database seeding at', dbPath, '\n');

  try {
    createSchema();
    console.log('✅ Schema created\n');

    const countryStmt = db.prepare(`
      INSERT INTO countries (id, code, name, currency_code, region, tax_rate_default)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    console.log('📍 Inserting countries...');
    for (const country of countries) {
      const id = crypto.randomUUID();
      countryStmt.run(
        id,
        country.code,
        country.name,
        country.currencyCode,
        country.region,
        Math.round(Math.random() * 30 * 100) / 100,
      );
    }
    console.log(`✅ ${countries.length} countries inserted\n`);

    const countryMap: Record<string, string> = {};
    const countryRows = db.prepare('SELECT id, code FROM countries').all() as Array<{
      id: string;
      code: string;
    }>;
    for (const row of countryRows) {
      countryMap[row.code] = row.id;
    }

    const adminPassword = await bcrypt.hash('admin123', 10);
    const adminId = crypto.randomUUID();
    db.prepare(`
      INSERT INTO users (id, email, password_hash, first_name, role)
      VALUES (?, ?, ?, ?, ?)
    `).run(adminId, 'admin@estatex.ai', adminPassword, 'Admin', 'admin');
    console.log('👤 Admin user inserted (admin@estatex.ai / admin123)\n');

    const generated = generateProperties();
    const allProperties = [...baseProperties, ...generated];

    const propertyStmt = db.prepare(`
      INSERT INTO properties (
        id, country_id, title, description, city, state, address_line1,
        latitude, longitude, price, currency_code, bedrooms, bathrooms,
        area_sqft, property_type, listing_type, status, rental_estimate,
        rental_yield, ai_value_score, ai_category, growth_projection_5yr,
        cagr_5y, risk_score, is_featured, is_verified
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `);

    const imageStmt = db.prepare(`
      INSERT INTO property_images (id, property_id, url, sort_order)
      VALUES (?, ?, ?, 0)
    `);

    console.log('🏠 Inserting properties...');
    for (const prop of allProperties) {
      const id = crypto.randomUUID();
      const countryId = countryMap[prop.countryCode];
      if (!countryId) {
        throw new Error(`Missing country for code: ${prop.countryCode}`);
      }

      const rentalYield = ((prop.rentalEstimate * 12) / prop.price) * 100;
      const baseScore = Math.random() * 40 + 50;
      const rentYieldBonus = Math.min(rentalYield * 2, 20);
      const priceBonus = prop.isFeatured ? 10 : 0;
      const aiScore = Math.min(100, baseScore + rentYieldBonus + priceBonus);
      let aiCategory = 'FAIR';
      if (aiScore > 80) {
        aiCategory = 'UNDERVALUED';
      } else if (aiScore > 70) {
        aiCategory = 'GOOD';
      } else if (aiScore > 60) {
        aiCategory = 'FAIR';
      } else {
        aiCategory = 'PREMIUM';
      }
      const growthProjection = (Math.random() * 0.15 + 0.06) * 100;
      const cagr5y = Math.round((6 + Math.random() * 8) * 100) / 100;
      const riskScore = Math.round((2 + Math.random() * 5) * 100) / 100;

      propertyStmt.run(
        id,
        countryId,
        prop.title,
        prop.description,
        prop.city,
        prop.state || null,
        prop.addressLine1,
        prop.latitude,
        prop.longitude,
        prop.price,
        prop.currencyCode,
        prop.bedrooms,
        prop.bathrooms,
        prop.areaSqft,
        prop.propertyType,
        'sale',
        'active',
        prop.rentalEstimate,
        Math.round(rentalYield * 100) / 100,
        Math.round(aiScore * 100) / 100,
        aiCategory,
        Math.round(growthProjection * 100) / 100,
        cagr5y,
        riskScore,
        prop.isFeatured ? 1 : 0,
        0,
      );

      const imgSeed = id.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
      imageStmt.run(crypto.randomUUID(), id, listingImageUrl(prop.propertyType, imgSeed));
    }

    console.log(`✅ ${allProperties.length} properties + images inserted\n`);

    const stats = {
      countries: db.prepare('SELECT COUNT(*) as count FROM countries').get() as { count: number },
      users: db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number },
      properties: db.prepare('SELECT COUNT(*) as count FROM properties').get() as {
        count: number;
      },
    };

    console.log('📊 Database Seeding Summary:');
    console.log(`   Countries: ${stats.countries.count}`);
    console.log(`   Users: ${stats.users.count}`);
    console.log(`   Properties: ${stats.properties.count}\n`);

    console.log('✨ Database seeding completed successfully!');
    console.log('\n🚀 Demo login:');
    console.log('   Email: admin@estatex.ai');
    console.log('   Password: admin123');
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  } finally {
    db.close();
  }
}

seedData();
