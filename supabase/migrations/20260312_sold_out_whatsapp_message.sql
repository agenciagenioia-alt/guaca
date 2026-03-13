-- Mensaje predeterminado que se abre en WhatsApp cuando el cliente hace clic desde "producto agotado"
ALTER TABLE store_config
ADD COLUMN IF NOT EXISTS sold_out_whatsapp_message TEXT;

COMMENT ON COLUMN store_config.sold_out_whatsapp_message IS 'Mensaje que se pre-rellena al abrir WhatsApp desde la ficha de producto agotado. Usar {{product_name}} para el nombre del producto.';
