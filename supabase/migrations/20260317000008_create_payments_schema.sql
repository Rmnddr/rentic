-- Epic 6: Payments, invoices, email logs, webhook events
CREATE TABLE shop_stripe_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), shop_id uuid NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  stripe_account_id text NOT NULL, charges_enabled boolean NOT NULL DEFAULT false, payouts_enabled boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), UNIQUE(shop_id), UNIQUE(stripe_account_id)
);
CREATE TRIGGER trg_shop_stripe_updated_at BEFORE UPDATE ON shop_stripe_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
ALTER TABLE shop_stripe_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners can manage their stripe account" ON shop_stripe_accounts FOR ALL USING (shop_id = get_user_shop_id() AND get_user_role() = 'owner') WITH CHECK (shop_id = get_user_shop_id());
CREATE POLICY "Users can view their shop stripe account" ON shop_stripe_accounts FOR SELECT USING (shop_id = get_user_shop_id());

CREATE TABLE payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), reservation_id uuid NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  stripe_payment_intent_id text, amount integer NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','succeeded','failed','refunded')),
  method text NOT NULL DEFAULT 'card' CHECK (method IN ('card','cash')),
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_payments_reservation_id ON payments(reservation_id);
CREATE TRIGGER trg_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view payments via reservation" ON payments FOR SELECT USING (EXISTS (SELECT 1 FROM reservations r WHERE r.id = reservation_id AND r.shop_id = get_user_shop_id()));
CREATE POLICY "Users can manage payments" ON payments FOR ALL USING (EXISTS (SELECT 1 FROM reservations r WHERE r.id = reservation_id AND r.shop_id = get_user_shop_id())) WITH CHECK (EXISTS (SELECT 1 FROM reservations r WHERE r.id = reservation_id AND r.shop_id = get_user_shop_id()));

CREATE TABLE invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), reservation_id uuid NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  payment_id uuid REFERENCES payments(id) ON DELETE SET NULL, invoice_number text NOT NULL, pdf_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_invoices_reservation_id ON invoices(reservation_id);
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view invoices via reservation" ON invoices FOR SELECT USING (EXISTS (SELECT 1 FROM reservations r WHERE r.id = reservation_id AND r.shop_id = get_user_shop_id()));
CREATE POLICY "Users can manage invoices" ON invoices FOR ALL USING (EXISTS (SELECT 1 FROM reservations r WHERE r.id = reservation_id AND r.shop_id = get_user_shop_id())) WITH CHECK (EXISTS (SELECT 1 FROM reservations r WHERE r.id = reservation_id AND r.shop_id = get_user_shop_id()));

CREATE TABLE email_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), shop_id uuid REFERENCES shops(id) ON DELETE SET NULL,
  type text NOT NULL, recipient text NOT NULL, status text NOT NULL DEFAULT 'sent', sent_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_email_logs_shop_id ON email_logs(shop_id);
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view email logs in their shop" ON email_logs FOR SELECT USING (shop_id = get_user_shop_id());
CREATE POLICY "System can insert email logs" ON email_logs FOR INSERT WITH CHECK (true);

CREATE TABLE webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), event_id text NOT NULL UNIQUE, type text NOT NULL, processed_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_webhook_events_event_id ON webhook_events(event_id);
