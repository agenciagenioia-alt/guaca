-- Agregar columna show_in_navbar a categories
ALTER TABLE categories ADD COLUMN IF NOT EXISTS show_in_navbar BOOLEAN DEFAULT true;

-- Actualizar todas las categorías existentes para mostrar en navbar
UPDATE categories SET show_in_navbar = true WHERE show_in_navbar IS NULL;
