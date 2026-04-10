-- Stripe Connect integration for Evolute platform marketplace
-- Enables revenue splitting: platform takes 10-15% of venture revenue

-- ---------------------------------------------------------------------------
-- User Profiles — extend with Stripe Connect
-- ---------------------------------------------------------------------------

CREATE TABLE user_profiles (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name          text,
  avatar_url            text,
  -- Stripe Connect
  stripe_account_id     text,          -- Stripe Connected Account ID (acct_xxx)
  stripe_onboarded      boolean NOT NULL DEFAULT false,
  stripe_charges_enabled boolean NOT NULL DEFAULT false,
  stripe_payouts_enabled boolean NOT NULL DEFAULT false,
  -- Platform role
  role                  text NOT NULL DEFAULT 'user',  -- 'admin' | 'user'
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER user_profiles_updated BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_user_profiles_user ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_stripe ON user_profiles(stripe_account_id);

-- ---------------------------------------------------------------------------
-- Venture env vars — per-venture secrets (Stripe keys, API keys, etc.)
-- ---------------------------------------------------------------------------

CREATE TABLE venture_env_vars (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venture_id  uuid NOT NULL REFERENCES ventures(id) ON DELETE CASCADE,
  key         text NOT NULL,
  value       text NOT NULL,
  is_secret   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE(venture_id, key)
);

CREATE INDEX idx_venture_env_vars_venture ON venture_env_vars(venture_id);

-- ---------------------------------------------------------------------------
-- Venture revenue tracking — aggregated from Stripe webhooks
-- ---------------------------------------------------------------------------

CREATE TABLE venture_revenue (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venture_id      uuid NOT NULL REFERENCES ventures(id) ON DELETE CASCADE,
  period_start    date NOT NULL,
  period_end      date NOT NULL,
  gross_revenue   integer NOT NULL DEFAULT 0,  -- in cents
  platform_fee    integer NOT NULL DEFAULT 0,  -- in cents (Evolute's cut)
  net_revenue     integer NOT NULL DEFAULT 0,  -- in cents (user's cut)
  payment_count   integer NOT NULL DEFAULT 0,
  refund_count    integer NOT NULL DEFAULT 0,
  currency        text NOT NULL DEFAULT 'usd',
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE(venture_id, period_start)
);

CREATE INDEX idx_venture_revenue_venture ON venture_revenue(venture_id, period_start DESC);

-- ---------------------------------------------------------------------------
-- Stripe events log — webhook event deduplication
-- ---------------------------------------------------------------------------

CREATE TABLE stripe_events (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id      text NOT NULL UNIQUE,  -- Stripe event ID (evt_xxx)
  event_type    text NOT NULL,
  venture_id    uuid REFERENCES ventures(id) ON DELETE SET NULL,
  amount        integer,               -- in cents
  currency      text,
  metadata      jsonb DEFAULT '{}',
  processed_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_stripe_events_venture ON stripe_events(venture_id, processed_at DESC);
CREATE INDEX idx_stripe_events_type ON stripe_events(event_type);

-- ---------------------------------------------------------------------------
-- Platform settings — global config (fee percentage, etc.)
-- ---------------------------------------------------------------------------

CREATE TABLE platform_settings (
  key         text PRIMARY KEY,
  value       jsonb NOT NULL,
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Default platform fee: 12%
INSERT INTO platform_settings (key, value) VALUES
  ('platform_fee_percent', '12'),
  ('stripe_mode', '"test"'),
  ('platform_name', '"Evolute"');

-- ---------------------------------------------------------------------------
-- Add Stripe product/price IDs to ventures
-- ---------------------------------------------------------------------------

ALTER TABLE ventures ADD COLUMN stripe_product_id text;
ALTER TABLE ventures ADD COLUMN stripe_price_id text;
ALTER TABLE ventures ADD COLUMN stripe_checkout_url text;

-- ---------------------------------------------------------------------------
-- RLS Policies
-- ---------------------------------------------------------------------------

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE venture_env_vars ENABLE ROW LEVEL SECURITY;
ALTER TABLE venture_revenue ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

-- User profiles: users see their own
CREATE POLICY "Owner only" ON user_profiles FOR ALL
  USING (auth.uid() = user_id);

-- Venture env vars: venture owner only
CREATE POLICY "Venture owner" ON venture_env_vars FOR ALL
  USING (venture_id IN (SELECT id FROM ventures WHERE user_id = auth.uid()));

-- Revenue: venture owner only
CREATE POLICY "Venture owner" ON venture_revenue FOR ALL
  USING (venture_id IN (SELECT id FROM ventures WHERE user_id = auth.uid()));

-- Stripe events: venture owner only
CREATE POLICY "Venture owner" ON stripe_events FOR ALL
  USING (venture_id IN (SELECT id FROM ventures WHERE user_id = auth.uid()));

-- Platform settings: read-only for all authenticated users
CREATE POLICY "Read only" ON platform_settings FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Dev bypass policies
CREATE POLICY "Dev bypass" ON user_profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Dev bypass" ON venture_env_vars FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Dev bypass" ON venture_revenue FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Dev bypass" ON stripe_events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Dev bypass" ON platform_settings FOR ALL USING (true) WITH CHECK (true);
