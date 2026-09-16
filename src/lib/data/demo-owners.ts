import type { OwnerProfile } from "@/lib/types";

/**
 * ⚠️ CATÁLOGO DE DEMOSTRACIÓN
 * ---------------------------------------------------------------------------
 * Ninguno de estos propietarios existe. Todos llevan la palabra "Demo" en el
 * nombre comercial, `isDemo: true`, y la interfaz los marca visiblemente.
 * Su único propósito es mostrar cómo se comporta el marketplace con inventario.
 *
 * `rating` es null y `reviewCount` es 0 en todos: la reputación no se inventa.
 * Los teléfonos son números reservados para demostración y no corresponden a
 * ninguna línea real; por eso el botón de WhatsApp no envía mensajes en
 * publicaciones DEMO (ver components/machine/WhatsAppCta.tsx).
 *
 * Al conectar Supabase, este archivo se elimina y el repositorio lee la tabla
 * `owner_profiles`.
 */
export const demoOwners: OwnerProfile[] = [
  {
    id: "own-demo-001",
    userId: "usr-demo-001",
    slug: "maquinarias-demo-norte",
    businessName: "Maquinarias Demo Norte",
    description:
      "Registro de demostración. Representa a una empresa de alquiler con flota propia de maquinaria pesada y operadores en planilla, del tipo que MaquiFly busca incorporar en Piura.",
    locationId: "loc-piura",
    area: "Piura (Cercado)",
    logoUrl: null,
    whatsapp: "51900000001",
    phone: null,
    rating: null,
    reviewCount: 0,
    machineCount: 5,
    verificationStatus: "registered",
    memberSince: "2026-01-12T00:00:00.000Z",
    isDemo: true,
  },
  {
    id: "own-demo-002",
    userId: "usr-demo-002",
    slug: "demo-contratistas-del-chira",
    businessName: "Demo Contratistas del Chira",
    description:
      "Registro de demostración. Representa a un contratista de movimiento de tierras que alquila su maquinaria cuando no está en obra.",
    locationId: "loc-piura",
    area: "Sullana",
    logoUrl: null,
    whatsapp: "51900000002",
    phone: null,
    rating: null,
    reviewCount: 0,
    machineCount: 4,
    verificationStatus: "registered",
    memberSince: "2026-02-03T00:00:00.000Z",
    isDemo: true,
  },
  {
    id: "own-demo-003",
    userId: "usr-demo-003",
    slug: "alquileres-demo-catacaos",
    businessName: "Alquileres Demo Catacaos",
    description:
      "Registro de demostración. Representa a un propietario particular con una o dos máquinas, el perfil más común al iniciar un marketplace de alquiler.",
    locationId: "loc-piura",
    area: "Catacaos",
    logoUrl: null,
    whatsapp: "51900000003",
    phone: null,
    rating: null,
    reviewCount: 0,
    machineCount: 3,
    verificationStatus: "registered",
    memberSince: "2026-03-18T00:00:00.000Z",
    isDemo: true,
  },
  {
    id: "own-demo-004",
    userId: "usr-demo-004",
    slug: "demo-equipos-agro-tambogrande",
    businessName: "Demo Equipos Agro Tambogrande",
    description:
      "Registro de demostración. Representa a un proveedor de equipos agrícolas y generadores para campaña, orientado al valle del Alto Piura.",
    locationId: "loc-piura",
    area: "Tambogrande",
    logoUrl: null,
    whatsapp: "51900000004",
    phone: null,
    rating: null,
    reviewCount: 0,
    machineCount: 3,
    verificationStatus: "registered",
    memberSince: "2026-04-02T00:00:00.000Z",
    isDemo: true,
  },
];
