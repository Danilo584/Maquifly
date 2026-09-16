import { DATA_SOURCE } from "@/lib/site";
import type { MaquiflyRepository } from "@/lib/repository/types";
import { demoRepository } from "@/lib/repository/demo-repository";

/**
 * Punto único de acceso a datos.
 *
 * Hoy devuelve el catálogo de demostración. Cuando exista la instancia de
 * Supabase, se añade aquí:
 *
 *   import { supabaseRepository } from "./supabase-repository";
 *   if (DATA_SOURCE === "supabase") return supabaseRepository;
 *
 * En `src/lib/repository/supabase-repository.example.ts` está la
 * implementación de referencia, ya escrita contra el mismo contrato.
 */
function resolveRepository(): MaquiflyRepository {
  switch (DATA_SOURCE) {
    case "supabase":
      // Aún no conectado: se avisa en consola y se continúa con el catálogo
      // DEMO en lugar de romper el sitio en producción.
      if (process.env.NODE_ENV !== "production") {
        console.warn(
          "[MaquiFly] NEXT_PUBLIC_DATA_SOURCE=supabase pero el repositorio de Supabase no está activado. Usando catálogo DEMO.",
        );
      }
      return demoRepository;
    case "demo":
    default:
      return demoRepository;
  }
}

export const repository: MaquiflyRepository = resolveRepository();
export type { MaquiflyRepository };
export { PAGE_SIZE } from "@/lib/repository/demo-repository";
