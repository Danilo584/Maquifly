# MaquiFly

**Conectamos maquinaria con proyectos.**

Marketplace de alquiler de maquinaria y equipos en Perú. Conecta a propietarios
de maquinaria con personas y empresas que la necesitan. Arranca en **Piura** y
está construido para escalar a Chiclayo, Trujillo, Tumbes, Cajamarca y Lima sin
rehacer nada.

---

## 1. Poner el proyecto en marcha

```bash
npm install
cp .env.example .env.local     # ajusta NEXT_PUBLIC_SITE_URL y el WhatsApp de contacto
npm run dev                    # http://localhost:3000
```

Otros comandos:

| Comando | Qué hace |
| --- | --- |
| `npm run build` | Compila para producción |
| `npm start` | Sirve la build |
| `npm run typecheck` | Verifica tipos con TypeScript |
| `npm run export` | Genera una versión estática en `out/` |
| `node scripts/generate-placeholders.mjs` | Regenera las ilustraciones de categoría |

Requiere Node 20 o superior.

---

## 2. Arquitectura y decisiones técnicas

**Stack:** Next.js 15 (App Router) · TypeScript estricto · Tailwind CSS 4 ·
Zod · fuentes autoalojadas (sin peticiones a Google Fonts).

Las decisiones que importan:

### La capa de datos está detrás de un contrato

Ningún componente lee los datos directamente. Todo pasa por
`MaquiflyRepository` (`src/lib/repository/types.ts`). Hoy lo implementa
`demoRepository`, que lee archivos locales. Mañana lo implementará Supabase.

Consecuencia práctica: conectar la base de datos real es escribir una segunda
implementación del mismo contrato y cambiar una variable de entorno. Las
páginas, los filtros y los componentes **no se tocan**. En
`src/lib/repository/supabase-repository.example.ts` está esa implementación ya
escrita como referencia.

### La URL es el estado del buscador

Los filtros no viven en un gestor de estado: viven en la query string
(`?categoria=excavadoras&ciudad=piura&operador=1`). Así los resultados se
pueden compartir por WhatsApp, el botón «atrás» funciona y no hace falta
sincronizar dos fuentes de verdad.

### Qué se renderiza en el servidor y qué en el cliente

| Página | Dónde | Por qué |
| --- | --- | --- |
| Home, categorías, landings locales, fichas de máquina, perfiles, blog | Servidor (estático) | Son las páginas indexables: necesitan HTML completo |
| `/maquinaria` (resultados con filtros) | Cliente | Los filtros se aplican al instante; además lleva `noindex` a propósito |

`/maquinaria` está marcada `noindex` deliberadamente: cientos de combinaciones
de filtros generarían URLs casi idénticas compitiendo entre sí en Google. El
tráfico orgánico entra por las páginas de categoría y por las landings
locales, que sí tienen contenido propio.

### La reputación se calcula, no se declara

En `supabase/schema.sql`, `rating` y `review_count` los escribe un *trigger* a
partir de las reseñas reales. La aplicación no puede inflarlos ni por error ni
a propósito.

---

## 3. Estructura de carpetas

```
maquifly/
├─ public/
│  ├─ placeholders/          Ilustraciones vectoriales por categoría (generadas)
│  ├─ og-default.png/.svg    Imagen para redes sociales
├─ scripts/
│  └─ generate-placeholders.mjs
├─ supabase/
│  └─ schema.sql             Esquema completo: tablas, índices, triggers y RLS
└─ src/
   ├─ app/
   │  ├─ layout.tsx              Layout raíz, metadata global, JSON-LD de marca
   │  ├─ page.tsx                Home
   │  ├─ [landing]/              Landings SEO locales (/alquiler-…-piura)
   │  ├─ maquinaria/             Buscador + páginas de categoría
   │  ├─ maquina/[slug]/         Ficha individual
   │  ├─ propietario/[slug]/     Perfil público de propietario
   │  ├─ publicar/               Formulario de publicación
   │  ├─ blog/                   Índice y artículos
   │  ├─ admin/                  Esqueleto del panel de moderación
   │  ├─ sitemap.ts robots.ts manifest.ts icon.svg
   │  └─ (institucionales: como-funciona, propietarios, empresas,
   │      nosotros, contacto, ingresar, terminos, privacidad)
   ├─ components/
   │  ├─ brand/       Logo y logomark
   │  ├─ ui/          Botón, badge, campos, callout, migas, estados vacíos
   │  ├─ layout/      Navbar y footer
   │  ├─ home/        Hero y «cómo funciona»
   │  ├─ search/      Buscador, filtros, resultados y paginación
   │  ├─ machine/     Tarjeta, galería, WhatsApp, solicitud, reporte
   │  ├─ reviews/     Estrellas, listado y formulario de reseñas
   │  ├─ owner/       Tarjeta de propietario y verificación
   │  ├─ category/    Rejilla de categorías
   │  ├─ publish/     Formulario multipaso
   │  ├─ admin/ contact/ legal/ common/ seo/
   └─ lib/
      ├─ types.ts             Modelo de dominio (fuente de verdad)
      ├─ site.ts              Configuración de marca y contacto
      ├─ seo.ts               Metadata y datos estructurados
      ├─ format.ts            Precios, fechas y etiquetas en español
      ├─ whatsapp.ts          Construcción de mensajes y enlaces
      ├─ search-params.ts     URL ⇄ filtros
      ├─ analytics.ts         Capa única de eventos
      ├─ local-store.ts       Almacenamiento temporal del MVP
      ├─ validation/listing.ts  Esquema Zod de publicaciones
      ├─ data/                Categorías, ubicaciones, blog, FAQ, landings, DEMO
      └─ repository/          Contrato + implementación DEMO + ejemplo Supabase
```

---

## 4. Modelos de datos

Definidos en `src/lib/types.ts` y replicados columna por columna en
`supabase/schema.sql`.

- **User** — id, name, email, phone, role, locationId, verificationStatus, createdAt
- **OwnerProfile** — businessName, slug, description, locationId, area, whatsapp,
  rating, reviewCount, machineCount, verificationStatus, memberSince
- **Machine** — reference, slug, ownerId, categoryId, name, brand, model, year,
  description, locationId, area, price, currency, pricingUnit, minimumRental,
  operatorAvailable, transportAvailable, fuel, availability, specs, workHours,
  images, status, rating, reviewCount, createdAt, updatedAt
- **Review** — machineId, ownerId, reviewerId, rating, comment, criteria
  (estado / puntualidad / comunicación / cumplimiento), verifiedRental, ownerReply
- **Category** — name, singular, slug, family, descripciones, commonUses, icon
- **Location** — name, slug, region, districts, active, lat, lng
- **Report** — machineId, reason, comment, status

Ampliar el modelo (reservas, pagos, contratos) es añadir tablas que apuntan a
`machines` y `profiles`; nada de lo existente cambia de forma.

---

## 5. Las reglas que el producto se impone

Estas reglas están implementadas en código, no son declaraciones de intenciones:

1. **Cero reseñas inventadas.** `src/lib/data/reviews.ts` está vacío a
   propósito. `RatingStars` no dibuja ni una estrella cuando no hay reseñas
   reales: devuelve texto neutro. Una fila de estrellas vacías se lee como una
   mala calificación; una de relleno es mentira.
2. **Todo lo ficticio se marca.** Cada registro DEMO lleva `isDemo: true`, un
   distintivo naranja `DEMO` y un aviso a ancho completo. Las publicaciones DEMO
   además llevan `noindex` y quedan fuera del sitemap.
3. **WhatsApp no finge.** En una publicación DEMO el botón no abre un chat hacia
   un número inventado: muestra el mensaje que se enviaría y explica por qué.
4. **Verificación honesta.** «Propietario registrado» significa solo que la
   cuenta existe, y se muestra en gris. El escudo verde aparece únicamente con
   verificación real.
5. **Sin cifras infladas.** La home muestra el conteo real del catálogo, con la
   etiqueta DEMO cuando corresponde. No hay «miles de máquinas» ni «la
   plataforma #1 del Perú».
6. **Sin precios inventados.** Si el propietario no fija tarifa, la ficha dice
   «Consultar precio». El blog explica cómo se forma un precio en lugar de
   publicar tarifas de referencia ficticias.
7. **Sin fotos de catálogo.** Mientras el propietario no suba fotos propias, se
   muestra una ilustración vectorial marcada como referencial.
8. **Sin perfiles sociales falsos.** El footer reserva el espacio y dice que aún
   no existen, en vez de enlazar cuentas inexistentes.
9. **Sin login de mentira.** `/ingresar` no muestra un formulario de contraseña
   que no autentica: sería invitar a escribir contraseñas reales en un campo que
   no las protege.

---

## 6. Qué funciona hoy y qué necesita backend

### Funciona de verdad, de extremo a extremo

- Navegación completa, responsive y accesible por teclado.
- Buscador con texto libre, filtros combinables (categoría, ciudad, zona,
  operador, transporte, disponibilidad, con precio) y seis criterios de orden.
- Estado del buscador en la URL, paginación y estados vacíos.
- Páginas de categoría y landings locales generadas estáticamente.
- Fichas de maquinaria con galería, especificaciones, condiciones y propietario.
- Perfiles públicos de propietario con sus publicaciones.
- Generación del mensaje de WhatsApp con nombre de máquina, ubicación, código y
  enlace (en publicaciones reales abre el chat; en DEMO muestra el mensaje).
- Formulario de publicación de seis pasos con validación Zod paso a paso,
  autoguardado de borrador, selección y previsualización de fotografías con
  límites reales de tipo y tamaño, y vista previa con el componente real de
  tarjeta.
- Formularios de reseña, reporte de publicación, solicitud de información y
  contacto: todos validan y guardan.
- Panel de administración con publicaciones, propietarios, reportes y mensajes.
- SEO técnico: metadata por página, canonical, Open Graph, Twitter Card,
  JSON-LD (Organization, WebSite, Product, LocalBusiness, BreadcrumbList,
  FAQPage, Article), `sitemap.xml`, `robots.txt` y manifiesto web.
- Blog con seis artículos completos.

### Requiere backend o un servicio externo

| Función | Qué falta | Dónde está preparado |
| --- | --- | --- |
| Persistencia real | Ejecutar `supabase/schema.sql` e implementar el repositorio | `supabase/schema.sql`, `supabase-repository.example.ts` |
| Cuentas y sesión | Supabase Auth (verificación por teléfono) | `/ingresar`, políticas RLS ya escritas |
| Subida de fotografías | Bucket `machine-photos` en Supabase Storage | Paso 4 de `PublishForm` valida tipo y tamaño |
| Publicación real de anuncios | `insert` + moderación previa | El formulario ya produce datos validados |
| Reseñas públicas | Cuenta verificada + tabla `reviews` | Interfaz completa; hoy guarda en local |
| Envío de formularios por correo | Servicio de correo transaccional | Contacto y solicitud de información |
| Analítica | Conectar GA4/Plausible al `dataLayer` | `src/lib/analytics.ts`, eventos ya emitidos |
| Orden por cercanía real | Geolocalización del usuario + PostGIS | Hoy ordena por zona coincidente |
| Verificación de propietarios | Proceso operativo + estado en BD | Tres niveles ya modelados |

Mientras no haya backend, los formularios guardan en `localStorage`
(`src/lib/local-store.ts`) **y la interfaz lo dice explícitamente en cada
caso**. No hay ninguna pantalla que simule haber enviado algo que no envió.

---

## 7. Conectar Supabase

1. Crear el proyecto en Supabase y ejecutar `supabase/schema.sql`.
2. `npm install @supabase/supabase-js`.
3. Renombrar `supabase-repository.example.ts` a `supabase-repository.ts` y
   descomentar su contenido.
4. En `src/lib/repository/index.ts`, devolver `supabaseRepository` cuando
   `DATA_SOURCE === "supabase"`.
5. En `.env.local`: `NEXT_PUBLIC_DATA_SOURCE=supabase` más la URL y la clave
   anónima.
6. Crear el bucket `machine-photos` (público en lectura, subida solo para
   usuarios autenticados, 5 MB por archivo).
7. Borrar `src/lib/data/demo-machines.ts` y `demo-owners.ts`.

---

## 8. Desplegar

Pensado para Vercel:

1. Subir el repositorio a GitHub e importarlo en Vercel.
2. Configurar las variables de `.env.example` en el panel de Vercel.
3. Apuntar `maquifly.pe` al proyecto.
4. Dar de alta el dominio en Google Search Console y enviar
   `https://maquifly.pe/sitemap.xml`.

`npm run export` genera además una versión estática en `out/` para hospedaje
sin servidor.

---

## 9. Crecer sin reescribir

- **Categoría nueva** → un objeto en `src/lib/data/categories.ts`. Su página,
  su filtro, el menú y el sitemap se generan solos.
- **Ciudad nueva** → cambiar `active: true` en `src/lib/data/locations.ts` y
  añadir sus landings en `seo-landings.ts` con texto propio.
- **Landing nueva** → una entrada en `seo-landings.ts`. La estructura ya
  soporta `/alquiler-excavadoras-chiclayo` sin tocar componentes.
- **Artículo nuevo** → un objeto en `src/lib/data/blog.ts`.

Nota deliberada: **no** se generan cientos de combinaciones categoría × ciudad
vacías. Una página sin contenido útil no posiciona y, si posiciona, decepciona
a quien entra.

---

## 10. Marca

- **Tipografía:** Plus Jakarta Sans (titulares) + Inter (texto), autoalojadas.
- **Color:** azul profundo `#071628` como base, azul eléctrico `#2557eb` para
  acciones sobre fondo claro, lima eléctrico `#c8f83c` como acento **solo sobre
  superficies oscuras** (sobre blanco no cumple contraste AA), grises acero para
  texto y bordes.
- **Isotipo:** una «M» de trazos angulares —el perfil de un brazo articulado—
  con un vector de despegue. Funciona a 16 px y en una sola tinta. Vive
  únicamente en `src/components/brand/Logo.tsx` y `src/app/icon.svg`: sustituir
  el logotipo definitivo es cambiar esos dos archivos.
- **Tagline:** «Conectamos maquinaria con proyectos.» Secundaria: «Encuentra.
  Alquila. Trabaja.»

---

## 11. Accesibilidad y rendimiento

- Contraste AA en texto y controles; el lima nunca se usa sobre blanco.
- Todos los campos con `<label>` asociado; errores con `role="alert"` y
  `aria-describedby`.
- Enlace «Saltar al contenido», foco visible consistente, navegación completa
  por teclado, `aria-current` en navegación y paginación.
- FAQ con `<details>`: funciona sin JavaScript.
- Respeta `prefers-reduced-motion`.
- Imágenes con `next/image`, `sizes` correctos y carga diferida salvo las de
  arriba del pliegue.
- Todas las páginas de contenido se prerenderizan estáticamente.

---

## 12. Aviso legal

`/terminos` y `/privacidad` son borradores de trabajo y así se declara en la
propia página. Antes de operar comercialmente deben ser revisados por un
abogado, en particular en protección de datos personales y responsabilidad de
plataformas de intermediación en el Perú.
