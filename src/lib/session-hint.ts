import { supabaseConfig } from "@/lib/site";

/**
 * ¿Hay una sesión guardada en este navegador?
 * ---------------------------------------------------------------------------
 * Lee directamente la clave donde Supabase guarda la sesión, sin cargar la
 * librería de Supabase. Así la barra de navegación (presente en todas las
 * páginas) puede mostrar «Mi cuenta» sin sumar ~65 kB a cada página.
 * Es solo una pista visual: /cuenta valida la sesión de verdad.
 */
export function hasStoredSession(): boolean {
  if (typeof window === "undefined" || !supabaseConfig.url) return false;
  try {
    const ref = new URL(supabaseConfig.url).hostname.split(".")[0];
    const raw = window.localStorage.getItem(`sb-${ref}-auth-token`);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as { refresh_token?: string } | null;
    return Boolean(parsed?.refresh_token);
  } catch {
    return false;
  }
}
