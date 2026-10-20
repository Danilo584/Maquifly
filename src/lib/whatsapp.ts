import type { Machine, OwnerProfile } from "@/lib/types";
import { locationName } from "@/lib/data/locations";
import { getCategoryById } from "@/lib/data/categories";
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

/**
 * Mensaje directo al propietario (Fly Plus / Fly Pro): corto y natural, como
 * lo escribiría una persona. Sin enlace ni código: con el tipo de máquina,
 * la marca y modelo, y la zona, el propietario sabe de qué equipo le hablan.
 *   «Hola Arenera Piura 👋 Vi tu minicargador Bobcat S650 de Castilla en
 *    MaquiFly. ¿Está disponible? ¿Me pasas el precio?»
 */
export function buildMachineMessage(
  machine: Pick<Machine, "categoryId" | "area" | "brand" | "model">,
  owner?: Pick<OwnerProfile, "businessName"> | null,
): string {
  const kind = getCategoryById(machine.categoryId)?.singular.toLowerCase() ?? "maquinaria";
  // «Por confirmar» es el relleno del panel cuando no se sabe la marca o el modelo.
  const clean = (v: string | null | undefined) =>
    v && !/^por confirmar$/i.test(v.trim()) ? v.trim() : "";
  const brandModel = [clean(machine.brand), clean(machine.model)].filter(Boolean).join(" ");
  const greeting = owner?.businessName ? `Hola ${owner.businessName} 👋` : "Hola 👋";
  const what = brandModel ? `${kind} ${brandModel}` : kind;
  const where = machine.area ? ` de ${machine.area}` : "";
  return `${greeting} Vi tu ${what}${where} en MaquiFly. ¿Está disponible? ¿Me pasas el precio?`;
}

/**
 * Fly Start: el cliente escribe a MaquiFly, que lo pone en contacto con el
 * propietario. Así MaquiFly acompaña el trato y el flete desde el inicio.
 */
export function buildBrokeredMessage(
  machine: Pick<Machine, "name" | "area" | "locationId" | "reference" | "slug">,
): string {
  const city = locationName(machine.locationId);
  return [
    `Hola MaquiFly, me interesa alquilar el ${machine.name} (${machine.area}, ${city}).`,
    `Código: ${machine.reference}.`,
    `¿Me ponen en contacto con el propietario para ver disponibilidad y precio?`,
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
