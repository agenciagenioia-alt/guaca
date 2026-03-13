-- Relacionar productos con marcas (brand_id)
ALTER TABLE products
ADD COLUMN IF NOT EXISTS brand_id UUID REFERENCES brands(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand_id);

