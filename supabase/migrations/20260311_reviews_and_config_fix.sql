-- ═══════════════════════════════════════════════════════════════
-- TABLA: reviews (Reseñas de clientes editables desde admin)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  review_text TEXT NOT NULL,
  rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos pueden ver reseñas" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "Solo admins gestionan reseñas" ON reviews
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE uid = auth.uid() AND role = 'admin')
  );

-- Seed con reseñas iniciales
INSERT INTO reviews (customer_name, review_text, rating, display_order, is_active) VALUES
  ('Carlos M.', 'Compré unas On Running y llegaron perfectas. Calidad increíble y envío rapidísimo a Barranquilla.', 5, 0, true),
  ('Valeria R.', 'La mejor tienda de streetwear en Colombia. Las camisetas Saint Theory son una locura.', 5, 1, true),
  ('Sebastián G.', 'Llevaba tiempo buscando las Air Force 1 negras. Las encontré aquí a buen precio y 100% originales.', 5, 2, true),
  ('Andrea L.', 'Me encantó el empaque y la rapidez del envío. Pedí un hoodie y llegó en 2 días a Bogotá. Vuelvo seguro.', 5, 3, true),
  ('Miguel Á.', 'El Cargo de Clemont es brutal. Calidad premium y el fit queda perfecto. 10/10 recomendado.', 5, 4, true),
  ('Laura P.', 'Compré para mi novio unos tenis Adidas Campus y quedó feliz. Originales y a mejor precio que en tiendas.', 5, 5, true),
  ('David R.', 'Excelente atención por WhatsApp. Me ayudaron a elegir la talla perfecta. Muy profesionales.', 5, 6, true),
  ('Camila S.', 'Ya es la tercera vez que compro. Siempre llega todo perfecto. La Guaca es la mejor de Colombia.', 5, 7, true);

-- ═══════════════════════════════════════════════════════════════
-- FIX RLS: Permitir a admins actualizar store_config
-- ═══════════════════════════════════════════════════════════════
-- Primero verificamos si ya existe la policy, si no la creamos
DO $$
BEGIN
  -- Drop existing policies on store_config if they exist
  DROP POLICY IF EXISTS "Todos pueden leer config" ON store_config;
  DROP POLICY IF EXISTS "Solo admins actualizan config" ON store_config;
  
  -- Recrear policies limpias
  CREATE POLICY "Todos pueden leer config" ON store_config
    FOR SELECT USING (true);
  
  CREATE POLICY "Solo admins actualizan config" ON store_config
    FOR UPDATE USING (
      EXISTS (SELECT 1 FROM user_roles WHERE uid = auth.uid() AND role = 'admin')
    );
END $$;
