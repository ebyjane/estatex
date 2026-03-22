# Database Schema - Real Estate Investment Platform

## ER Diagram Overview

```
countries ──┬──< properties
            ├──< fx_rates
            ├──< market_configs
            └──< users (country preference)

users ──┬──< properties (owner/agent)
        ├──< saved_properties
        ├──< reports
        └──< comparisons

properties ──┬──< property_images
             ├──< ai_valuations
             ├──< property_taxes
             └──< reports

currencies
```

## Tables

### Core

```sql
-- Countries & Regions
CREATE TABLE countries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(3) NOT NULL UNIQUE,  -- ISO 3166-1 (IND, UAE, USA)
  name VARCHAR(100) NOT NULL,
  currency_code VARCHAR(3) NOT NULL,
  region VARCHAR(50),  -- APAC, GCC, NA
  timezone VARCHAR(50),
  tax_rate_default DECIMAL(5,2),  -- % for property tax
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Currencies
CREATE TABLE currencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(3) NOT NULL UNIQUE,
  name VARCHAR(50) NOT NULL,
  symbol VARCHAR(10),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users (Multi-country support)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(30),
  country_id UUID REFERENCES countries(id),
  investor_type VARCHAR(20),  -- nri, gcc, us, cross_border
  preferred_currency VARCHAR(3) DEFAULT 'USD',
  role VARCHAR(20) NOT NULL DEFAULT 'buyer',  -- buyer, seller, agent, admin
  avatar_url VARCHAR(500),
  email_verified_at TIMESTAMPTZ,
  oauth_provider VARCHAR(20),  -- google, microsoft
  oauth_id VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_oauth ON users(oauth_provider, oauth_id);
CREATE INDEX idx_users_role ON users(role);

-- Properties
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id UUID NOT NULL REFERENCES countries(id),
  owner_id UUID REFERENCES users(id),
  agent_id UUID REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  property_type VARCHAR(50),  -- apartment, villa, land, commercial
  listing_type VARCHAR(20) NOT NULL,  -- sale, rent
  price DECIMAL(18,2) NOT NULL,
  currency_code VARCHAR(3) NOT NULL,
  area_sqft DECIMAL(12,2),
  bedrooms INT,
  bathrooms INT,
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  address_line1 VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(100),
  zip VARCHAR(20),
  status VARCHAR(20) DEFAULT 'draft',  -- draft, active, sold, rented
  ai_value_score INT,  -- 0-100
  ai_price_suggestion DECIMAL(18,2),
  rental_yield DECIMAL(5,2),
  cagr_5y DECIMAL(5,2),
  risk_score DECIMAL(4,2),
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_properties_country ON properties(country_id);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_location ON properties(latitude, longitude);
CREATE INDEX idx_properties_price ON properties(price);

-- Property Images
CREATE TABLE property_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  url VARCHAR(500) NOT NULL,
  thumb_url VARCHAR(500),
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_property_images_property ON property_images(property_id);

-- FX Rates (for multi-currency)
CREATE TABLE fx_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_currency VARCHAR(3) NOT NULL,
  to_currency VARCHAR(3) NOT NULL,
  rate DECIMAL(18,8) NOT NULL,
  source VARCHAR(50),
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(from_currency, to_currency, date_trunc('day', fetched_at))
);

CREATE INDEX idx_fx_rates_pair ON fx_rates(from_currency, to_currency);

-- Market Configs (Admin-managed)
CREATE TABLE market_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id UUID NOT NULL REFERENCES countries(id),
  annual_growth_pct DECIMAL(5,2),  -- market appreciation %
  avg_rental_yield DECIMAL(5,2),
  risk_premium DECIMAL(5,2),
  valid_from DATE,
  valid_to DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Valuations (audit/history)
CREATE TABLE ai_valuations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id),
  value_score INT,
  market_comparison DECIMAL(5,2),  -- vs local avg
  rental_yield DECIMAL(5,2),
  cagr_5y DECIMAL(5,2),
  risk_score DECIMAL(4,2),
  model_version VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Property Taxes (country-based)
CREATE TABLE property_taxes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id UUID NOT NULL REFERENCES countries(id),
  tax_type VARCHAR(50),  -- stamp_duty, registration, gst
  rate_pct DECIMAL(5,2),
  min_value DECIMAL(18,2),
  max_value DECIMAL(18,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Saved Properties (wishlist)
CREATE TABLE saved_properties (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, property_id)
);

-- Reports (Premium PDF)
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  property_id UUID REFERENCES properties(id),
  report_type VARCHAR(30),  -- investment, comparison
  payload JSONB,
  file_url VARCHAR(500),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comparisons (Smart Compare)
CREATE TABLE comparisons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  property_ids UUID[] NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Elasticsearch Index (properties)

```json
{
  "mappings": {
    "properties": {
      "id": { "type": "keyword" },
      "country_id": { "type": "keyword" },
      "title": { "type": "text", "analyzer": "standard" },
      "description": { "type": "text", "analyzer": "standard" },
      "property_type": { "type": "keyword" },
      "listing_type": { "type": "keyword" },
      "price": { "type": "float" },
      "currency_code": { "type": "keyword" },
      "latitude": { "type": "float" },
      "longitude": { "type": "geo_point" },
      "city": { "type": "keyword" },
      "state": { "type": "keyword" },
      "ai_value_score": { "type": "integer" },
      "rental_yield": { "type": "float" },
      "cagr_5y": { "type": "float" },
      "risk_score": { "type": "float" },
      "created_at": { "type": "date" }
    }
  }
}
```
