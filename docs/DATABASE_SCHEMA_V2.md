# Database Schema V2 — Production (Investify)

## New/Updated Tables for Revenue + Admin

```sql
-- Add to properties
ALTER TABLE properties ADD COLUMN IF NOT EXISTS ai_category VARCHAR(20);
ALTER TABLE properties ADD COLUMN IF NOT EXISTS growth_projection_5yr DECIMAL(5,2);
ALTER TABLE properties ADD COLUMN IF NOT EXISTS rental_estimate DECIMAL(18,2);
ALTER TABLE properties ADD COLUMN IF NOT EXISTS area_demand_index INT DEFAULT 50;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;

-- Subscriptions (Stripe)
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  plan VARCHAR(30) NOT NULL DEFAULT 'free',  -- free, premium
  status VARCHAR(20) NOT NULL,  -- active, canceled, past_due
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe ON subscriptions(stripe_subscription_id);

-- Payments (Reports, one-time)
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  stripe_payment_intent_id VARCHAR(255),
  amount_cents INT NOT NULL,
  currency VARCHAR(3) NOT NULL,
  product_type VARCHAR(30),  -- report, featured_badge
  reference_id UUID,  -- report_id, property_id
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ingestion Logs (Admin)
CREATE TABLE ingestion_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uploaded_by UUID REFERENCES users(id),
  source VARCHAR(20),  -- csv, manual, api
  total_rows INT,
  success_count INT,
  error_count INT,
  errors JSONB,  -- [{row: 2, error: "..."}]
  status VARCHAR(20) DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```
