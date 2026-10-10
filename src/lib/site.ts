/**
 * Configuración global de la plataforma.
 * Un único lugar para datos de marca, contacto y SEO.
 */

export const siteConfig = {
  name: "MaquiFly",
  legalName: "MaquiFly",
  domain: "maquifly.pe",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://maquifly.pe",
  tagline: "Conectamos maquinaria con proyectos.",
  taglineSecondary: "Encuentra. Alquila. Trabaja.",
  description:
    "MaquiFly conecta a propietarios de maquinaria con personas y empresas que la necesitan. Busca equipos disponibles para alquiler cerca de tu proyecto y contacta directamente con el propietario.",
  locale: "es_PE",
  lang: "es-PE",
  contact: {
    email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "maquifly.servicios@gmail.com",
    /**
     * Formato internacional sin "+" ni espacios.
     * 51 = Perú. Se deja como valor por defecto en el código (y no solo en
     * .env) para que el sitio funcione aunque el despliegue se haga sin
     * configurar variables de entorno.
     */
    whatsapp: process.env.NEXT_PUBLIC_CONTACT_WHATSAPP ?? "51933407807",
    city: "Piura",
    region: "Piura",
    country: "PE",
  },
  /**
   * Redes sociales. Se dejan vacías a propósito: no se muestran perfiles
   * que todavía no existen (ver sección "no inventar confianza").
   */
  social: {
    instagram: "https://www.instagram.com/maquifly.pe/",
    facebook: "https://www.facebook.com/profile.php?id=61594906361946",
    tiktok: "",
    linkedin: "",
  },
  /** Ciudad activa hoy. La arquitectura soporta varias (ver data/locations). */
  launchCity: "piura",
} as const;

/**
 * Conexión a Supabase. La URL y la clave «anon» son PÚBLICAS por diseño
 * (la seguridad la ponen las políticas RLS de supabase/schema.sql), así que
 * pueden ir como valor por defecto en el código. Nunca poner aquí la
 * «service_role key».
 */
export const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://kmhlffnsermghtrtwvaz.supabase.co",
  anonKey:
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    "sb_publishable_AIB0RDlG6OPJ1-lFJGl8oQ_pkmxWhiX",
};

export const SUPABASE_READY = Boolean(supabaseConfig.url && supabaseConfig.anonKey);

/** De dónde lee la web el catálogo: Supabase si está configurado. */
export const DATA_SOURCE: "demo" | "supabase" = SUPABASE_READY ? "supabase" : "demo";

export const IS_DEMO_CATALOG = DATA_SOURCE === "demo";

export function absoluteUrl(path = "/"): string {
  const base = siteConfig.url.replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
