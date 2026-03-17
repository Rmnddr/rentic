-- Epic 8: Invitations
CREATE TABLE invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), shop_id uuid NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  email text NOT NULL, first_name text, last_name text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','expired')),
  invited_by uuid NOT NULL REFERENCES profiles(id),
  token text NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  created_at timestamptz NOT NULL DEFAULT now(), expires_at timestamptz NOT NULL DEFAULT now() + interval '7 days'
);
CREATE INDEX idx_invitations_shop_id ON invitations(shop_id);
CREATE INDEX idx_invitations_token ON invitations(token);
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners can manage invitations" ON invitations FOR ALL USING (shop_id = get_user_shop_id() AND get_user_role() = 'owner') WITH CHECK (shop_id = get_user_shop_id());
CREATE POLICY "Users can view invitations in their shop" ON invitations FOR SELECT USING (shop_id = get_user_shop_id());
