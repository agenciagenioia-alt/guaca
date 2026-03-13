-- Añadir columnas de llaves Wompi a store_config (si no existen)
ALTER TABLE store_config ADD COLUMN IF NOT EXISTS wompi_public_key TEXT;
ALTER TABLE store_config ADD COLUMN IF NOT EXISTS wompi_integrity_key TEXT;
ALTER TABLE store_config ADD COLUMN IF NOT EXISTS wompi_events_key TEXT;
