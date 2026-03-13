# La Guaca E-commerce

Plataforma de comercio electrónico para streetwear, diseñada con un enfoque absoluto en conversión, tráfico móvil desde Meta Ads y UX premium. Desarrollada en **Next.js 14**, **Supabase** y **Tailwind CSS**.

## ✨ Características Principales

*   **⚡ Rendimiento Extremo:** Next.js App Router, componentes de servidor por defecto, carga de imágenes priorizada.
*   **📱 Mobile-First Real:** Interfaces optimizadas para pulgares y atención corta (3-8 segundos).
*   **🎨 Diseño Premium:** Tema oscuro profundo (`#0A0A0A`), tipografía de impacto (Space Grotesk, Bebas Neue), y detalles en oro (`#FFD700`).
*   **🛒 Checkout Ultra-ágil:** Sin registro forzado. Tres pasos simples. Integrado directamente con Wompi para pagos linkados en Colombia.
*   **💬 Notificaciones Proactivas:** Confirmación de pedidos directamente generados en formato WhatsApp para un contacto humano y cercano.
*   **🎛️ Panel Admin Completo:** Gestión total de catálogo, pedidos, banners y configuración global. Pensado para un dueño de negocio sin conocimientos técnicos.
*   **🔒 Seguridad:** Autenticación por sesión asilada, Row Level Security (RLS) total en BD de Supabase.

## 🚀 Guía Rápida de Instalación

### 1. Clonar e Instalar Independencias
\`\`\`bash
git clone <tu-repositorio>
cd guaca
npm install
\`\`\`

### 2. Configurar Base de Datos (Supabase)
1. Ve a [Supabase](https://supabase.com/) y crea un nuevo proyecto guiado.
2. Abre el SQL Editor en tu dashboard de Supabase.
3. Copia y pega el contenido del archivo `supabase/schema.sql` y ejecútalo. Esto creará todas las tablas, buckets (para imágenes), políticas y disparadores automáticos.
4. (Opcional) Copia y pega el contenido de `supabase/seed.sql` para tener datos de prueba (productos, configuraciones base). **Importante:** Recuerda subir imágenes de prueba a tu bucket si usas el seed o cambiar las URLs generadas.

### 3. Configurar Variables de Entorno
Crea un archivo `.env.local` en la raíz copiando el ejemplo:
\`\`\`bash
cp .env.example .env.local
\`\`\`
Rellena tus credenciales (las encuentras en "Project Settings" > "API" en Supabase):
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
\`\`\`

### 4. Crear Credenciales del Administrador
Abre el SQL Editor en Supabase y ejecuta este script rápido para dar de alta el correo que usará el dueño de la tienda **(reemplaza con tu correo)**:
\`\`\`sql
-- 1. Primero, crea manualmente un usuario en el panel "Authentication" > "Users" de Supabase con el correo y clave que prefieras.
-- 2. Una vez creado, copia su UUID o directamente inserta su correo en la tabla auth_roles así:

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin' FROM auth.users WHERE email = 'correo.del.admin@ejemplo.com';
\`\`\`

### 5. Iniciar Servidor de Desarrollo
\`\`\`bash
npm run dev
\`\`\`
La tienda estará en `http://localhost:3000` y el acceso de administrador en `http://localhost:3000/admin/login`

---

## 💳 Configuración de Wompi (Link de Pagos)

Esta tienda **no maneja la pasarela API compleja de Wompi intencionalmente**. Para facilitar mantenimiento, seguridad y reducir fricción técnica al dueño usamos la **solución de Links de Pago de Wompi**.

1. Ingresa a tu Dashboard de Wompi Comercio.
2. Crea un **Link de Cobro**.
3. Configúralo así:
    - **Nombre del producto:** (Déjalo abierto / Editable por el usuario — El link mágico permite definir el precio externamente)
    - **Precio:** (Déjalo abierto) 
    - Guarda y copia el Link de tu comercio (ej. `https://checkout.wompi.co/l/VPOS_XXXXX`)
4. Entra en tu **Panel de Administrador de La Guaca** > Configuración.
5. Pega ese enlace en la sección "Mágico de Wompi".
6. ¡Listo! Automáticamente, la tienda enviará a cada compra la referencia (`?reference=LG-XXXX-XXXX`) de cada pedido.

## 🤝 Soporte y Funcionalidades Adicionales

Cualquier cambio de diseño complejo adicional u otra pasarela de pago (PayU, MercadoPago full checkout) que requiera integración de backend debe validarse adaptando la ruta actual del checkout. El código actual usa Server Actions híbrido y Zustand state en el cliente para el carrito total.
