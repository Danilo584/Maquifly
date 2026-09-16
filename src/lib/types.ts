/**
 * MODELOS DE DATOS — MaquiFly
 * ---------------------------------------------------------------------------
 * Estos tipos son la fuente de verdad del dominio. La capa de datos
 * (src/lib/repository) los devuelve, y el esquema SQL de Supabase
 * (supabase/schema.sql) los refleja columna por columna.
 *
 * Regla del proyecto: ningún campo de reputación se inventa. `rating` y
 * `reviewCount` son `null`/`0` mientras no existan reseñas reales.
 */

// ---------------------------------------------------------------------------
// Enumeraciones
// ---------------------------------------------------------------------------

export type UserRole = "client" | "owner" | "admin";

/**
 * Niveles de verificación. Se muestran con honestidad:
 * - "registered": solo significa que la cuenta existe. No se muestra insignia.
 * - "verified":   MaquiFly validó identidad/negocio y datos de contacto.
 * - "documented": además se revisó documentación de la máquina.
 */
export type VerificationStatus = "registered" | "verified" | "documented";

export type ListingStatus =
  | "draft"
  | "pending_review"
  | "published"
  | "paused"
  | "rejected"
  | "archived";

export type AvailabilityStatus = "available" | "limited" | "unavailable";

export type PricingUnit =
  | "hour"
  | "day"
  | "week"
  | "month"
  | "trip"
  | "on_request";

export type FuelResponsibility = "owner" | "client" | "negotiable";

export type MachineFamily = "heavy" | "light" | "agricultural" | "support";

export type ReportReason =
  | "false_info"
  | "wrong_price"
  | "not_available"
  | "inappropriate"
  | "possible_scam"
  | "other";

// ---------------------------------------------------------------------------
// Entidades
// ---------------------------------------------------------------------------

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  locationId: string | null;
  verificationStatus: VerificationStatus;
  createdAt: string; // ISO 8601
}

export interface OwnerProfile {
  id: string;
  userId: string;
  slug: string;
  businessName: string;
  description: string;
  locationId: string;
  /** Distrito o zona. Nunca dirección exacta: se comparte al coordinar. */
  area: string | null;
  logoUrl: string | null;
  whatsapp: string;
  phone: string | null;
  /** null mientras no existan reseñas reales. Nunca un valor de relleno. */
  rating: number | null;
  reviewCount: number;
  machineCount: number;
  verificationStatus: VerificationStatus;
  memberSince: string; // ISO 8601
  /** true = registro de demostración, se etiqueta visiblemente en la interfaz. */
  isDemo: boolean;
}

export interface Category {
  id: string;
  name: string;
  /** Singular, para títulos: "Minicargador". */
  singular: string;
  slug: string;
  family: MachineFamily;
  shortDescription: string;
  /** Texto propio de la página de categoría (SEO con contenido útil). */
  longDescription: string;
  /** Usos reales, alimentan contenido y filtros. */
  commonUses: string[];
  icon: MachineIconName;
  order: number;
}

export type MachineIconName =
  | "skid-steer"
  | "excavator"
  | "backhoe"
  | "loader"
  | "dump-truck"
  | "roller"
  | "grader"
  | "tractor"
  | "crane"
  | "lift"
  | "telehandler"
  | "generator"
  | "mixer"
  | "compactor"
  | "tools"
  | "agri"
  | "other";

export interface Location {
  id: string;
  name: string;
  slug: string;
  region: string;
  /** Distritos/zonas usados en el filtro y en la publicación. */
  districts: string[];
  /** Solo las ciudades activas se ofrecen para publicar. */
  active: boolean;
  lat: number;
  lng: number;
}

export interface MachineImage {
  /** Ruta a una imagen real o a un marcador de posición generado. */
  url: string;
  alt: string;
  /** true = ilustración generada, no una foto real de la máquina. */
  isPlaceholder: boolean;
}

export interface Machine {
  id: string;
  /** Código público corto que se usa en WhatsApp y en soporte: MF-PIU-0014 */
  reference: string;
  slug: string;
  ownerId: string;
  categoryId: string;

  name: string;
  brand: string;
  model: string;
  year: number | null;
  description: string;

  locationId: string;
  /** Distrito o zona donde está la máquina. */
  area: string;

  /** null = "Consultar precio". No se inventan precios. */
  price: number | null;
  currency: "PEN" | "USD";
  pricingUnit: PricingUnit;
  /** Mínimo de contratación, ej. "4 horas". */
  minimumRental: string | null;

  operatorAvailable: boolean;
  operatorIncludedInPrice: boolean;
  transportAvailable: boolean;
  transportIncludedInPrice: boolean;
  fuel: FuelResponsibility;

  availability: AvailabilityStatus;
  availabilityNote: string | null;

  /** Especificaciones técnicas libres: "Potencia" → "74 HP". */
  specs: Array<{ label: string; value: string }>;
  workHours: number | null;

  images: MachineImage[];
  status: ListingStatus;

  rating: number | null;
  reviewCount: number;

  createdAt: string;
  updatedAt: string;
  /** true = publicación de demostración. Se etiqueta como DEMO en la interfaz. */
  isDemo: boolean;
}

export interface Review {
  id: string;
  machineId: string | null;
  ownerId: string;
  reviewerId: string;
  reviewerName: string;
  rating: number; // 1-5
  comment: string;
  /** Desglose opcional; se agrega cuando exista historial de alquileres. */
  criteria?: {
    equipmentCondition?: number;
    punctuality?: number;
    communication?: number;
    compliance?: number;
  };
  /** Solo true si MaquiFly registró el alquiler. Nunca por defecto. */
  verifiedRental: boolean;
  createdAt: string;
  ownerReply?: { comment: string; createdAt: string } | null;
}

export interface Report {
  id: string;
  machineId: string;
  reason: ReportReason;
  comment: string;
  reporterContact: string | null;
  createdAt: string;
  status: "open" | "reviewing" | "resolved" | "dismissed";
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  /** Contenido en bloques simples: evita depender de un CMS en el MVP. */
  body: Array<
    | { type: "p"; text: string }
    | { type: "h2"; text: string }
    | { type: "h3"; text: string }
    | { type: "ul"; items: string[] }
    | { type: "ol"; items: string[] }
    | { type: "note"; text: string }
  >;
  publishedAt: string;
  updatedAt?: string;
  readingMinutes: number;
  categorySlugs: string[];
  locationSlug: string | null;
  keywords: string[];
}

// ---------------------------------------------------------------------------
// Búsqueda
// ---------------------------------------------------------------------------

export type SortOption =
  | "relevance"
  | "rating"
  | "recent"
  | "price_asc"
  | "price_desc"
  | "nearby";

export interface SearchFilters {
  q?: string;
  category?: string; // slug
  location?: string; // slug
  area?: string;
  operator?: boolean;
  transport?: boolean;
  availability?: AvailabilityStatus;
  withPrice?: boolean;
  sort?: SortOption;
  page?: number;
}

export interface SearchResult {
  machines: Machine[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
