import { DATA_SOURCE } from "@/lib/site";
import type { MaquiflyRepository } from "@/lib/repository/types";
import { demoRepository } from "@/lib/repository/demo-repository";
import { supabaseRepository } from "@/lib/repository/supabase-repository";

/**
 * Punto único de acceso a datos.
 * Con Supabase configurado (URL + clave anon en site.ts o variables de
 * entorno) la web lee la base de datos real. Sin configurar, usa el catálogo
 * local de src/lib/data/catalog.ts.
 */
export const repository: MaquiflyRepository =
  DATA_SOURCE === "supabase" ? supabaseRepository : demoRepository;

export type { MaquiflyRepository };
export { PAGE_SIZE } from "@/lib/repository/demo-repository";
