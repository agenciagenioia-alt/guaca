-- Añadir columnas para la sección "Nuestra Historia" de la página Nosotros
ALTER TABLE store_config ADD COLUMN IF NOT EXISTS nosotros_image_url TEXT;
ALTER TABLE store_config ADD COLUMN IF NOT EXISTS nosotros_title TEXT DEFAULT 'Nacimos en Montería';
ALTER TABLE store_config ADD COLUMN IF NOT EXISTS nosotros_text_1 TEXT DEFAULT 'La Guaca nació con una misión clara: traer las mejores marcas de ropa y calzado del mundo a las calles de Colombia.';
ALTER TABLE store_config ADD COLUMN IF NOT EXISTS nosotros_text_2 TEXT DEFAULT 'Somos una multi-brand store especializada en streetwear, sneakers y moda urbana. Cada prenda que vendemos la seleccionamos pensando en estilo, calidad y autenticidad.';
ALTER TABLE store_config ADD COLUMN IF NOT EXISTS nosotros_text_3 TEXT DEFAULT 'No somos una tienda más. Somos un punto de encuentro para quienes entienden la ropa como expresión.';
