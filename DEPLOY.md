# Subir La Guaca a GitHub y desplegar en Vercel

## 1. Subir el proyecto a GitHub

### Si aún no tienes repositorio en GitHub

1. Entra en [github.com](https://github.com), inicia sesión y haz clic en **"New repository"**.
2. Nombre del repo (ej.: `guaca` o `la-guaca`), visibilidad **Public**, no marques "Add a README".
3. Clic en **"Create repository"**.

### Desde la carpeta del proyecto (PowerShell o CMD)

Abre la terminal en la carpeta del proyecto (`guaca`) y ejecuta:

```bash
# Ver si ya hay un remoto
git remote -v

# Si NO hay remoto, añade el de tu repo (cambia TU_USUARIO y TU_REPO por los tuyos)
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git

# Añadir todos los archivos, hacer commit y subir
git add .
git status
git commit -m "La Guaca: tienda lista para producción"
git branch -M main
git push -u origin main
```

Si GitHub te pide usuario y contraseña, usa un **Personal Access Token** en lugar de la contraseña (Settings → Developer settings → Personal access tokens). O configura SSH si ya lo tienes.

---

## 2. Desplegar en Vercel

1. Entra en [vercel.com](https://vercel.com) e inicia sesión (con tu cuenta de GitHub).
2. Clic en **"Add New..."** → **"Project"**.
3. **Import** el repositorio de GitHub (guaca / la-guaca). Si no aparece, conecta primero tu cuenta de GitHub en Vercel.
4. **Configure Project**:  
   - Framework: **Next.js** (Vercel lo detecta).  
   - Root Directory: dejar por defecto.  
   - Build Command: `npm run build`.  
   - Output Directory: por defecto (`.next`).  
   No toques nada más y pasa al paso de variables de entorno.

### Variables de entorno en Vercel

En **Environment Variables** añade (para **Production**, y si quieres también **Preview**):

| Variable | Valor | Nota |
|----------|--------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` | URL del proyecto en Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` | Clave anónima (pestaña API de Supabase) |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` | Service role (misma pestaña; **no la compartas**) |
| `WOMPI_INTEGRITY_KEY` | (tu clave) | O configúrala en Admin → Wompi |
| `WOMPI_EVENTS_KEY` | (tu clave) | Para el webhook de pagos |
| `NEXT_PUBLIC_SITE_URL` | `https://tu-app.vercel.app` | La URL que te dé Vercel tras el primer deploy |
| `REVALIDATE_SECRET` | (opcional) | Una cadena aleatoria si usas revalidación por webhook |

Las llaves de Wompi también se pueden guardar en la base de datos desde **Admin → Wompi**; en ese caso las variables de Vercel sirven de respaldo.

5. Clic en **Deploy**.  
   Vercel construye el proyecto y te da una URL tipo `https://guaca-xxx.vercel.app`.

6. **Primera vez**: después del deploy, entra en **Settings → Environment Variables** y actualiza `NEXT_PUBLIC_SITE_URL` con la URL real de tu proyecto (ej. `https://tu-dominio.vercel.app`). Luego haz un **Redeploy** desde la pestaña Deployments.

---

## 3. Configurar el webhook de Wompi

Para que los pagos pasen a "confirmado" automáticamente:

1. En el panel de Wompi, configura el **Webhook** con esta URL:  
   `https://TU_URL_VERCEL.app/api/wompi/webhook`
2. Asegúrate de tener `WOMPI_EVENTS_KEY` en Vercel con el mismo valor que en Wompi.

---

## 4. Dominio propio (opcional)

En Vercel: **Settings → Domains** → añade tu dominio (ej. `laguaca.co`).  
En tu proveedor de dominio, añade los registros que Vercel te indique (CNAME o A).  
Luego actualiza `NEXT_PUBLIC_SITE_URL` en Vercel con esa URL y redeploy.

---

## Resumen rápido

1. **GitHub**: crear repo → `git remote add origin ...` → `git add .` → `git commit -m "..."` → `git push -u origin main`.
2. **Vercel**: Import repo → añadir variables de entorno → Deploy.
3. **Wompi**: Webhook apuntando a `https://tu-url.vercel.app/api/wompi/webhook`.
4. Las personas entran a la URL que te da Vercel (o a tu dominio si lo configuraste).
