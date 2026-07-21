-- Story 5.5-5.7: Tunnel de réservation public
-- 1) Lecture publique du catalogue pour les shops dont le site est publié
-- 2) Fonction transactionnelle create_web_reservation (SECURITY DEFINER)
--    - prix recalculés côté serveur (le client n'est jamais cru)
--    - assignation d'unités avec verrou (FOR UPDATE) contre les races
--    - le trigger trg_check_double_booking reste le filet final

-- =============================================================================
-- 1. Helper : un shop est-il public ?
-- =============================================================================

CREATE OR REPLACE FUNCTION is_shop_public(p_shop_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM shop_websites w
    WHERE w.shop_id = p_shop_id AND w.is_published = true
  )
$$;

-- =============================================================================
-- 2. Policies de lecture publique (visiteurs anonymes du site vitrine)
--    Uniquement si le site du shop est publié — la publication est
--    l'interrupteur de visibilité.
-- =============================================================================

CREATE POLICY "Public can view shops with published website"
  ON shops FOR SELECT
  USING (is_shop_public(id));

CREATE POLICY "Public can view categories of public shops"
  ON categories FOR SELECT
  USING (is_shop_public(shop_id));

CREATE POLICY "Public can view attributes of public shops"
  ON category_attributes FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM categories c
    WHERE c.id = category_id AND is_shop_public(c.shop_id)
  ));

CREATE POLICY "Public can view products of public shops"
  ON products FOR SELECT
  USING (is_shop_public(shop_id));

CREATE POLICY "Public can view brands of public shops"
  ON brands FOR SELECT
  USING (is_shop_public(shop_id));

CREATE POLICY "Public can view packs of public shops"
  ON packs FOR SELECT
  USING (is_shop_public(shop_id));

CREATE POLICY "Public can view pack items of public shops"
  ON pack_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM packs p
    WHERE p.id = pack_id AND is_shop_public(p.shop_id)
  ));

-- NB : product_units et reservations restent privés — la disponibilité
-- publique passe exclusivement par check_availability() (SECURITY DEFINER).

-- =============================================================================
-- 3. Fonction transactionnelle de réservation web
--    p_items : [{product_id, pack_id|null, quantity}]
--    p_participant_values : [{item_index, attribute_id, value, participant_index}]
--    Retourne l'id de la réservation créée.
-- =============================================================================

CREATE OR REPLACE FUNCTION create_web_reservation(
  p_shop_id uuid,
  p_customer_name text,
  p_customer_email text,
  p_customer_phone text,
  p_start_date date,
  p_end_date date,
  p_items jsonb,
  p_participant_values jsonb DEFAULT '[]'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_reservation_id uuid;
  v_item jsonb;
  v_item_ids uuid[] := '{}';
  v_item_id uuid;
  v_product_id uuid;
  v_pack_id uuid;
  v_qty integer;
  v_price integer;
  v_total integer := 0;
  v_unit_ids uuid[];
  v_pv jsonb;
  v_pv_item_index integer;
  v_pv_attribute_id uuid;
BEGIN
  -- Garde-fous d'entrée (la validation Zod côté action est la première
  -- couche ; on revalide ici car la fonction est exécutable par anon)
  IF NOT is_shop_public(p_shop_id) THEN
    RAISE EXCEPTION 'SHOP_NOT_PUBLIC';
  END IF;
  IF p_customer_name IS NULL OR length(trim(p_customer_name)) = 0
     OR length(p_customer_name) > 200 THEN
    RAISE EXCEPTION 'INVALID_CUSTOMER';
  END IF;
  IF p_customer_email IS NULL OR p_customer_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
     OR length(p_customer_email) > 320 THEN
    RAISE EXCEPTION 'INVALID_CUSTOMER';
  END IF;
  IF p_end_date IS NULL OR p_start_date IS NULL OR p_end_date < p_start_date
     OR p_start_date < current_date THEN
    RAISE EXCEPTION 'INVALID_DATES';
  END IF;
  IF p_items IS NULL OR jsonb_typeof(p_items) != 'array'
     OR jsonb_array_length(p_items) < 1 OR jsonb_array_length(p_items) > 50 THEN
    RAISE EXCEPTION 'INVALID_ITEMS';
  END IF;
  IF jsonb_typeof(p_participant_values) != 'array'
     OR jsonb_array_length(p_participant_values) > 500 THEN
    RAISE EXCEPTION 'INVALID_PARTICIPANTS';
  END IF;

  INSERT INTO reservations (
    shop_id, customer_name, customer_email, customer_phone,
    start_date, end_date, source, status, total_price
  ) VALUES (
    p_shop_id, trim(p_customer_name), p_customer_email, nullif(trim(coalesce(p_customer_phone, '')), ''),
    p_start_date, p_end_date, 'web', 'confirmed', 0
  ) RETURNING id INTO v_reservation_id;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    v_product_id := (v_item->>'product_id')::uuid;
    v_pack_id := nullif(v_item->>'pack_id', '')::uuid;
    v_qty := (v_item->>'quantity')::integer;

    IF v_qty IS NULL OR v_qty < 1 OR v_qty > 100 THEN
      RAISE EXCEPTION 'INVALID_QUANTITY';
    END IF;

    -- Prix recalculé côté serveur — jamais celui du client
    IF v_pack_id IS NOT NULL THEN
      SELECT coalesce(pi.price_web_override, pr.price_web) INTO v_price
      FROM pack_items pi
      JOIN packs pk ON pk.id = pi.pack_id
      JOIN products pr ON pr.id = pi.product_id
      WHERE pi.pack_id = v_pack_id
        AND pi.product_id = v_product_id
        AND pk.shop_id = p_shop_id;
      IF v_price IS NULL THEN
        RAISE EXCEPTION 'ITEM_NOT_IN_PACK';
      END IF;
    ELSE
      SELECT pr.price_web INTO v_price
      FROM products pr
      WHERE pr.id = v_product_id AND pr.shop_id = p_shop_id;
      IF v_price IS NULL THEN
        RAISE EXCEPTION 'PRODUCT_NOT_IN_SHOP';
      END IF;
    END IF;

    INSERT INTO reservation_items (
      reservation_id, product_id, pack_id, quantity, unit_price, is_optional
    ) VALUES (
      v_reservation_id, v_product_id, v_pack_id, v_qty, v_price,
      coalesce((v_item->>'is_optional')::boolean, false)
    ) RETURNING id INTO v_item_id;

    v_item_ids := array_append(v_item_ids, v_item_id);
    v_total := v_total + v_price * v_qty;

    -- Unités libres sur la période, verrouillées pour sérialiser les
    -- réservations concurrentes du même produit
    SELECT array_agg(id) INTO v_unit_ids FROM (
      SELECT pu.id
      FROM product_units pu
      WHERE pu.product_id = v_product_id
        AND pu.status = 'available'
        AND pu.id NOT IN (
          SELECT rua.product_unit_id
          FROM reservation_unit_assignments rua
          JOIN reservation_items ri ON ri.id = rua.reservation_item_id
          JOIN reservations r ON r.id = ri.reservation_id
          WHERE r.status NOT IN ('cancelled', 'completed')
            AND r.start_date < p_end_date
            AND r.end_date > p_start_date
        )
      ORDER BY pu.id
      FOR UPDATE OF pu
      LIMIT v_qty
    ) s;

    IF coalesce(array_length(v_unit_ids, 1), 0) < v_qty THEN
      RAISE EXCEPTION 'INSUFFICIENT_STOCK:%', v_product_id;
    END IF;

    INSERT INTO reservation_unit_assignments (reservation_item_id, product_unit_id)
    SELECT v_item_id, unnest(v_unit_ids);
  END LOOP;

  -- Attributs participants (EAV) rattachés aux items par index
  FOR v_pv IN SELECT * FROM jsonb_array_elements(p_participant_values) LOOP
    v_pv_item_index := (v_pv->>'item_index')::integer;
    v_pv_attribute_id := (v_pv->>'attribute_id')::uuid;

    IF v_pv_item_index IS NULL OR v_pv_item_index < 0
       OR v_pv_item_index >= coalesce(array_length(v_item_ids, 1), 0) THEN
      RAISE EXCEPTION 'INVALID_PARTICIPANTS';
    END IF;

    -- L'attribut doit appartenir à une catégorie du shop
    PERFORM 1 FROM category_attributes ca
    JOIN categories c ON c.id = ca.category_id
    WHERE ca.id = v_pv_attribute_id AND c.shop_id = p_shop_id;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'INVALID_PARTICIPANTS';
    END IF;

    INSERT INTO participant_attribute_values (
      reservation_item_id, category_attribute_id, value, participant_index
    ) VALUES (
      v_item_ids[v_pv_item_index + 1],
      v_pv_attribute_id,
      left(v_pv->>'value', 2000),
      coalesce((v_pv->>'participant_index')::integer, 0)
    );
  END LOOP;

  UPDATE reservations SET total_price = v_total WHERE id = v_reservation_id;

  RETURN v_reservation_id;
END;
$$;

REVOKE ALL ON FUNCTION create_web_reservation(uuid, text, text, text, date, date, jsonb, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION create_web_reservation(uuid, text, text, text, date, date, jsonb, jsonb) TO anon, authenticated;
