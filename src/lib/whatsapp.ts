import type { Machine, OwnerProfile } from "@/lib/types";
import { locationName } from "@/lib/data/locations";
import { absoluteUrl, siteConfig } from "@/lib/site";

/**
 * WhatsApp es el canal de conversión principal del MVP.
 * El mensaje se arma con los datos de la publicación para que el propietario
 * sepa de inmediato de qué máquina se le habla, sin tener que preguntarlo.
 */

/** Deja el número en el formato que exige wa.me: solo dígitos, con país. */
export function sanitizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  // Números peruanos de 9 dígitos: se antepone el código de país.
  if (digits.length === 9 && digits.startsWith("9")) return `51${digits}`;
  return digits;
}

export function buildMachineMessage(
  machine: Pick<Machine, "name" | "area" | "locationId" | "reference" | "slug">,
): string {
  const city = locationName(machine.locationId);
  return [
    `Hola, vi tu maquinaria en MaquiFly y estoy interesado en alquilar el ${machine.name}.`,
    `Ubicación de la publicación: ${machine.area}, ${city}.`,
    `Código: ${machine.reference}.`,
    `¿Podrías brindarme disponibilidad y precio?`,
    ``,
    absoluteUrl(`/maquina/${machine.slug}`),
  ].join("\n");
}

export function buildOwnerMessage(owner: Pick<OwnerProfile, "businessName">): string {
  return [
    `Hola ${owner.businessName}, te escribo desde MaquiFly.`,
    `Estoy buscando maquinaria para un proyecto y quisiera consultar disponibilidad y precios.`,
  ].join("\n");
}

export function buildPlatformMessage(subject = "Consulta general"): string {
  return `Hola MaquiFly, escribo desde la web. Asunto: ${subject}.`;
}

/** URL de WhatsApp lista para usar. */
export function whatsappUrl(phone: string, message: string): string {
  const number = sanitizePhone(phone);
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function platformWhatsappUrl(subject?: string): string {
  return whatsappUrl(siteConfig.contact.whatsapp, buildPlatformMessage(subject));
}
