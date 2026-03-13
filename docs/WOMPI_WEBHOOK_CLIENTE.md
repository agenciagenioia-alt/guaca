# Configuración de Wompi — Pasos completos para el cliente

Guía paso a paso desde que abres la página hasta que quedan configuradas la redirección y el webhook.

---

## Qué URLs vas a poner

Sustituye **TU-DOMINIO.com** por la URL real de la tienda (ej. `guaca.vercel.app` o `laguaca.com`).

| Campo en Wompi | URL (al final del link) |
|----------------|--------------------------|
| **Redirección después del pago** | `https://TU-DOMINIO.com/confirmacion` |
| **Webhook / URL de eventos** | `https://TU-DOMINIO.com/api/wompi/webhook` |

- **`/confirmacion`** = página a la que va el cliente después de pagar.
- **`/api/wompi/webhook`** = donde Wompi avisa cuando el pago se confirma.

---

## Pasos completos (desde el inicio)

### 1. Abrir la página de Wompi
- Abre el navegador y entra a: **https://comercios.wompi.co**
- (Si Wompi te dio otro enlace de acceso, usa ese.)

### 2. Iniciar sesión
- Inicia sesión con el usuario y contraseña de tu cuenta de comercio en Wompi.
- Si no tienes cuenta, regístrate primero en Wompi como comercio.

### 3. Ir a la sección de configuración / integración
- En el menú lateral o superior del panel, busca una de estas opciones:
  - **“Developers”** o **“Desarrolladores”**
  - **“Integración”**
  - **“Configuración”** o **“Settings”**
  - **“Webhooks”** o **“Eventos”**
- Haz clic en esa sección para abrir la pantalla donde se configuran las URLs.

### 4. Poner la URL de redirección (después del pago)
- Busca el campo que diga **“URL de redirección”**, **“Redirect URL”**, **“URL después del pago”** o similar.
- En ese campo pega (cambiando TU-DOMINIO.com por tu dominio real):
  ```
  https://TU-DOMINIO.com/confirmacion
  ```
- Ejemplo si tu tienda es `laguaca.com`:
  ```
  https://laguaca.com/confirmacion
  ```

### 5. Poner la URL del webhook (eventos)
- Busca el campo **“URL de webhook”**, **“URL de eventos”**, **“Event URL”**, **“Notifica vía Webhook”** o similar.
- En ese campo pega (cambiando TU-DOMINIO.com por tu dominio real):
  ```
  https://TU-DOMINIO.com/api/wompi/webhook
  ```
- Ejemplo si tu tienda es `laguaca.com`:
  ```
  https://laguaca.com/api/wompi/webhook
  ```

### 6. Guardar
- Haz clic en **“Guardar”**, **“Save”** o **“Actualizar”** (según lo que muestre Wompi).
- Espera a que confirme que los cambios se guardaron.

### 7. (Opcional) Llave de eventos
- Si en esa misma pantalla Wompi muestra una **“Events key”**, **“Llave de eventos”** o **“Secreto de eventos”**, cópiala.
- Luego, en **Vercel** → tu proyecto → **Settings** → **Environment Variables**, crea una variable:
  - **Nombre:** `WOMPI_EVENTS_KEY`
  - **Valor:** pega la llave que copiaste.
- Guarda y haz **Redeploy** del proyecto en Vercel.

---

## Resumen rápido

1. Entras a **comercios.wompi.co** e inicias sesión.
2. Vas a **Developers / Integración / Configuración** (o Webhooks / Eventos).
3. En **redirección** pones: `https://TU-DOMINIO.com/confirmacion`
4. En **webhook / eventos** pones: `https://TU-DOMINIO.com/api/wompi/webhook`
5. Guardas en Wompi.
6. Si te dan Events key, la añades en Vercel como `WOMPI_EVENTS_KEY` y redeploy.
