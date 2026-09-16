# Cómo poner MaquiFly en internet

Tus datos ya están configurados en el código. **No necesitas editar ningún
archivo.** Solo seguir estos pasos.

- WhatsApp de contacto: **+51 992 012 836**
- Correo de contacto: **nonad7940@gmail.com**

---

## Paso 1 — Crear cuenta en GitHub

Entra a **github.com** y crea una cuenta gratis con tu correo. Te pedirá
confirmar el correo con un código.

## Paso 2 — Crear el repositorio

Ya dentro de GitHub, arriba a la derecha haz clic en el **+** → **New
repository**.

- Repository name: `maquifly`
- Marca **Private**
- Haz clic en **Create repository**

## Paso 3 — Subir el código

En la página del repositorio vacío verás un enlace que dice **«uploading an
existing file»**. Haz clic ahí.

Ahora abre la carpeta `maquifly` que descomprimiste, **selecciona todo lo que
hay dentro** (no la carpeta, sino su contenido) y arrástralo a la ventana de
GitHub.

Espera a que terminen de subir todos los archivos —son unos 190, tarda un
par de minutos— y abajo haz clic en el botón verde **Commit changes**.

## Paso 4 — Crear cuenta en Vercel

Entra a **vercel.com** → **Sign Up** → elige **Continue with GitHub**. Usa la
misma cuenta que acabas de crear y autoriza el acceso.

## Paso 5 — Importar el proyecto

En Vercel: **Add New** → **Project**. Te aparecerá `maquifly` en la lista.
Haz clic en **Import**.

Vercel reconoce solo que es un proyecto Next.js. **No cambies nada** de la
configuración que te muestra.

## Paso 6 — Agregar una variable

Antes de darle al botón final, abre la sección **Environment Variables** y
agrega una sola:

| Name | Value |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `https://maquifly.vercel.app` |

(Si Vercel te asigna otra dirección, usa esa. Se corrige después cuando
tengas el dominio.)

## Paso 7 — Deploy

Haz clic en **Deploy** y espera dos o tres minutos.

**Listo: MaquiFly está en internet.** Vercel te da una dirección tipo
`maquifly.vercel.app` que ya puedes compartir por WhatsApp.

---

## Después: conectar maquifly.pe

1. Compra el dominio. Los `.pe` se registran en **punto.pe** o en
   registradores como GoDaddy o Namecheap.
2. En Vercel: tu proyecto → **Settings** → **Domains** → escribe
   `maquifly.pe` → **Add**.
3. Vercel te muestra unos registros DNS. Cópialos en el panel de control del
   sitio donde compraste el dominio.
4. Espera. Puede tardar desde minutos hasta unas horas.
5. Vuelve a **Settings → Environment Variables** y cambia
   `NEXT_PUBLIC_SITE_URL` a `https://maquifly.pe`. Luego, en la pestaña
   **Deployments**, vuelve a desplegar para que tome el cambio.

## Después: aparecer en Google

1. Entra a **Google Search Console** con tu cuenta de Google.
2. Agrega tu dominio como propiedad y sigue el proceso de verificación.
3. En la sección **Sitemaps**, envía: `https://maquifly.pe/sitemap.xml`

Eso es lo que hace que Google empiece a leer las páginas de categoría y las
landings de Piura. No es inmediato: toma semanas.

---

## Cosas importantes que debes saber

**El catálogo que se ve es de demostración.** Las 15 máquinas y los 4
propietarios están marcados como DEMO en toda la web, y el sitio avisa al
visitante de que no son reales. Cuando tengas propietarios reales, borra
estos dos archivos y vuelve a subir:

- `src/lib/data/demo-machines.ts`
- `src/lib/data/demo-owners.ts`

**Publicar aún no guarda nada.** El formulario funciona y valida, pero las
publicaciones quedan en el navegador de quien las hace, no en una base de
datos. Para que sea real hay que conectar Supabase: el esquema completo está
en `supabase/schema.sql` y las instrucciones en el `README.md`, sección 7.

**El plan gratuito de Vercel** está pensado para proyectos personales. Si
MaquiFly pasa a operar comercialmente, revisa sus condiciones: puede que
necesites el plan de pago. Alternativas: Netlify o Cloudflare Pages.

---

## Si algo se rompe

Los errores más comunes:

- **«No Next.js version detected»** en Vercel → subiste la carpeta `maquifly`
  en lugar de su contenido. En GitHub, el archivo `package.json` tiene que
  verse en la raíz del repositorio, no dentro de otra carpeta.
- **La subida a GitHub se queda a medias** → sube en dos tandas: primero las
  carpetas `src`, `public`, `scripts` y `supabase`, y luego los archivos
  sueltos de la raíz.
- **El sitio carga pero sin estilos** → casi siempre falta algún archivo de
  la carpeta `src`. Revisa que se hayan subido todos.
