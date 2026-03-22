-- Seed data for MVP
INSERT INTO countries (id, code, name, currency_code, region) VALUES
  (gen_random_uuid(), 'IND', 'India', 'INR', 'APAC'),
  (gen_random_uuid(), 'UAE', 'United Arab Emirates', 'AED', 'GCC'),
  (gen_random_uuid(), 'USA', 'United States', 'USD', 'NA'),
  (gen_random_uuid(), 'GBR', 'United Kingdom', 'GBP', 'EU'),
  (gen_random_uuid(), 'SAU', 'Saudi Arabia', 'SAR', 'GCC')
ON CONFLICT (code) DO NOTHING;
