-- ═══════════════════════════════════════════════════════════════
-- TABLA: gallery_images (Galería "La Guaca" editable desde admin)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS gallery_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  alt_text TEXT DEFAULT '',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos pueden ver galería" ON gallery_images
  FOR SELECT USING (true);

CREATE POLICY "Solo admins gestionan galería" ON gallery_images
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE uid = auth.uid() AND role = 'admin')
  );

-- Seed con imágenes iniciales de La Guaca
INSERT INTO gallery_images (image_url, alt_text, display_order, is_active) VALUES
  ('https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800&q=80', 'Interior La Guaca', 0, true),
  ('https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=800&q=80', 'Exhibición de productos', 1, true),
  ('https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80', 'Estilo urbano', 2, true),
  ('https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800&q=80', 'Sneakers collection', 3, true),
  ('https://images.unsplash.com/photo-1573855619003-97b4799dcd8b?w=800&q=80', 'Street culture', 4, true),
  ('https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80', 'Fashion lifestyle', 5, true);
