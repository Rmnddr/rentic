-- Epic 3: Packs & Tarification

CREATE TABLE packs (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id     uuid        NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  name        text        NOT NULL,
  description text,
  image_url   text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_packs_shop_id ON packs(shop_id);
CREATE TRIGGER trg_packs_updated_at BEFORE UPDATE ON packs FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE packs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view packs in their shop" ON packs FOR SELECT USING (shop_id = get_user_shop_id());
CREATE POLICY "Owners can manage packs" ON packs FOR ALL USING (shop_id = get_user_shop_id() AND get_user_role() = 'owner') WITH CHECK (shop_id = get_user_shop_id());

CREATE TABLE pack_items (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  pack_id             uuid        NOT NULL REFERENCES packs(id) ON DELETE CASCADE,
  product_id          uuid        NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  is_required         boolean     NOT NULL DEFAULT true,
  price_web_override  integer,
  price_shop_override integer,
  position            integer     NOT NULL DEFAULT 0,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_pack_items_pack_id ON pack_items(pack_id);
CREATE TRIGGER trg_pack_items_updated_at BEFORE UPDATE ON pack_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE pack_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view pack items via pack shop" ON pack_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM packs p WHERE p.id = pack_id AND p.shop_id = get_user_shop_id()));
CREATE POLICY "Owners can manage pack items" ON pack_items FOR ALL
  USING (EXISTS (SELECT 1 FROM packs p WHERE p.id = pack_id AND p.shop_id = get_user_shop_id() AND get_user_role() = 'owner'))
  WITH CHECK (EXISTS (SELECT 1 FROM packs p WHERE p.id = pack_id AND p.shop_id = get_user_shop_id()));
