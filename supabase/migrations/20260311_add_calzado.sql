-- ═══════════════════════════════════════════════════════════════
-- Agregar categoría Calzado si no existe
-- ═══════════════════════════════════════════════════════════════
INSERT INTO categories (name, slug, image_url, display_order, is_active)
VALUES (
  'Calzado',
  'calzado',
  'https://images.unsplash.com/photo-1552346154-21d32810baa3?w=800&q=80',
  0,
  true
)
ON CONFLICT (slug) DO NOTHING;
