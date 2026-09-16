import type { AvailabilityStatus, SearchFilters, SortOption } from "@/lib/types";

/**
 * La URL es el estado del buscador.
 * Ventajas: los resultados se pueden compartir, el botón "atrás" funciona,
 * cada combinación es indexable si algún día conviene, y no hace falta un
 * gestor de estado en el cliente.
 */

export type RawSearchParams = Record<string, string | string[] | undefined>;

const SORT_OPTIONS: SortOption[] = [
  "relevance",
  "rating",
  "recent",
  "price_asc",
  "price_desc",
  "nearby",
];

const AVAILABILITY: AvailabilityStatus[] = ["available", "limited", "unavailable"];

function first(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export function parseSearchParams(params: RawSearchParams): SearchFilters {
  const q = first(params.q)?.trim();
  const category = first(params.categoria)?.trim();
  const location = first(params.ciudad)?.trim();
  const area = first(params.zona)?.trim();
  const sortRaw = first(params.orden) as SortOption | undefined;
  const availabilityRaw = first(params.disponibilidad) as
    | AvailabilityStatus
    | undefined;
  const pageRaw = Number.parseInt(first(params.pagina) ?? "1", 10);

  return {
    q: q || undefined,
    category: category || undefined,
    location: location || undefined,
    area: area || undefined,
    operator: first(params.operador) === "1",
    transport: first(params.transporte) === "1",
    withPrice: first(params.conprecio) === "1",
    availability:
      availabilityRaw && AVAILABILITY.includes(availabilityRaw)
        ? availabilityRaw
        : undefined,
    sort: sortRaw && SORT_OPTIONS.includes(sortRaw) ? sortRaw : "relevance",
    page: Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1,
  };
}

/** Serializa filtros a query string en español, omitiendo valores por defecto. */
export function buildSearchQuery(filters: SearchFilters): string {
  const sp = new URLSearchParams();
  if (filters.q) sp.set("q", filters.q);
  if (filters.category) sp.set("categoria", filters.category);
  if (filters.location) sp.set("ciudad", filters.location);
  if (filters.area) sp.set("zona", filters.area);
  if (filters.operator) sp.set("operador", "1");
  if (filters.transport) sp.set("transporte", "1");
  if (filters.withPrice) sp.set("conprecio", "1");
  if (filters.availability) sp.set("disponibilidad", filters.availability);
  if (filters.sort && filters.sort !== "relevance") sp.set("orden", filters.sort);
  if (filters.page && filters.page > 1) sp.set("pagina", String(filters.page));
  const query = sp.toString();
  return query ? `?${query}` : "";
}

export function searchHref(filters: SearchFilters): string {
  return `/maquinaria${buildSearchQuery(filters)}`;
}

export function countActiveFilters(filters: SearchFilters): number {
  let count = 0;
  if (filters.category) count++;
  if (filters.location) count++;
  if (filters.area) count++;
  if (filters.operator) count++;
  if (filters.transport) count++;
  if (filters.withPrice) count++;
  if (filters.availability) count++;
  return count;
}

export const sortLabels: Record<SortOption, string> = {
  relevance: "Relevancia",
  rating: "Mejor valorados",
  recent: "Más recientes",
  price_asc: "Precio: menor a mayor",
  price_desc: "Precio: mayor a menor",
  nearby: "Más cercanos",
};
