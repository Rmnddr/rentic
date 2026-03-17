-- Epic 7: Subscriptions
CREATE TABLE subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), shop_id uuid NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  stripe_subscription_id text, stripe_customer_id text,
  plan text NOT NULL DEFAULT 'trial' CHECK (plan IN ('trial','season','annual')),
  status text NOT NULL DEFAULT 'trialing' CHECK (status IN ('trialing','active','past_due','canceled','expired')),
  trial_ends_at timestamptz, current_period_start timestamptz, current_period_end timestamptz,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), UNIQUE(shop_id)
);
CREATE TRIGGER trg_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners can manage their subscription" ON subscriptions FOR ALL USING (shop_id = get_user_shop_id() AND get_user_role() = 'owner') WITH CHECK (shop_id = get_user_shop_id());
CREATE POLICY "Users can view their shop subscription" ON subscriptions FOR SELECT USING (shop_id = get_user_shop_id());

CREATE OR REPLACE FUNCTION handle_onboarding_completed() RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.onboarding_completed = true AND OLD.onboarding_completed = false THEN
    INSERT INTO subscriptions (shop_id, plan, status, trial_ends_at) VALUES (NEW.id, 'trial', 'trialing', now() + interval '30 days') ON CONFLICT (shop_id) DO NOTHING;
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER trg_onboarding_completed AFTER UPDATE ON shops FOR EACH ROW EXECUTE FUNCTION handle_onboarding_completed();
