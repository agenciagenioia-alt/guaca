-- Mensaje configurable cuando un producto está agotado (todas las tallas vendidas)
ALTER TABLE store_config
ADD COLUMN IF NOT EXISTS sold_out_message TEXT;

COMMENT ON COLUMN store_config.sold_out_message IS 'Mensaje mostrado en ficha de producto cuando no hay stock. Incluir texto tipo "Escríbenos por WhatsApp..." si se desea.';
