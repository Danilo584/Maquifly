import type { Location } from "@/lib/types";

/**
 * Ciudades. Solo Piura está activa: es donde se valida el modelo.
 * Las demás quedan declaradas para que la expansión sea cambiar un booleano,
 * no reescribir el buscador ni la estructura de URLs.
 */
export const locations: Location[] = [
  {
    id: "loc-piura",
    name: "Piura",
    slug: "piura",
    region: "Piura",
    districts: [
      "Piura (Cercado)",
      "Castilla",
      "Veintiséis de Octubre",
      "Catacaos",
      "Tambogrande",
      "La Arena",
      "La Unión",
      "Sullana",
      "Paita",
      "Sechura",
      "Chulucanas",
      "Talara",
    ],
    active: true,
    lat: -5.1945,
    lng: -80.6328,
  },
  {
    id: "loc-chiclayo",
    name: "Chiclayo",
    slug: "chiclayo",
    region: "Lambayeque",
    districts: ["Chiclayo", "José Leonardo Ortiz", "La Victoria", "Lambayeque", "Ferreñafe"],
    active: false,
    lat: -6.7714,
    lng: -79.8409,
  },
  {
    id: "loc-trujillo",
    name: "Trujillo",
    slug: "trujillo",
    region: "La Libertad",
    districts: ["Trujillo", "La Esperanza", "El Porvenir", "Víctor Larco", "Moche"],
    active: false,
    lat: -8.112,
    lng: -79.0288,
  },
  {
    id: "loc-tumbes",
    name: "Tumbes",
    slug: "tumbes",
    region: "Tumbes",
    districts: ["Tumbes", "Corrales", "Zarumilla", "Zorritos"],
    active: false,
    lat: -3.5669,
    lng: -80.4515,
  },
  {
    id: "loc-cajamarca",
    name: "Cajamarca",
    slug: "cajamarca",
    region: "Cajamarca",
    districts: ["Cajamarca", "Baños del Inca", "Jaén", "Celendín"],
    active: false,
    lat: -7.1617,
    lng: -78.5127,
  },
  {
    id: "loc-lima",
    name: "Lima",
    slug: "lima",
    region: "Lima",
    districts: ["Lima Norte", "Lima Sur", "Lima Este", "Callao", "Lurín", "Ate"],
    active: false,
    lat: -12.0464,
    lng: -77.0428,
  },
];

export const locationsBySlug = new Map(locations.map((l) => [l.slug, l]));
export const locationsById = new Map(locations.map((l) => [l.id, l]));

export const activeLocations = locations.filter((l) => l.active);
export const upcomingLocations = locations.filter((l) => !l.active);

export function getLocation(slug: string): Location | undefined {
  return locationsBySlug.get(slug);
}

export function getLocationById(id: string): Location | undefined {
  return locationsById.get(id);
}

export function locationName(id: string | null | undefined): string {
  if (!id) return "Perú";
  return locationsById.get(id)?.name ?? "Perú";
}
