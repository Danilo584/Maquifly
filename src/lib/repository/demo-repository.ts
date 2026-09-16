import type { MaquiflyRepository } from "@/lib/repository/types";
import type { Machine, SearchFilters, SearchResult } from "@/lib/types";
import { demoMachines } from "@/lib/data/demo-machines";
import { demoOwners } from "@/lib/data/demo-owners";
import { reviews } from "@/lib/data/reviews";
import { categoriesById, categoriesBySlug } from "@/lib/data/categories";
import { locationsBySlug } from "@/lib/data/locations";

export const PAGE_SIZE = 12;

/** Normaliza para buscar sin tildes ni mayúsculas ("Grúa" → "grua"). */
export function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

/**
 * Puntuación de relevancia. Es deliberadamente simple y transparente:
 * coincidencia exacta de modelo > marca > nombre > categoría > descripción.
 * Cuando el catálogo crezca, este bloque se reemplaza por búsqueda de texto
 * completo en Postgres (`tsvector` + `pg_trgm`), sin cambiar la interfaz.
 */
function relevanceScore(machine: Machine, query: string): number {
  if (!query) return 0;
  const q = normalize(query);
  const terms = q.split(/\s+/).filter(Boolean);
  const category = categoriesById.get(machine.categoryId);

  const haystacks: Array<{ text: string; weight: number }> = [
    { text: normalize(machine.model), weight: 12 },
    { text: normalize(machine.brand), weight: 10 },
    { text: normalize(machine.name), weight: 8 },
    { text: normalize(category?.name ?? ""), weight: 6 },
    { text: normalize(category?.singular ?? ""), weight: 6 },
    { text: normalize(machine.area), weight: 4 },
    { text: normalize(machine.reference), weight: 4 },
    { text: normalize(machine.description), weight: 1 },
  ];

  let score = 0;
  for (const term of terms) {
    for (const { text, weight } of haystacks) {
      if (!text) continue;
      if (text === term) score += weight * 2;
      else if (text.startsWith(term)) score += weight * 1.5;
      else if (text.includes(term)) score += weight;
    }
  }
  return score;
}

function matchesQuery(machine: Machine, query: string): boolean {
  return relevanceScore(machine, query) > 0;
}

function comparePrice(a: Machine, b: Machine, direction: 1 | -1): number {
  // Las publicaciones sin precio ("Consultar precio") siempre van al final:
  // no se les asigna un precio ficticio para poder ordenarlas.
  if (a.price === null && b.price === null) return 0;
  if (a.price === null) return 1;
  if (b.price === null) return -1;
  return (a.price - b.price) * direction;
}

const availabilityRank: Record<Machine["availability"], number> = {
  available: 0,
  limited: 1,
  unavailable: 2,
};

export function applyFilters(all: Machine[], filters: SearchFilters): Machine[] {
  let list = all.filter((m) => m.status === "published");

  if (filters.q) list = list.filter((m) => matchesQuery(m, filters.q!));

  if (filters.category) {
    const category = categoriesBySlug.get(filters.category);
    if (!category) return [];
    list = list.filter((m) => m.categoryId === category.id);
  }

  if (filters.location) {
    const location = locationsBySlug.get(filters.location);
    if (!location) return [];
    list = list.filter((m) => m.locationId === location.id);
  }

  if (filters.area) list = list.filter((m) => m.area === filters.area);
  if (filters.operator) list = list.filter((m) => m.operatorAvailable);
  if (filters.transport) list = list.filter((m) => m.transportAvailable);
  if (filters.availability)
    list = list.filter((m) => m.availability === filters.availability);
  if (filters.withPrice) list = list.filter((m) => m.price !== null);

  return list;
}

export function sortMachines(
  list: Machine[],
  filters: SearchFilters,
): Machine[] {
  const sorted = [...list];
  const sort = filters.sort ?? "relevance";

  switch (sort) {
    case "price_asc":
      sorted.sort((a, b) => comparePrice(a, b, 1));
      break;
    case "price_desc":
      sorted.sort((a, b) => comparePrice(a, b, -1));
      break;
    case "recent":
      sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      break;
    case "rating":
      // Sin reseñas reales, `rating` es null en todo el catálogo. En ese caso
      // el orden cae a disponibilidad + reciente, y la interfaz lo advierte.
      sorted.sort((a, b) => {
        if (a.rating !== null && b.rating !== null) return b.rating - a.rating;
        if (a.rating !== null) return -1;
        if (b.rating !== null) return 1;
        return availabilityRank[a.availability] - availabilityRank[b.availability];
      });
      break;
    case "nearby":
      // Proximidad aproximada sin GPS: primero la zona filtrada, luego el
      // resto de la ciudad. La proximidad real por coordenadas requiere
      // geolocalización del usuario + PostGIS (ver README, "Qué falta").
      sorted.sort((a, b) => {
        const aNear = filters.area && a.area === filters.area ? 0 : 1;
        const bNear = filters.area && b.area === filters.area ? 0 : 1;
        if (aNear !== bNear) return aNear - bNear;
        return a.area.localeCompare(b.area, "es");
      });
      break;
    case "relevance":
    default:
      sorted.sort((a, b) => {
        if (filters.q) {
          const diff = relevanceScore(b, filters.q) - relevanceScore(a, filters.q);
          if (diff !== 0) return diff;
        }
        const av = availabilityRank[a.availability] - availabilityRank[b.availability];
        if (av !== 0) return av;
        return b.createdAt.localeCompare(a.createdAt);
      });
  }

  return sorted;
}

export function paginate(list: Machine[], page: number): SearchResult {
  const total = list.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const current = Math.min(Math.max(1, page || 1), totalPages);
  const start = (current - 1) * PAGE_SIZE;
  return {
    machines: list.slice(start, start + PAGE_SIZE),
    total,
    page: current,
    pageSize: PAGE_SIZE,
    totalPages,
  };
}

/**
 * Implementación en memoria sobre el catálogo de demostración.
 * Es asíncrona a propósito: el día que se conecte Supabase, las firmas ya
 * coinciden y ninguna página necesita cambiar.
 */
export const demoRepository: MaquiflyRepository = {
  async searchMachines(filters) {
    const filtered = applyFilters(demoMachines, filters);
    return paginate(sortMachines(filtered, filters), filters.page ?? 1);
  },

  async getMachineBySlug(slug) {
    return demoMachines.find((m) => m.slug === slug) ?? null;
  },

  async getMachineById(id) {
    return demoMachines.find((m) => m.id === id) ?? null;
  },

  async listMachineSlugs() {
    return demoMachines.filter((m) => m.status === "published").map((m) => m.slug);
  },

  async getMachinesByOwner(ownerId) {
    return demoMachines.filter(
      (m) => m.ownerId === ownerId && m.status === "published",
    );
  },

  async getRelatedMachines(machine, limit = 4) {
    const sameCategory = demoMachines.filter(
      (m) =>
        m.id !== machine.id &&
        m.status === "published" &&
        m.categoryId === machine.categoryId,
    );
    const sameCity = demoMachines.filter(
      (m) =>
        m.id !== machine.id &&
        m.status === "published" &&
        m.categoryId !== machine.categoryId &&
        m.locationId === machine.locationId,
    );
    return [...sameCategory, ...sameCity].slice(0, limit);
  },

  async countMachinesByCategory() {
    const counts: Record<string, number> = {};
    for (const machine of demoMachines) {
      if (machine.status !== "published") continue;
      const slug = categoriesById.get(machine.categoryId)?.slug;
      if (!slug) continue;
      counts[slug] = (counts[slug] ?? 0) + 1;
    }
    return counts;
  },

  async getOwnerBySlug(slug) {
    return demoOwners.find((o) => o.slug === slug) ?? null;
  },

  async getOwnerById(id) {
    return demoOwners.find((o) => o.id === id) ?? null;
  },

  async listOwnerSlugs() {
    return demoOwners.map((o) => o.slug);
  },

  async listOwners() {
    return demoOwners;
  },

  async getReviewsForMachine(machineId) {
    return reviews.filter((r) => r.machineId === machineId);
  },

  async getReviewsForOwner(ownerId) {
    return reviews.filter((r) => r.ownerId === ownerId);
  },

  async getStats() {
    const published = demoMachines.filter((m) => m.status === "published");
    const cities = new Set(published.map((m) => m.locationId));
    return {
      machines: published.length,
      owners: demoOwners.length,
      reviews: reviews.length,
      cities: cities.size,
      isDemo: true,
    };
  },
};
