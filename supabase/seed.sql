-- ═══════════════════════════════════════════════════════════════
-- LA GUACA — Datos iniciales (Seed)
-- Ejecutar DESPUÉS de schema.sql en el SQL Editor de Supabase
-- ═══════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────
-- STORE CONFIG
-- ───────────────────────────────────────────
INSERT INTO store_config (id, store_name, owner_whatsapp, store_email, store_description, instagram_url, tiktok_url, announcement_bar_text, announcement_bar_active)
VALUES (
  1,
  'La Guaca',
  '573001234567',
  'contacto@laguaca.co',
  'Somos La Guaca, una marca de streetwear nacida en Montería, Colombia. Creamos piezas únicas que fusionan la cultura urbana con el estilo caribeño. Cada prenda es diseñada para quienes se atreven a marcar tendencia.',
  'https://instagram.com/laguaca.co',
  'https://tiktok.com/@laguaca.co',
  '🔥 Envíos a toda Colombia | Pago seguro con Wompi',
  true
)
ON CONFLICT (id) DO NOTHING;

-- ───────────────────────────────────────────
-- CATEGORÍAS
-- ───────────────────────────────────────────
INSERT INTO categories (id, name, slug, image_url, display_order, is_active) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567801', 'Calzado', 'calzado', 'https://picsum.photos/seed/cat-calzado/600/600', 1, true),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567802', 'Ropa', 'ropa', 'https://picsum.photos/seed/cat-ropa/600/600', 2, true),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567803', 'Gorras', 'gorras', 'https://picsum.photos/seed/cat-gorras/600/600', 3, true),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567804', 'Accesorios', 'accesorios', 'https://picsum.photos/seed/cat-accesorios/600/600', 4, true);

-- ───────────────────────────────────────────
-- PRODUCTOS — CALZADO (Asignado a categoría a1b2c3d4-e5f6-7890-abcd-ef1234567801)
-- ───────────────────────────────────────────
INSERT INTO products (id, name, slug, description, price, original_price, category_id, is_featured, is_active, low_stock_alert, viewers_count) VALUES
  ('12345678-0000-0000-0000-000000000001', 'On Running Cloud', 'on-running-cloud', 'Sneakers ligeros con sistema patentado CloudTec. Ideales para el asfalto monteriano.', 650000, 850000, 'a1b2c3d4-e5f6-7890-abcd-ef1234567801', true, true, 5, 18),
  ('12345678-0000-0000-0000-000000000002', 'Air Force 1 Negro', 'air-force-1-negro', 'El clásico inmarcesible en full color negro. Leather premium.', 550000, NULL, 'a1b2c3d4-e5f6-7890-abcd-ef1234567801', false, true, 0, 7),
  ('12345678-0000-0000-0000-000000000003', 'Adidas Campus', 'adidas-campus', 'Upper en suede de alta gama con las icónicas 3 stripes.', 450000, NULL, 'a1b2c3d4-e5f6-7890-abcd-ef1234567801', true, true, 3, 24);

-- VARIANTES — CAMISETAS
INSERT INTO product_variants (product_id, size, stock, display_order) VALUES
  ('12345678-0000-0000-0000-000000000001', 'S', 8, 1),
  ('12345678-0000-0000-0000-000000000001', 'M', 12, 2),
  ('12345678-0000-0000-0000-000000000001', 'L', 4, 3),
  ('12345678-0000-0000-0000-000000000001', 'XL', 2, 4),
  ('12345678-0000-0000-0000-000000000002', 'S', 6, 1),
  ('12345678-0000-0000-0000-000000000002', 'M', 10, 2),
  ('12345678-0000-0000-0000-000000000002', 'L', 8, 3),
  ('12345678-0000-0000-0000-000000000002', 'XL', 5, 4),
  ('12345678-0000-0000-0000-000000000003', 'M', 2, 1),
  ('12345678-0000-0000-0000-000000000003', 'L', 1, 2),
  ('12345678-0000-0000-0000-000000000003', 'XL', 0, 3);

-- IMÁGENES — CALZADO
INSERT INTO product_images (product_id, image_url, is_primary, display_order) VALUES
  ('12345678-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1552346154-21d32810baa3?w=800&q=80', true, 0),
  ('12345678-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800&q=80', false, 1),
  ('12345678-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&q=80', true, 0),
  ('12345678-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80', false, 1),
  ('12345678-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=800&q=80', true, 0),
  ('12345678-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80', false, 1);

-- ───────────────────────────────────────────
-- PRODUCTOS — ROPA (Camisetas/Pantalones)
-- ───────────────────────────────────────────
INSERT INTO products (id, name, slug, description, price, original_price, category_id, is_featured, is_active, low_stock_alert, viewers_count) VALUES
  ('12345678-0000-0000-0000-000000000004', 'Camiseta NDRG', 'camiseta-ndrg', 'Camiseta oversize NDRG edición especial.', 120000, 150000, 'a1b2c3d4-e5f6-7890-abcd-ef1234567802', true, true, 4, 31),
  ('12345678-0000-0000-0000-000000000005', 'Hoodie Saint Theory', 'hoodie-saint-theory', 'Hoodie premium con capucha reforzada. Perfecto del gym a la calle.', 95000, NULL, 'a1b2c3d4-e5f6-7890-abcd-ef1234567802', false, true, 0, 12),
  ('12345678-0000-0000-0000-000000000006', 'Cargo Pants Clemont', 'cargo-pants-clemont', 'Pantalón Cargo ancho Clemont. Tela ripstop alta resistencia.', 78000, NULL, 'a1b2c3d4-e5f6-7890-abcd-ef1234567802', false, true, 0, 9);

-- VARIANTES — PANTALONES
INSERT INTO product_variants (product_id, size, stock, display_order) VALUES
  ('12345678-0000-0000-0000-000000000004', 'S', 3, 1),
  ('12345678-0000-0000-0000-000000000004', 'M', 6, 2),
  ('12345678-0000-0000-0000-000000000004', 'L', 4, 3),
  ('12345678-0000-0000-0000-000000000004', 'XL', 2, 4),
  ('12345678-0000-0000-0000-000000000005', 'M', 10, 1),
  ('12345678-0000-0000-0000-000000000005', 'L', 8, 2),
  ('12345678-0000-0000-0000-000000000005', 'XL', 6, 3),
  ('12345678-0000-0000-0000-000000000006', 'S', 5, 1),
  ('12345678-0000-0000-0000-000000000006', 'M', 7, 2),
  ('12345678-0000-0000-0000-000000000006', 'L', 4, 3);

-- IMÁGENES — PANTALONES
INSERT INTO product_images (product_id, image_url, is_primary, display_order) VALUES
  ('12345678-0000-0000-0000-000000000004', 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&q=80', true, 0),
  ('12345678-0000-0000-0000-000000000004', 'https://images.unsplash.com/photo-1523398002811-999aa8d9511e?w=800&q=80', false, 1),
  ('12345678-0000-0000-0000-000000000005', 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=800&q=80', true, 0),
  ('12345678-0000-0000-0000-000000000005', 'https://images.unsplash.com/photo-1578681994506-b8f463449011?w=800&q=80', false, 1),
  ('12345678-0000-0000-0000-000000000006', 'https://images.unsplash.com/photo-1559582798-978fd209ce25?w=800&q=80', true, 0),
  ('12345678-0000-0000-0000-000000000006', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80', false, 1);

-- ───────────────────────────────────────────
-- PRODUCTOS — GORRAS
-- ───────────────────────────────────────────
INSERT INTO products (id, name, slug, description, price, original_price, category_id, is_featured, is_active, low_stock_alert, viewers_count) VALUES
  ('12345678-0000-0000-0000-000000000007', 'Gorra La Guaca', 'gorra-la-guaca', 'Nuestra gorra icónica tipo Snapback con el logo incrustado en relieve 3D.', 135000, NULL, 'a1b2c3d4-e5f6-7890-abcd-ef1234567803', true, true, 3, 42),
  ('12345678-0000-0000-0000-000000000008', 'Gorra Carhartt', 'gorra-carhartt', 'Gorra utility tipo worker de alto nivel y lona pesada.', 165000, 180000, 'a1b2c3d4-e5f6-7890-abcd-ef1234567803', true, true, 2, 56),
  ('12345678-0000-0000-0000-000000000009', 'Bucket Hat', 'bucket-hat-safari', 'Sombrero bucket protector 360 estilo safari street.', 115000, NULL, 'a1b2c3d4-e5f6-7890-abcd-ef1234567803', false, true, 0, 15);

-- VARIANTES — HOODIES
INSERT INTO product_variants (product_id, size, stock, display_order) VALUES
  ('12345678-0000-0000-0000-000000000007', 'M', 5, 1),
  ('12345678-0000-0000-0000-000000000007', 'L', 3, 2),
  ('12345678-0000-0000-0000-000000000007', 'XL', 2, 3),
  ('12345678-0000-0000-0000-000000000008', 'S', 1, 1),
  ('12345678-0000-0000-0000-000000000008', 'M', 2, 2),
  ('12345678-0000-0000-0000-000000000008', 'L', 0, 3),
  ('12345678-0000-0000-0000-000000000009', 'S', 6, 1),
  ('12345678-0000-0000-0000-000000000009', 'M', 8, 2),
  ('12345678-0000-0000-0000-000000000009', 'L', 4, 3);

-- IMÁGENES — HOODIES
INSERT INTO product_images (product_id, image_url, is_primary, display_order) VALUES
  ('12345678-0000-0000-0000-000000000007', 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&q=80', true, 0),
  ('12345678-0000-0000-0000-000000000007', 'https://images.unsplash.com/photo-1523779917675-b6ed3a42a561?w=800&q=80', false, 1),
  ('12345678-0000-0000-0000-000000000008', 'https://images.unsplash.com/photo-1556306535-0f09a536f01f?w=800&q=80', true, 0),
  ('12345678-0000-0000-0000-000000000008', 'https://images.unsplash.com/photo-1574180045814-68f716d612e9?w=800&q=80', false, 1),
  ('12345678-0000-0000-0000-000000000009', 'https://images.unsplash.com/photo-1614252339474-1188fb8fa1dd?w=800&q=80', true, 0),
  ('12345678-0000-0000-0000-000000000009', 'https://images.unsplash.com/photo-1614252262579-055ea84c4784?w=800&q=80', false, 1);

-- ───────────────────────────────────────────
-- PRODUCTOS — ACCESORIOS
-- ───────────────────────────────────────────
INSERT INTO products (id, name, slug, description, price, original_price, category_id, is_featured, is_active, low_stock_alert, viewers_count) VALUES
  ('12345678-0000-0000-0000-000000000010', 'Gorra Snapback Guaca', 'gorra-snapback-guaca', 'Gorra snapback estructurada con logo bordado 3D. Broche trasero ajustable. Un clásico que no pasa de moda.', 45000, NULL, 'a1b2c3d4-e5f6-7890-abcd-ef1234567804', false, true, 0, 8),
  ('12345678-0000-0000-0000-000000000011', 'Riñonera Tactical Negra', 'rinonera-tactical-negra', 'Riñonera de nylon balístico con compartimentos múltiples y hebilla de liberación rápida. Street utility al máximo.', 58000, 72000, 'a1b2c3d4-e5f6-7890-abcd-ef1234567804', false, true, 5, 19),
  ('12345678-0000-0000-0000-000000000012', 'Medias Pack x3 Guaca', 'medias-pack-x3-guaca', 'Pack de 3 pares de medias crew con diseños exclusivos La Guaca. Algodón peinado con refuerzo en talón y punta.', 35000, NULL, 'a1b2c3d4-e5f6-7890-abcd-ef1234567804', false, true, 0, 5);

-- VARIANTES — ACCESORIOS  
INSERT INTO product_variants (product_id, size, stock, display_order) VALUES
  ('12345678-0000-0000-0000-000000000010', 'ÚNICO', 15, 1),
  ('12345678-0000-0000-0000-000000000011', 'ÚNICO', 4, 1),
  ('12345678-0000-0000-0000-000000000012', 'ÚNICO', 20, 1);

-- IMÁGENES — ACCESORIOS
INSERT INTO product_images (product_id, image_url, is_primary, display_order) VALUES
  ('12345678-0000-0000-0000-000000000010', 'https://images.unsplash.com/photo-1557161188-724e531ffeb2?w=800&q=80', true, 0),
  ('12345678-0000-0000-0000-000000000010', 'https://images.unsplash.com/photo-1596458005374-2c7deca27dc0?w=800&q=80', false, 1),
  ('12345678-0000-0000-0000-000000000011', 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80', true, 0),
  ('12345678-0000-0000-0000-000000000011', 'https://images.unsplash.com/photo-1547949003-9792a18a2601?w=800&q=80', false, 1),
  ('12345678-0000-0000-0000-000000000012', 'https://images.unsplash.com/photo-1582966772680-860e372bb558?w=800&q=80', true, 0),
  ('12345678-0000-0000-0000-000000000012', 'https://images.unsplash.com/photo-1587563871167-1e52f199da20?w=800&q=80', false, 1);
