-- Materiales y cuidados por producto; Envíos y devoluciones global
ALTER TABLE products
ADD COLUMN IF NOT EXISTS materials_care TEXT;

ALTER TABLE store_config
ADD COLUMN IF NOT EXISTS shipping_returns_text TEXT;

COMMENT ON COLUMN products.materials_care IS 'Texto de materiales y cuidados mostrado en la ficha del producto.';
COMMENT ON COLUMN store_config.shipping_returns_text IS 'Texto global de envíos y devoluciones en la ficha de cada producto.';
