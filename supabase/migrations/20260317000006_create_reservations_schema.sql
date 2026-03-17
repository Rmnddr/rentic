-- Epic 4: Reservations schema (reservations, items, unit assignments, participant values)
-- Includes double-booking prevention trigger and updated check_availability

CREATE TABLE reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  customer_name text NOT NULL, customer_email text, customer_phone text,
  start_date date NOT NULL, end_date date NOT NULL,
  status text NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed','in_progress','completed','cancelled')),
  source text NOT NULL DEFAULT 'back-office' CHECK (source IN ('back-office','web')),
  total_price integer NOT NULL DEFAULT 0, notes text,
  started_at timestamptz, completed_at timestamptz, cancelled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (end_date >= start_date)
);
CREATE INDEX idx_reservations_shop_id ON reservations(shop_id);
CREATE INDEX idx_reservations_shop_status ON reservations(shop_id, status);
CREATE INDEX idx_reservations_dates ON reservations(start_date, end_date);
CREATE TRIGGER trg_reservations_updated_at BEFORE UPDATE ON reservations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view reservations in their shop" ON reservations FOR SELECT USING (shop_id = get_user_shop_id());
CREATE POLICY "Users can manage reservations in their shop" ON reservations FOR ALL USING (shop_id = get_user_shop_id()) WITH CHECK (shop_id = get_user_shop_id());

CREATE TABLE reservation_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id uuid NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  pack_id uuid REFERENCES packs(id) ON DELETE SET NULL,
  quantity integer NOT NULL DEFAULT 1, unit_price integer NOT NULL DEFAULT 0,
  is_optional boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_reservation_items_reservation_id ON reservation_items(reservation_id);
CREATE TRIGGER trg_reservation_items_updated_at BEFORE UPDATE ON reservation_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();
ALTER TABLE reservation_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view reservation items via reservation shop" ON reservation_items FOR SELECT USING (EXISTS (SELECT 1 FROM reservations r WHERE r.id = reservation_id AND r.shop_id = get_user_shop_id()));
CREATE POLICY "Users can manage reservation items" ON reservation_items FOR ALL USING (EXISTS (SELECT 1 FROM reservations r WHERE r.id = reservation_id AND r.shop_id = get_user_shop_id())) WITH CHECK (EXISTS (SELECT 1 FROM reservations r WHERE r.id = reservation_id AND r.shop_id = get_user_shop_id()));

CREATE TABLE reservation_unit_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_item_id uuid NOT NULL REFERENCES reservation_items(id) ON DELETE CASCADE,
  product_unit_id uuid NOT NULL REFERENCES product_units(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_rua_product_unit_id ON reservation_unit_assignments(product_unit_id);
CREATE INDEX idx_rua_reservation_item_id ON reservation_unit_assignments(reservation_item_id);
ALTER TABLE reservation_unit_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view unit assignments via reservation" ON reservation_unit_assignments FOR SELECT USING (EXISTS (SELECT 1 FROM reservation_items ri JOIN reservations r ON r.id = ri.reservation_id WHERE ri.id = reservation_item_id AND r.shop_id = get_user_shop_id()));
CREATE POLICY "Users can manage unit assignments" ON reservation_unit_assignments FOR ALL USING (EXISTS (SELECT 1 FROM reservation_items ri JOIN reservations r ON r.id = ri.reservation_id WHERE ri.id = reservation_item_id AND r.shop_id = get_user_shop_id())) WITH CHECK (EXISTS (SELECT 1 FROM reservation_items ri JOIN reservations r ON r.id = ri.reservation_id WHERE ri.id = reservation_item_id AND r.shop_id = get_user_shop_id()));

CREATE OR REPLACE FUNCTION check_no_double_booking() RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE res_start date; res_end date;
BEGIN
  SELECT r.start_date, r.end_date INTO res_start, res_end FROM reservation_items ri JOIN reservations r ON r.id = ri.reservation_id WHERE ri.id = NEW.reservation_item_id;
  IF EXISTS (SELECT 1 FROM reservation_unit_assignments rua JOIN reservation_items ri ON ri.id = rua.reservation_item_id JOIN reservations r ON r.id = ri.reservation_id WHERE rua.product_unit_id = NEW.product_unit_id AND r.status NOT IN ('cancelled','completed') AND r.start_date < res_end AND r.end_date > res_start AND rua.id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000')) THEN
    RAISE EXCEPTION 'Double booking: unit % is already assigned for this period', NEW.product_unit_id;
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER trg_check_double_booking BEFORE INSERT OR UPDATE ON reservation_unit_assignments FOR EACH ROW EXECUTE FUNCTION check_no_double_booking();

CREATE TABLE participant_attribute_values (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_item_id uuid NOT NULL REFERENCES reservation_items(id) ON DELETE CASCADE,
  category_attribute_id uuid NOT NULL REFERENCES category_attributes(id) ON DELETE CASCADE,
  value text, participant_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_pav_reservation_item_id ON participant_attribute_values(reservation_item_id);
CREATE TRIGGER trg_pav_updated_at BEFORE UPDATE ON participant_attribute_values FOR EACH ROW EXECUTE FUNCTION update_updated_at();
ALTER TABLE participant_attribute_values ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view participant values via reservation" ON participant_attribute_values FOR SELECT USING (EXISTS (SELECT 1 FROM reservation_items ri JOIN reservations r ON r.id = ri.reservation_id WHERE ri.id = reservation_item_id AND r.shop_id = get_user_shop_id()));
CREATE POLICY "Users can manage participant values" ON participant_attribute_values FOR ALL USING (EXISTS (SELECT 1 FROM reservation_items ri JOIN reservations r ON r.id = ri.reservation_id WHERE ri.id = reservation_item_id AND r.shop_id = get_user_shop_id())) WITH CHECK (EXISTS (SELECT 1 FROM reservation_items ri JOIN reservations r ON r.id = ri.reservation_id WHERE ri.id = reservation_item_id AND r.shop_id = get_user_shop_id()));

CREATE OR REPLACE FUNCTION check_availability(p_product_id uuid, p_start_date date, p_end_date date) RETURNS integer LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT count(*)::integer FROM product_units pu WHERE pu.product_id = p_product_id AND pu.status = 'available' AND pu.id NOT IN (SELECT rua.product_unit_id FROM reservation_unit_assignments rua JOIN reservation_items ri ON ri.id = rua.reservation_item_id JOIN reservations r ON r.id = ri.reservation_id WHERE r.status NOT IN ('cancelled','completed') AND r.start_date < p_end_date AND r.end_date > p_start_date)
$$;
