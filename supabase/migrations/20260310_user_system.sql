-- Paso 3: Sistema de usuarios — user_profiles, orders.user_id, orders.customer_email

-- Tabla user_profiles (datos para pre-llenar checkout)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  default_address TEXT,
  default_city TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own profile" ON user_profiles
  FOR ALL TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Permitir que la app cree perfil al registrar (service role o trigger)
-- Los usuarios solo ven/editan el suyo.

-- Añadir user_id y customer_email a orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_email TEXT;

-- Usuarios autenticados pueden ver sus propios pedidos
CREATE POLICY "Users read own orders" ON orders
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Usuarios pueden vincular un pedido a su cuenta (solo si aún no tiene user_id)
CREATE POLICY "Users can claim own order" ON orders
  FOR UPDATE TO authenticated
  USING (user_id IS NULL)
  WITH CHECK (user_id = auth.uid());

-- Índice para listar pedidos por usuario
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
