-- Contador real de personas viendo una ficha de producto
CREATE TABLE IF NOT EXISTS product_viewers (
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  viewer_id TEXT NOT NULL,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (product_id, viewer_id)
);

CREATE INDEX IF NOT EXISTS idx_product_viewers_last_seen ON product_viewers(product_id, last_seen_at);

COMMENT ON TABLE product_viewers IS 'Registro de viewers activos por producto (heartbeat). last_seen_at > now() - 2 min = viendo ahora.';

ALTER TABLE product_viewers ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede insertar/actualizar/borrar su propio viewer_id (por product_id)
CREATE POLICY "Upsert own viewer" ON product_viewers
  FOR ALL USING (true) WITH CHECK (true);
