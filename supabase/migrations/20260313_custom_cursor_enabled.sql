-- Habilitar/deshabilitar cursor personalizado desde admin
ALTER TABLE store_config
ADD COLUMN IF NOT EXISTS custom_cursor_enabled BOOLEAN DEFAULT true;
