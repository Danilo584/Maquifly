/**
 * LÓGICA COMERCIAL — MaquiFly
 * ---------------------------------------------------------------------------
 * Un único lugar para planes, Programa Socio Fundador, Destacados Express y
 * datos de cobro. Las páginas (/planes, /pagar), las insignias, el orden del
 * buscador y las reglas de contacto leen de aquí: cambiar un precio o un
 * beneficio es editar este archivo y nada más.
 *
 * Cobro MANUAL: el propietario paga por Yape, Plin o transferencia, envía la
 * constancia por WhatsApp y la administración activa el plan a mano (en el
 * panel, columna `plan` de `owner_profiles`; ver supabase/schema.sql). No hay
 * pasarela automática: nada en la web "confirma" un pago que no se verificó.
 */

export type PlanId = "start" | "plus" | "pro";

export interface Plan {
  id: PlanId;
  name: string;
  /** Una línea: para quién es. */
  idealFor: string;
  /** Precio mensual normal en soles. 0 = gratis. */
  pricePEN: number;
  /** null = máquinas ilimitadas. */
  maxMachines: number | null;
  /** Meses con 50% de descuento para un Socio Fundador. 0 = sin promo. */
  founderDiscountMonths: number;
  /** El cliente ve el WhatsApp del propietario (si no, contacta vía MaquiFly). */
  directWhatsapp: boolean;
  /** Sale antes que los planes inferiores en el buscador. */
  searchPriority: number;
  /** Etiqueta «Destacado» en todas sus fichas. */
  featuredBadge: boolean;
  /** Aparece en la portada (inicio) de la web. */
  homepageShowcase: boolean;
  /** Perfil de empresa con logo y RUC visibles. */
  companyProfile: boolean;
  /** Beneficios en lenguaje de cliente, en orden. */
  benefits: string[];
  /** "Todo lo de…" para mostrar que los planes se acumulan. */
  includesPrevious: string | null;
}

export const FOUNDER_DISCOUNT = 0.5;
export const FOUNDER_SLOTS = 10;

/**
 * Tipo de cambio referencial para mostrar dólares. Se cobra SIEMPRE en
 * soles; el dólar es solo orientativo y se redondea al entero.
 * Fuente: BCRP / SUNAT, primera semana de octubre de 2026 (≈ S/ 3,44).
 */
export const PEN_PER_USD = 3.44;
export const FX_REFERENCE_LABEL = "oct. 2026";

export const plans: Record<PlanId, Plan> = {
  start: {
    id: "start",
    name: "Fly Start",
    idealFor: "Para empezar y aparecer en la web",
    pricePEN: 0,
    maxMachines: 2,
    founderDiscountMonths: 0,
    directWhatsapp: false,
    searchPriority: 0,
    featuredBadge: false,
    homepageShowcase: false,
    companyProfile: false,
    includesPrevious: null,
    benefits: [
      "Hasta 2 máquinas publicadas",
      "Ficha básica con fotos, zona y precio",
      "Los clientes te contactan a través de MaquiFly",
    ],
  },
  plus: {
    id: "plus",
    name: "Fly Plus",
    idealFor: "Para conseguir más alquileres",
    pricePEN: 110,
    maxMachines: 5,
    founderDiscountMonths: 3,
    directWhatsapp: true,
    searchPriority: 1,
    featuredBadge: true,
    homepageShowcase: false,
    companyProfile: false,
    includesPrevious: "Todo lo de Fly Start",
    benefits: [
      "Hasta 5 máquinas publicadas",
      "Botón directo a tu WhatsApp",
      "Prioridad en las búsquedas",
      "Etiqueta «Destacado» en tus fichas",
      "Sello de propietario verificado",
      "1 post al mes en las redes de MaquiFly",
      "Reporte mensual de visitas y contactos",
      "Atención prioritaria por WhatsApp",
    ],
  },
  pro: {
    id: "pro",
    name: "Fly Pro",
    idealFor: "Para empresas y flotas",
    pricePEN: 300,
    maxMachines: null,
    founderDiscountMonths: 1,
    directWhatsapp: true,
    searchPriority: 2,
    featuredBadge: true,
    homepageShowcase: true,
    companyProfile: true,
    includesPrevious: "Todo lo de Fly Plus",
    benefits: [
      "Máquinas ilimitadas",
      "Perfil de empresa con logo y RUC",
      "Apareces en la portada de MaquiFly",
      "Fotos y textos de tus anuncios hechos por nuestro equipo",
      "4 posts + 1 reel al mes en las redes de MaquiFly",
      "Difusión en grupos de construcción de Piura",
      "Asesoría para fijar tus precios",
    ],
  },
};

export const planOrder: PlanId[] = ["start", "plus", "pro"];
export const paidPlans: PlanId[] = ["plus", "pro"];

/** Beneficios extra del Programa Socio Fundador (además del descuento). */
export const founderPerks = [
  "50% de descuento de lanzamiento (Fly Plus: 3 meses · Fly Pro: 1 mes)",
  "Insignia permanente «Socio Fundador» en tu perfil y tus máquinas",
  "Prioridad absoluta en la difusión en grupos de construcción de Piura",
  "Menciones preferenciales en las redes de MaquiFly",
];

// ---------------------------------------------------------------------------
// Destacados Express: pago único para subir UNA máquina, sin plan mensual.
// ---------------------------------------------------------------------------

export interface BoostPackage {
  id: string;
  name: string;
  days: number;
  pricePEN: number;
}

export const boostPackages: BoostPackage[] = [
  { id: "destacado-7", name: "Destacado Express 7 días", days: 7, pricePEN: 25 },
];

// ---------------------------------------------------------------------------
// Cobro manual
// ---------------------------------------------------------------------------

export const payment = {
  /** Número que recibe Yape y Plin. */
  yape: "933 407 807",
  plin: "933 407 807",
  /**
   * Nombre del titular tal como aparece en Yape/Plin. Mostrarlo evita que el
   * cliente dude al ver otro nombre. Vacío = no se muestra.
   */
  holder: "",
  /**
   * Cuenta bancaria. Mientras esté vacía, la página de pago ofrece pedir los
   * datos por WhatsApp en lugar de mostrar una cuenta inventada.
   */
  bank: {
    name: "",
    account: "",
    cci: "",
    holder: "",
  },
  /** Ruta pública de la imagen del QR de Yape (en /public). Vacío = sin QR. */
  yapeQr: "",
} as const;

export const hasBankAccount = Boolean(payment.bank.name && payment.bank.account);

// ---------------------------------------------------------------------------
// Cálculos
// ---------------------------------------------------------------------------

export function toUSD(pen: number): number {
  return Math.round(pen / PEN_PER_USD);
}

export function founderPricePEN(plan: Plan): number {
  return Math.round(plan.pricePEN * (1 - FOUNDER_DISCOUNT));
}

export function formatPEN(amount: number): string {
  return `S/ ${amount.toLocaleString("es-PE")}`;
}

export function formatUSD(amount: number): string {
  return `US$ ${amount.toLocaleString("en-US")}`;
}

/** Cupos libres del Programa Socio Fundador según los propietarios reales. */
export function founderSlotsLeft(
  owners: Array<{ founderNumber: number | null; isDemo: boolean }>,
): number {
  const taken = owners.filter((o) => !o.isDemo && o.founderNumber !== null).length;
  return Math.max(0, FOUNDER_SLOTS - taken);
}

/** ¿Tiene un Destacado Express vigente? */
export function isBoostActive(featuredUntil: string | null, now = new Date()): boolean {
  return featuredUntil !== null && new Date(featuredUntil) > now;
}

/**
 * Peso de visibilidad en el buscador: Destacado Express vigente primero,
 * luego Fly Pro, Fly Plus y Fly Start. Dentro del mismo peso manda el orden
 * normal (relevancia, disponibilidad, recientes).
 */
export function visibilityRank(machine: {
  ownerPlan: PlanId;
  featuredUntil: string | null;
}): number {
  const boost = isBoostActive(machine.featuredUntil) ? 10 : 0;
  return boost + plans[machine.ownerPlan].searchPriority;
}

/** Productos que se pueden pagar en /pagar/[producto]. */
export type PayableItem =
  | { kind: "plan"; id: PlanId; plan: Plan }
  | { kind: "boost"; id: string; boost: BoostPackage };

export function payableItems(): Array<{ slug: string; item: PayableItem }> {
  return [
    ...paidPlans.map((id) => ({
      slug: `fly-${id}`,
      item: { kind: "plan", id, plan: plans[id] } as PayableItem,
    })),
    ...boostPackages.map((b) => ({
      slug: b.id,
      item: { kind: "boost", id: b.id, boost: b } as PayableItem,
    })),
  ];
}
