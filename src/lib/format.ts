import type {
  AvailabilityStatus,
  FuelResponsibility,
  Machine,
  PricingUnit,
  VerificationStatus,
} from "@/lib/types";

export const pricingUnitLabel: Record<PricingUnit, string> = {
  hour: "por hora",
  day: "por día",
  week: "por semana",
  month: "por mes",
  trip: "por viaje",
  on_request: "a consultar",
};

export const pricingUnitShort: Record<PricingUnit, string> = {
  hour: "/hora",
  day: "/día",
  week: "/semana",
  month: "/mes",
  trip: "/viaje",
  on_request: "",
};

export const availabilityLabel: Record<AvailabilityStatus, string> = {
  available: "Disponible",
  limited: "Disponibilidad limitada",
  unavailable: "No disponible",
};

export const fuelLabel: Record<FuelResponsibility, string> = {
  owner: "Incluido por el propietario",
  client: "A cargo del cliente",
  negotiable: "A coordinar",
};

export const verificationLabel: Record<VerificationStatus, string> = {
  registered: "Propietario registrado",
  verified: "Propietario verificado",
  documented: "Máquina con documentación revisada",
};

export const verificationHelp: Record<VerificationStatus, string> = {
  registered:
    "La cuenta existe en MaquiFly. Todavía no hemos verificado su identidad ni su documentación.",
  verified:
    "MaquiFly contrastó los datos de identidad o del negocio y validó el número de contacto.",
  documented:
    "Además de verificar al propietario, revisamos la documentación de la máquina.",
};

const soles = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
  maximumFractionDigits: 0,
});

const dollars = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function formatMoney(value: number, currency: "PEN" | "USD" = "PEN"): string {
  return (currency === "USD" ? dollars : soles).format(value);
}

/** Precio listo para mostrar. Sin precio → "Consultar precio". Nunca inventa. */
export function formatPrice(machine: Pick<Machine, "price" | "currency" | "pricingUnit">): {
  amount: string | null;
  unit: string;
  label: string;
} {
  if (machine.price === null) {
    return { amount: null, unit: "", label: "Consultar precio" };
  }
  const amount = formatMoney(machine.price, machine.currency);
  const unit = pricingUnitShort[machine.pricingUnit];
  return { amount, unit, label: `${amount}${unit}` };
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("es-PE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

export function formatMonthYear(iso: string): string {
  const formatted = new Intl.DateTimeFormat("es-PE", {
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("es-PE").format(value);
}

/** "12 máquinas" / "1 máquina" / "Sin máquinas publicadas" */
export function pluralize(
  count: number,
  singular: string,
  plural: string,
  zero?: string,
): string {
  if (count === 0 && zero) return zero;
  return `${formatNumber(count)} ${count === 1 ? singular : plural}`;
}

export function titleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
