-- ═══════════════════════════════════════════════════════════════
-- TABLA: brands (Marcas editables desde admin)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  slug TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE brands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos pueden ver marcas" ON brands
  FOR SELECT USING (true);

CREATE POLICY "Solo admins gestionan marcas" ON brands
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE uid = auth.uid() AND role = 'admin')
  );

-- Seed con marcas actuales
INSERT INTO brands (name, description, slug, display_order, is_active) VALUES
  ('ON RUNNING', 'Performance running & lifestyle. La zapatilla favorita de quienes se mueven diferente.', 'on-running', 0, true),
  ('NIKE · AIR FORCE 1', 'El clásico que nunca pasa de moda. Icónico desde 1982.', 'nike', 1, true),
  ('SAINT THEORY', 'Streetwear con actitud. Gráficos que cuentan historias.', 'saint-theory', 2, true),
  ('NDRG', 'Diseño urbano con identidad propia. Hecho para los que no siguen tendencias.', 'ndrg', 3, true),
  ('CLEMONT', 'Premium streetwear. Cada pieza diseñada al detalle.', 'clemont', 4, true),
  ('CARHARTT WIP', 'Del workwear a la calle. Durabilidad con estilo desde 1889.', 'carhartt', 5, true),
  ('CALVIN KLEIN', 'Minimalismo premium. El lujo en su forma más pura.', 'calvin-klein', 6, true),
  ('ADIDAS', 'Tres rayas. Una cultura. Icónico desde 1949.', 'adidas', 7, true);
