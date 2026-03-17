-- Epic 5: Shop websites
CREATE TABLE shop_websites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  hero_title text, hero_subtitle text, hero_image_url text,
  sections jsonb NOT NULL DEFAULT '[]'::jsonb,
  cgv_content text,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(shop_id)
);
CREATE TRIGGER trg_shop_websites_updated_at BEFORE UPDATE ON shop_websites FOR EACH ROW EXECUTE FUNCTION update_updated_at();
ALTER TABLE shop_websites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners can manage their website" ON shop_websites FOR ALL USING (shop_id = get_user_shop_id() AND get_user_role() = 'owner') WITH CHECK (shop_id = get_user_shop_id());
CREATE POLICY "Public can view published websites" ON shop_websites FOR SELECT USING (is_published = true);
