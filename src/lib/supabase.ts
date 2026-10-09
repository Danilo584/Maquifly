import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_READY, supabaseConfig } from "@/lib/site";

/**
 * Cliente único de Supabase (navegador y servidor).
 * Usa la clave pública «anon»: lo que cada visitante puede leer o escribir lo
 * deciden las políticas RLS. El admin opera con su propia sesión.
 */
let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!SUPABASE_READY) return null;
  if (!client) {
    client = createClient(supabaseConfig.url, supabaseConfig.anonKey, {
      auth: {
        persistSession: typeof window !== "undefined",
        autoRefreshToken: typeof window !== "undefined",
      },
    });
  }
  return client;
}

export const PHOTO_BUCKET = "machine-photos";

/** URL pública de una foto guardada en el bucket. */
export function photoUrl(path: string): string {
  return `${supabaseConfig.url}/storage/v1/object/public/${PHOTO_BUCKET}/${path}`;
}
