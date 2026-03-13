# Cómo configurar Wompi en el panel de administración

Sigue estos pasos para que los pagos con Wompi funcionen en tu tienda La Guaca.

---

## 1. Entrar al panel de administración de La Guaca

1. Abre tu navegador y ve a la página de administración de tu tienda (ejemplo: `https://tudominio.com/admin` o `https://tudominio.com/admin/login`).
2. Inicia sesión con tu usuario y contraseña de administrador.

---

## 2. Ir a la sección Wompi

1. En el menú lateral del admin, haz clic en **Wompi** (ícono de tarjeta de crédito).
2. Se abrirá la página de configuración de pagos.

---

## 3. Obtener las llaves en el dashboard de Wompi

Necesitas tres llaves. Todas se consiguen en el panel de Wompi, no en La Guaca.

### 3.1 Entrar al dashboard de Wompi

1. Entra a: **https://comercios.wompi.co/**
2. Inicia sesión con la cuenta de comercio de Wompi (la que usas para recibir los pagos).
3. Si aún no tienes cuenta, regístrate como comercio en Wompi y completa el proceso de verificación.

### 3.2 Dónde están las llaves

1. En el menú del dashboard de Wompi, entra a **Desarrolladores** (o **Developers**).
2. Busca la sección **“Secretos para integración técnica”** o **“Secrets for technical integration”**.
3. Ahí verás varias llaves. Necesitas estas tres:

| Lo que pide el admin de La Guaca | Nombre en Wompi (aprox.) | Cómo se ve |
|----------------------------------|---------------------------|------------|
| **Llave pública** | Llave pública de comercio / Public key | Empieza por `pub_prod_` (producción) o `pub_test_` (pruebas) |
| **Llave de integridad** | Secreto de integridad / Integrity secret | Empieza por `prod_integrity_` o `test_integrity_` |
| **Llave de eventos** | Secreto de eventos / Events secret | Para webhooks (opcional al inicio) |

4. **Producción vs pruebas**
   - **Pruebas:** usan `pub_test_`, `test_integrity_`, etc. No mueven dinero real.
   - **Producción:** usan `pub_prod_`, `prod_integrity_`, etc. Son los pagos reales. Úsalas cuando la tienda esté lista para vender.

5. En cada llave suele haber un botón **“Copiar”** o un ícono de copiar. Cópialas y tenlas listas para pegarlas en La Guaca.

---

## 4. Llenar el formulario en el admin de La Guaca

Vuelve a la página **Wompi** del admin de La Guaca y completa:

### 4.1 Llave pública

- Pega la llave que empieza por `pub_prod_` o `pub_test_`.
- Ejemplo: `pub_prod_xxxxxxxxxxxxxxxxxxxxxxxx`

### 4.2 Llave de integridad

- Pega el “Secreto de integridad” de Wompi.
- Ejemplo: `prod_integrity_xxxxxxxxxxxxxxxxxxxxxxxx`
- **Importante:** no la compartas por correo o redes; solo úsala en este formulario.

### 4.3 Llave de eventos (para webhooks)

- Pega el “Secreto de eventos” de Wompi (si quieres que Wompi avise a tu tienda cuando un pago se confirme).
- Si no la tienes a mano, puedes dejarla en blanco al principio y configurarla después.

### 4.4 Guardar

- Haz clic en **“Guardar configuración”**.
- Si todo está bien, el estado debería cambiar a **CONECTADO**.

---

## 5. URLs que muestra el formulario (solo lectura)

En la misma página verás dos URLs que la tienda genera sola:

- **URL de redirección:** a dónde Wompi envía al cliente después de pagar (normalmente tu página de “Pedido confirmado”).
- **URL del webhook:** la que debes configurar en Wompi para que avise a la tienda cuando un pago se apruebe.

Solo tienes que **copiarlas** si Wompi te pide configurar la URL de redirección o la URL del webhook en su dashboard. No hace falta inventar otras URLs.

---

## 6. Probar que funciona

1. En el admin de La Guaca, en la sección Wompi, usa el botón **“Abrir tienda para pago de prueba”** (o ve a tu tienda en otra pestaña).
2. Añade un producto al carrito y llega hasta el checkout.
3. Completa tus datos y haz clic en **“PAGAR CON WOMPI”**.
4. Debería abrirse el popup o la pantalla de pago de Wompi.
5. Si usas llaves de **prueba** (`pub_test_`), en Wompi suelen indicar cómo hacer un pago de prueba (por ejemplo con una tarjeta de prueba). Si usas llaves de **producción**, el pago será real.

---

## Resumen rápido

1. Entra a **comercios.wompi.co** y inicia sesión.
2. Ve a **Desarrolladores** → **Secretos para integración técnica**.
3. Copia **Llave pública**, **Llave de integridad** y (opcional) **Llave de eventos**.
4. En tu tienda, entra al **admin** → **Wompi**.
5. Pega cada llave en su campo y haz clic en **Guardar configuración**.
6. Prueba un pago desde la tienda para confirmar que todo funciona.

Si algo no aparece en Wompi o no puedes completar el registro de comercio, hay que contactar al soporte de Wompi directamente.
