-- Story 1.2: Foundation schema — shops, profiles, RLS
-- Multi-tenant isolation via Row Level Security

-- =============================================================================
-- 1. Custom types
-- =============================================================================

CREATE TYPE user_role AS ENUM ('owner', 'employee');

-- =============================================================================
-- 2. Helper: auto-update updated_at
-- =============================================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- =============================================================================
-- 3. Table: shops
-- =============================================================================

CREATE TABLE shops (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name             text        NOT NULL,
  slug             text        NOT NULL,
  email            text,
  phone            text,
  address          text,
  logo_url         text,
  siret            text,
  tva_number       text,
  stripe_connect_id      text,
  stripe_subscription_id text,
  subscription_active    boolean     NOT NULL DEFAULT false,
  onboarding_completed   boolean     NOT NULL DEFAULT false,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT uq_shops_slug UNIQUE (slug)
);

CREATE TRIGGER trg_shops_updated_at
  BEFORE UPDATE ON shops
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- 4. Table: profiles
-- =============================================================================

CREATE TABLE profiles (
  id                      uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  shop_id                 uuid        REFERENCES shops(id) ON DELETE CASCADE,
  role                    user_role   NOT NULL DEFAULT 'owner',
  first_name              text,
  last_name               text,
  avatar_url              text,
  onboarding_current_step integer     NOT NULL DEFAULT 1,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_shop_id ON profiles(shop_id);

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- 5. RLS helper functions
-- =============================================================================

CREATE OR REPLACE FUNCTION get_user_shop_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT shop_id FROM profiles WHERE id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT role FROM profiles WHERE id = auth.uid()
$$;

-- =============================================================================
-- 6. Row Level Security
-- =============================================================================

ALTER TABLE shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- shops policies
CREATE POLICY "Users can view their own shop"
  ON shops FOR SELECT
  USING (id = get_user_shop_id());

CREATE POLICY "Owners can update their own shop"
  ON shops FOR UPDATE
  USING (id = get_user_shop_id() AND get_user_role() = 'owner')
  WITH CHECK (id = get_user_shop_id());

-- profiles policies
CREATE POLICY "Users can view profiles in their shop"
  ON profiles FOR SELECT
  USING (shop_id = get_user_shop_id());

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());
