-- Completa tu outfit: activar/desactivar y productos configurables desde Admin
-- Ejecutar en Supabase: SQL Editor → pegar y ejecutar
ALTER TABLE store_config ADD COLUMN IF NOT EXISTS outfit_section_enabled BOOLEAN DEFAULT false;
ALTER TABLE store_config ADD COLUMN IF NOT EXISTS outfit_product_ids TEXT;

COMMENT ON COLUMN store_config.outfit_section_enabled IS 'Si true, se muestra la sección "Completa tu outfit" en el carrito';
COMMENT ON COLUMN store_config.outfit_product_ids IS 'JSON array de UUIDs de productos, ej: ["uuid1","uuid2"]';
