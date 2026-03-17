-- Story 1.3: Auto-create shop + profile on user signup
-- This trigger fires after a new user is created in auth.users

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_shop_id uuid;
  generated_slug text;
BEGIN
  -- Generate a unique slug from email prefix + random suffix
  generated_slug := lower(split_part(NEW.email, '@', 1)) || '-' || substr(md5(random()::text), 1, 6);

  -- Create shop
  INSERT INTO shops (name, slug)
  VALUES ('Mon magasin', generated_slug)
  RETURNING id INTO new_shop_id;

  -- Create profile linked to user and shop
  INSERT INTO profiles (id, shop_id, role)
  VALUES (NEW.id, new_shop_id, 'owner');

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
