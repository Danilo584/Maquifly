import type {
  Machine,
  OwnerProfile,
  Review,
  SearchFilters,
  SearchResult,
} from "@/lib/types";

/**
 * CONTRATO DE DATOS
 * ---------------------------------------------------------------------------
 * Toda la aplicación consume datos exclusivamente a través de esta interfaz.
 * Ningún componente importa `demo-machines.ts` directamente.
 *
 * Consecuencia: migrar de catálogo DEMO a Supabase es escribir una segunda
 * implementación de `MaquiflyRepository` y cambiar una variable de entorno.
 * Las páginas, los filtros y los componentes no se tocan.
 */
export interface MaquiflyRepository {
  searchMachines(filters: SearchFilters): Promise<SearchResult>;
  getMachineBySlug(slug: string): Promise<Machine | null>;
  getMachineById(id: string): Promise<Machine | null>;
  listMachineSlugs(): Promise<string[]>;
  getMachinesByOwner(ownerId: string): Promise<Machine[]>;
  getRelatedMachines(machine: Machine, limit?: number): Promise<Machine[]>;
  countMachinesByCategory(): Promise<Record<string, number>>;

  getOwnerBySlug(slug: string): Promise<OwnerProfile | null>;
  getOwnerById(id: string): Promise<OwnerProfile | null>;
  listOwnerSlugs(): Promise<string[]>;
  listOwners(): Promise<OwnerProfile[]>;

  getReviewsForMachine(machineId: string): Promise<Review[]>;
  getReviewsForOwner(ownerId: string): Promise<Review[]>;

  /** Métricas reales del catálogo. Nunca cifras de marketing infladas. */
  getStats(): Promise<{
    machines: number;
    owners: number;
    reviews: number;
    cities: number;
    isDemo: boolean;
  }>;
}
