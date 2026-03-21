-- ═══════════════════════════════════════════════════════════════
-- LA GUACA — Schema completo de base de datos
-- Ejecutar en el SQL Editor de Supabase
-- ═══════════════════════════════════════════════════════════════

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ───────────────────────────────────────────
-- TABLA: user_roles
-- ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_roles (
  uid UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'customer')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins pueden ver roles" ON user_roles
  FOR SELECT USING (
    auth.uid() = uid OR
    EXISTS (SELECT 1 FROM user_roles WHERE uid = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Solo admins pueden gestionar roles" ON user_roles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE uid = auth.uid() AND role = 'admin')
  );

-- ───────────────────────────────────────────
-- TABLA: categories
-- ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos pueden ver categorías activas" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Solo admins gestionan categorías" ON categories
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE uid = auth.uid() AND role = 'admin')
  );

-- ───────────────────────────────────────────
-- TABLA: products
-- ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price INTEGER NOT NULL,
  original_price INTEGER,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  low_stock_alert INTEGER DEFAULT 0,
  viewers_count INTEGER DEFAULT 0,
  materials_care TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos pueden ver productos" ON products
  FOR SELECT USING (true);

CREATE POLICY "Solo admins gestionan productos" ON products
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE uid = auth.uid() AND role = 'admin')
  );

-- ───────────────────────────────────────────
-- TABLA: product_variants (tallas y stock)
-- ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size TEXT NOT NULL,
  stock INTEGER DEFAULT 0,
  display_order INTEGER DEFAULT 0
);

ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos pueden ver variantes" ON product_variants
  FOR SELECT USING (true);

CREATE POLICY "Solo admins gestionan variantes" ON product_variants
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE uid = auth.uid() AND role = 'admin')
  );

-- ───────────────────────────────────────────
-- TABLA: product_images
-- ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0
);

ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos pueden ver imágenes" ON product_images
  FOR SELECT USING (true);

CREATE POLICY "Solo admins gestionan imágenes" ON product_images
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE uid = auth.uid() AND role = 'admin')
  );

-- ───────────────────────────────────────────
-- TABLA: orders
-- ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  default_address TEXT,
  default_city TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own profile" ON user_profiles
  FOR ALL TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  customer_address TEXT NOT NULL,
  customer_city TEXT NOT NULL,
  status TEXT DEFAULT 'pendiente' CHECK (
    status IN ('pendiente', 'confirmado', 'preparando', 'enviado', 'entregado', 'cancelado')
  ),
  total INTEGER NOT NULL,
  wompi_reference TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Anon puede crear pedidos
CREATE POLICY "Clientes pueden crear pedidos" ON orders
  FOR INSERT WITH CHECK (true);

-- Solo admins pueden ver y gestionar pedidos
CREATE POLICY "Admins ven todos los pedidos" ON orders
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE uid = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins gestionan pedidos" ON orders
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_roles WHERE uid = auth.uid() AND role = 'admin')
  );

-- Permitir SELECT por order_number para la página de confirmación (anon)
CREATE POLICY "Clientes pueden ver su pedido por referencia" ON orders
  FOR SELECT USING (
    order_number IS NOT NULL
  );

CREATE POLICY "Users read own orders" ON orders
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can claim own order" ON orders
  FOR UPDATE TO authenticated
  USING (user_id IS NULL)
  WITH CHECK (user_id = auth.uid());

-- ───────────────────────────────────────────
-- TABLA: order_items
-- ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  product_name TEXT NOT NULL,
  size TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price INTEGER NOT NULL
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clientes pueden crear items de pedido" ON order_items
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins ven items de pedidos" ON order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE uid = auth.uid() AND role = 'admin')
  );

-- Permitir SELECT para la página de confirmación (anon)
CREATE POLICY "Clientes pueden ver items de su pedido" ON order_items
  FOR SELECT USING (true);

-- ───────────────────────────────────────────
-- TABLA: store_config (singleton, solo 1 fila)
-- ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS store_config (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  store_name TEXT DEFAULT 'La Guaca',
  owner_whatsapp TEXT,
  store_email TEXT,
  store_description TEXT,
  instagram_url TEXT,
  tiktok_url TEXT,
  wompi_payment_link TEXT,
  wompi_public_key TEXT,
  wompi_integrity_key TEXT,
  wompi_events_key TEXT,
  hero_video_url TEXT,
  hero_image_url TEXT,
  announcement_bar_text TEXT,
  announcement_bar_active BOOLEAN DEFAULT false,
  sold_out_message TEXT,
  sold_out_whatsapp_message TEXT,
  shipping_returns_text TEXT,
  custom_cursor_enabled BOOLEAN DEFAULT true
);

ALTER TABLE store_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos pueden ver la config" ON store_config
  FOR SELECT USING (true);

CREATE POLICY "Solo admins editan config" ON store_config
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_roles WHERE uid = auth.uid() AND role = 'admin')
  );

-- ───────────────────────────────────────────
-- FUNCIÓN: Auto-generar order_number
-- Formato: LG-2024-0001
-- ───────────────────────────────────────────
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
  current_year TEXT;
  next_seq INTEGER;
BEGIN
  current_year := EXTRACT(YEAR FROM NOW())::TEXT;
  
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(order_number FROM 'LG-' || current_year || '-(\d+)') AS INTEGER)
  ), 0) + 1
  INTO next_seq
  FROM orders
  WHERE order_number LIKE 'LG-' || current_year || '-%';
  
  NEW.order_number := 'LG-' || current_year || '-' || LPAD(next_seq::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW
  WHEN (NEW.order_number IS NULL)
  EXECUTE FUNCTION generate_order_number();

-- ───────────────────────────────────────────
-- FUNCIÓN: Decrementar stock tras pago confirmado
-- ───────────────────────────────────────────
CREATE OR REPLACE FUNCTION decrement_stock(
  p_product_id UUID,
  p_size TEXT,
  p_quantity INTEGER
)
RETURNS void AS $$
BEGIN
  UPDATE product_variants
  SET stock = GREATEST(0, stock - p_quantity)
  WHERE product_id = p_product_id AND size = p_size;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ───────────────────────────────────────────
-- ÍNDICES para performance
-- ───────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_product ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- ───────────────────────────────────────────
-- TABLA: product_viewers (contador real de espectadores)
-- ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS product_viewers (
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  viewer_id TEXT NOT NULL,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (product_id, viewer_id)
);
CREATE INDEX IF NOT EXISTS idx_product_viewers_last_seen ON product_viewers(product_id, last_seen_at);
ALTER TABLE product_viewers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow viewer heartbeat" ON product_viewers FOR ALL USING (true) WITH CHECK (true);

-- ───────────────────────────────────────────
-- STORAGE BUCKET para imágenes
-- ───────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT DO NOTHING;

-- Política: todos pueden ver imágenes, solo admins suben/borran
CREATE POLICY "Imágenes públicas" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Solo admins suben imágenes" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'product-images' AND
    EXISTS (SELECT 1 FROM user_roles WHERE uid = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Solo admins borran imágenes" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'product-images' AND
    EXISTS (SELECT 1 FROM user_roles WHERE uid = auth.uid() AND role = 'admin')
  );

-- ═══════════════════════════════════════════════════════════════
-- MONERÍA STUDIO — Tablas y políticas
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS moneria_products (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name             text NOT NULL,
  description      text,
  price            numeric(10,2) NOT NULL,
  image_url        text NOT NULL,
  second_image_url text,
  sizes            text[] DEFAULT '{}',
  is_active        boolean DEFAULT true,
  is_featured      boolean DEFAULT false,
  stock            integer DEFAULT 0,
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);

ALTER TABLE moneria_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lectura publica moneria_products"
  ON moneria_products FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS moneria_section_config (
  id                  integer PRIMARY KEY DEFAULT 1,
  is_visible          boolean DEFAULT true,
  section_title       text DEFAULT 'DROP',
  section_subtitle    text DEFAULT 'MONERÍA STUDIO',
  section_description text,
  drop_label          text DEFAULT 'DROP 001'
);

ALTER TABLE moneria_section_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lectura publica moneria_section_config"
  ON moneria_section_config FOR SELECT USING (true);

INSERT INTO moneria_section_config (id, is_visible, section_title, section_subtitle, section_description, drop_label)
VALUES (
  1, true, 'DROP', 'MONERÍA STUDIO',
  'Diseño colombiano de autor. Piezas de edición limitada para quienes entienden que la moda es identidad.',
  'DROP 001'
)
ON CONFLICT (id) DO NOTHING;

-- Bucket para imágenes de Monería
INSERT INTO storage.buckets (id, name, public)
VALUES ('moneria-products', 'moneria-products', true)
ON CONFLICT DO NOTHING;

CREATE POLICY "Monería imágenes públicas" ON storage.objects
  FOR SELECT USING (bucket_id = 'moneria-products');

CREATE POLICY "Monería service role sube" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'moneria-products');
