-- Test RLS isolation: shop A user cannot see shop B data
-- Run with: execute via Supabase SQL editor or MCP execute_sql
DO $$
DECLARE
  shop_a_id uuid;
  shop_b_id uuid;
  user_a_id uuid;
  user_b_id uuid;
  row_count integer;
BEGIN
  -- 1. Create two shops (as superuser)
  INSERT INTO shops (name, slug) VALUES ('Shop A', 'shop-a') RETURNING id INTO shop_a_id;
  INSERT INTO shops (name, slug) VALUES ('Shop B', 'shop-b') RETURNING id INTO shop_b_id;

  -- 2. Create two auth users
  INSERT INTO auth.users (id, email, instance_id, aud, role, encrypted_password, email_confirmed_at, created_at, updated_at, confirmation_token, recovery_token)
  VALUES
    (gen_random_uuid(), 'usera@test.com', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', crypt('password123', gen_salt('bf')), now(), now(), now(), '', ''),
    (gen_random_uuid(), 'userb@test.com', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', crypt('password123', gen_salt('bf')), now(), now(), now(), '', '');

  SELECT id INTO user_a_id FROM auth.users WHERE email = 'usera@test.com';
  SELECT id INTO user_b_id FROM auth.users WHERE email = 'userb@test.com';

  -- 3. Create profiles linking users to shops
  INSERT INTO profiles (id, shop_id, role) VALUES (user_a_id, shop_a_id, 'owner');
  INSERT INTO profiles (id, shop_id, role) VALUES (user_b_id, shop_b_id, 'owner');

  -- 4. Switch to authenticated role to test RLS
  PERFORM set_config('request.jwt.claims', json_build_object('sub', user_a_id, 'role', 'authenticated')::text, true);
  PERFORM set_config('role', 'authenticated', true);

  -- 5. Verify user A's shop_id resolves correctly
  IF get_user_shop_id() != shop_a_id THEN
    RAISE EXCEPTION 'FAIL: get_user_shop_id() did not return shop A for user A';
  END IF;

  -- 6. Count shops visible to user A via RLS
  SELECT count(*) INTO row_count FROM shops;
  IF row_count != 1 THEN
    RAISE EXCEPTION 'FAIL: User A sees % shops instead of 1', row_count;
  END IF;

  -- 7. Count profiles visible to user A via RLS
  SELECT count(*) INTO row_count FROM profiles;
  IF row_count != 1 THEN
    RAISE EXCEPTION 'FAIL: User A sees % profiles instead of 1', row_count;
  END IF;

  -- 8. Switch to user B and verify isolation
  PERFORM set_config('request.jwt.claims', json_build_object('sub', user_b_id, 'role', 'authenticated')::text, true);

  IF get_user_shop_id() != shop_b_id THEN
    RAISE EXCEPTION 'FAIL: get_user_shop_id() did not return shop B for user B';
  END IF;

  SELECT count(*) INTO row_count FROM shops;
  IF row_count != 1 THEN
    RAISE EXCEPTION 'FAIL: User B sees % shops instead of 1', row_count;
  END IF;

  -- All tests pass — switch back to superuser for cleanup
  PERFORM set_config('role', 'postgres', true);

  RAISE NOTICE 'ALL RLS ISOLATION TESTS PASSED';

  -- Cleanup
  DELETE FROM profiles WHERE id IN (user_a_id, user_b_id);
  DELETE FROM shops WHERE id IN (shop_a_id, shop_b_id);
  DELETE FROM auth.users WHERE email IN ('usera@test.com', 'userb@test.com');
END;
$$;
