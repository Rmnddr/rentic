-- Epic 2: Catalog schema — categories, attributes, products, units, brands

-- 1. Categories
CREATE TABLE categories (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id     uuid        NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  name        text        NOT NULL,
  type        text        NOT NULL DEFAULT 'product' CHECK (type IN ('product', 'participant')),
  position    integer     NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_categories_shop_id ON categories(shop_id);
CREATE TRIGGER trg_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view categories in their shop" ON categories FOR SELECT USING (shop_id = get_user_shop_id());
CREATE POLICY "Owners can manage categories" ON categories FOR ALL USING (shop_id = get_user_shop_id() AND get_user_role() = 'owner') WITH CHECK (shop_id = get_user_shop_id());

-- 2. Category Attributes (EAV schema)
CREATE TABLE category_attributes (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id  uuid        NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name         text        NOT NULL,
  scope        text        NOT NULL DEFAULT 'product' CHECK (scope IN ('product', 'participant')),
  format       text        NOT NULL DEFAULT 'text' CHECK (format IN ('text', 'number', 'select')),
  options      jsonb,
  position     integer     NOT NULL DEFAULT 0,
  required     boolean     NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_category_attributes_category_id ON category_attributes(category_id);
CREATE TRIGGER trg_category_attributes_updated_at BEFORE UPDATE ON category_attributes FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE category_attributes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view attributes via category shop" ON category_attributes FOR SELECT
  USING (EXISTS (SELECT 1 FROM categories c WHERE c.id = category_id AND c.shop_id = get_user_shop_id()));
CREATE POLICY "Owners can manage attributes" ON category_attributes FOR ALL
  USING (EXISTS (SELECT 1 FROM categories c WHERE c.id = category_id AND c.shop_id = get_user_shop_id() AND get_user_role() = 'owner'))
  WITH CHECK (EXISTS (SELECT 1 FROM categories c WHERE c.id = category_id AND c.shop_id = get_user_shop_id()));

-- 3. Brands
CREATE TABLE brands (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id    uuid        NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  name       text        NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_brands_shop_id ON brands(shop_id);
CREATE TRIGGER trg_brands_updated_at BEFORE UPDATE ON brands FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view brands in their shop" ON brands FOR SELECT USING (shop_id = get_user_shop_id());
CREATE POLICY "Owners can manage brands" ON brands FOR ALL USING (shop_id = get_user_shop_id() AND get_user_role() = 'owner') WITH CHECK (shop_id = get_user_shop_id());

-- 4. Products
CREATE TABLE products (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id      uuid        NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  category_id  uuid        NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  brand_id     uuid        REFERENCES brands(id) ON DELETE SET NULL,
  name         text        NOT NULL,
  description  text,
  price_web    integer     NOT NULL DEFAULT 0,
  price_shop   integer     NOT NULL DEFAULT 0,
  image_url    text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_products_shop_id ON products(shop_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE TRIGGER trg_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view products in their shop" ON products FOR SELECT USING (shop_id = get_user_shop_id());
CREATE POLICY "Owners can manage products" ON products FOR ALL USING (shop_id = get_user_shop_id() AND get_user_role() = 'owner') WITH CHECK (shop_id = get_user_shop_id());

-- 5. Product Attribute Values (EAV values)
CREATE TABLE product_attribute_values (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id    uuid        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  attribute_id  uuid        NOT NULL REFERENCES category_attributes(id) ON DELETE CASCADE,
  value         text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE(product_id, attribute_id)
);

CREATE INDEX idx_product_attribute_values_product_id ON product_attribute_values(product_id);
CREATE TRIGGER trg_product_attribute_values_updated_at BEFORE UPDATE ON product_attribute_values FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE product_attribute_values ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view product attribute values via product shop" ON product_attribute_values FOR SELECT
  USING (EXISTS (SELECT 1 FROM products p WHERE p.id = product_id AND p.shop_id = get_user_shop_id()));
CREATE POLICY "Owners can manage product attribute values" ON product_attribute_values FOR ALL
  USING (EXISTS (SELECT 1 FROM products p WHERE p.id = product_id AND p.shop_id = get_user_shop_id() AND get_user_role() = 'owner'))
  WITH CHECK (EXISTS (SELECT 1 FROM products p WHERE p.id = product_id AND p.shop_id = get_user_shop_id()));

-- 6. Product Units (physical stock)
CREATE TABLE product_units (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  uuid        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  label       text        NOT NULL,
  status      text        NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'maintenance', 'retired')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_product_units_product_id ON product_units(product_id);
CREATE TRIGGER trg_product_units_updated_at BEFORE UPDATE ON product_units FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE product_units ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view units via product shop" ON product_units FOR SELECT
  USING (EXISTS (SELECT 1 FROM products p WHERE p.id = product_id AND p.shop_id = get_user_shop_id()));
CREATE POLICY "Owners can manage units" ON product_units FOR ALL
  USING (EXISTS (SELECT 1 FROM products p WHERE p.id = product_id AND p.shop_id = get_user_shop_id() AND get_user_role() = 'owner'))
  WITH CHECK (EXISTS (SELECT 1 FROM products p WHERE p.id = product_id AND p.shop_id = get_user_shop_id()));
