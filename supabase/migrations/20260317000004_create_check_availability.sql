-- Story 2.8: Availability check function
CREATE OR REPLACE FUNCTION check_availability(
  p_product_id uuid,
  p_start_date date,
  p_end_date date
)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT count(*)::integer
  FROM product_units pu
  WHERE pu.product_id = p_product_id
    AND pu.status = 'available'
    AND pu.id NOT IN (
      SELECT '00000000-0000-0000-0000-000000000000'::uuid WHERE false
    )
$$;

CREATE INDEX idx_product_units_product_status ON product_units(product_id, status);
