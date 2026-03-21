// ─── Tipos Monería Studio ─────────────────────────────────────────────────────

export interface MoneriaProduct {
  id: string
  name: string
  description: string | null
  price: number
  image_url: string
  second_image_url: string | null
  sizes: string[]
  is_active: boolean
  is_featured: boolean
  stock: number
  created_at: string
  updated_at: string
}

export interface MoneriaSectionConfig {
  id: number
  is_visible: boolean
  section_title: string
  section_subtitle: string
  section_description: string | null
  drop_label: string
}

// ─── SQL para ejecutar en Supabase (solo referencia, no se ejecuta aquí) ─────
/*
-- Tabla de productos Monería
CREATE TABLE IF NOT EXISTS moneria_products (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name             text NOT NULL,
  description      text,
  price            numeric(10,2) NOT NULL,
  image_url        text NOT NULL,
  second_image_url text,
  sizes            text[] DEFAULT '{}',
  is_active        boolean DEFAULT true,
  is_featured      boolean DEFAULT false,
  stock            integer DEFAULT 0,
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);
ALTER TABLE moneria_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lectura publica moneria_products"
  ON moneria_products FOR SELECT USING (true);

-- Tabla de configuración de sección
CREATE TABLE IF NOT EXISTS moneria_section_config (
  id                  integer PRIMARY KEY DEFAULT 1,
  is_visible          boolean DEFAULT true,
  section_title       text DEFAULT 'DROP',
  section_subtitle    text DEFAULT 'MONERÍA STUDIO',
  section_description text,
  drop_label          text DEFAULT 'DROP 001'
);
ALTER TABLE moneria_section_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lectura publica moneria_section_config"
  ON moneria_section_config FOR SELECT USING (true);

-- Insertar fila de config inicial
INSERT INTO moneria_section_config (id, is_visible, section_title, section_subtitle, section_description, drop_label)
VALUES (1, true, 'DROP', 'MONERÍA STUDIO', 'Diseño colombiano de autor. Piezas de edición limitada para quienes entienden que la moda es identidad.', 'DROP 001')
ON CONFLICT (id) DO NOTHING;

-- Bucket en Supabase Storage (crear en dashboard o ejecutar con service role):
-- INSERT INTO storage.buckets (id, name, public) VALUES ('moneria-products', 'moneria-products', true)
-- ON CONFLICT (id) DO NOTHING;
*/

// ─── Queries del servidor (usan createClient de @/lib/supabase/server) ────────
// Estas funciones se llaman desde Server Components.

export const DEFAULT_CONFIG: MoneriaSectionConfig = {
  id: 1,
  is_visible: true,
  section_title: 'DROP',
  section_subtitle: 'MONERÍA STUDIO',
  section_description:
    'Diseño colombiano de autor. Piezas de edición limitada para quienes entienden que la moda es identidad.',
  drop_label: 'DROP 001',
}
