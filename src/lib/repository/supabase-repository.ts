/* eslint-disable @typescript-eslint/no-explicit-any */
import type { MaquiflyRepository } from "@/lib/repository/types";
import type { Machine, OwnerProfile, Review } from "@/lib/types";
import { applyFilters, paginate, sortMachines } from "@/lib/repository/demo-repository";
import { categoriesById } from "@/lib/data/categories";
import { getSupabase } from "@/lib/supabase";

/**
 * REPOSITORIO SUPABASE
 * ---------------------------------------------------------------------------
 * Lee de las vistas públicas `machines_public` y `owners_public`
 * (supabase/schema.sql), que ya aplican las reglas de privacidad: el WhatsApp
 * de un propietario Fly Start no sale de la base de datos.
 *
 * Con un catálogo de cientos de máquinas, cargar las publicadas y filtrar en
 * memoria es más simple y rápido que construir consultas por filtro, y reusa
 * exactamente la misma lógica de orden (planes, destacados) que el buscador.
 * Si el catálogo crece a miles, se pasa a filtrar en SQL sin tocar páginas.
 */

export function toMachine(row: any): Machine {
  return {
    id: row.id,
    reference: row.reference,
    slug: row.slug,
    ownerId: row.owner_id,
    categoryId: row.category_id,
    name: row.name,
    brand: row.brand,
    model: row.model,
    year: row.year,
    description: row.description ?? "",
    locationId: row.location_id,
    area: row.area,
    price: row.price === null ? null : Number(row.price),
    currency: row.currency ?? "PEN",
    pricingUnit: row.pricing_unit,
    minimumRental: row.minimum_rental,
    operatorAvailable: row.operator_available,
    operatorIncludedInPrice: row.operator_included_in_price,
    transportAvailable: row.transport_available,
    transportIncludedInPrice: row.transport_included_in_price,
    fuel: row.fuel,
    availability: row.availability,
    availabilityNote: row.availability_note,
    specs: row.specs ?? [],
    workHours: row.work_hours,
    images: row.images ?? [],
    status: row.status,
    rating: row.rating === null ? null : Number(row.rating),
    reviewCount: row.review_count ?? 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    ownerPlan: row.owner_plan ?? "start",
    ownerIsFounder: row.owner_is_founder ?? false,
    featuredUntil: row.featured_until ?? null,
    isDemo: false,
  };
}

export function toOwner(row: any): OwnerProfile {
  return {
    id: row.id,
    userId: row.user_id ?? "",
    slug: row.slug,
    businessName: row.business_name,
    description: row.description ?? "",
    locationId: row.location_id,
    area: row.area,
    logoUrl: row.logo_url,
    // null en Fly Start: el contacto pasa por MaquiFly.
    whatsapp: row.whatsapp ?? "",
    phone: row.phone ?? null,
    rating: row.rating === null ? null : Number(row.rating),
    reviewCount: row.review_count ?? 0,
    machineCount: row.machine_count ?? 0,
    verificationStatus: row.verification_status,
    memberSince: row.member_since,
    plan: row.plan ?? "start",
    planExpiresAt: row.plan_expires_at ?? null,
    founderNumber: row.founder_number ?? null,
    ruc: row.ruc ?? null,
    isDemo: false,
  };
}

function toReview(row: any): Review {
  return {
    id: row.id,
    machineId: row.machine_id,
    ownerId: row.owner_id,
    reviewerId: row.reviewer_id,
    reviewerName: row.reviewer?.name ?? "Cliente de MaquiFly",
    rating: row.rating,
    comment: row.comment,
    criteria: row.criteria ?? undefined,
    verifiedRental: row.verified_rental,
    createdAt: row.created_at,
    ownerReply: row.owner_reply ?? null,
  };
}

/** Todas las máquinas publicadas (la vista ya filtra status = published). */
export async function fetchPublishedMachines(): Promise<Machine[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("machines_public")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[MaquiFly] machines_public:", error.message);
    return [];
  }
  return (data ?? []).map(toMachine);
}

async function fetchOwners(): Promise<OwnerProfile[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase.from("owners_public").select("*");
  if (error) {
    console.error("[MaquiFly] owners_public:", error.message);
    return [];
  }
  return (data ?? []).map(toOwner);
}

export const supabaseRepository: MaquiflyRepository = {
  async searchMachines(filters) {
    const all = await fetchPublishedMachines();
    return paginate(sortMachines(applyFilters(all, filters), filters), filters.page ?? 1);
  },

  async getMachineBySlug(slug) {
    const all = await fetchPublishedMachines();
    return all.find((m) => m.slug === slug) ?? null;
  },

  async getMachineById(id) {
    const all = await fetchPublishedMachines();
    return all.find((m) => m.id === id) ?? null;
  },

  async listMachineSlugs() {
    return (await fetchPublishedMachines()).map((m) => m.slug);
  },

  async getMachinesByOwner(ownerId) {
    return (await fetchPublishedMachines()).filter((m) => m.ownerId === ownerId);
  },

  async getRelatedMachines(machine, limit = 4) {
    const all = (await fetchPublishedMachines()).filter((m) => m.id !== machine.id);
    const sameCategory = all.filter((m) => m.categoryId === machine.categoryId);
    const sameCity = all.filter(
      (m) => m.categoryId !== machine.categoryId && m.locationId === machine.locationId,
    );
    return [...sameCategory, ...sameCity].slice(0, limit);
  },

  async countMachinesByCategory() {
    const counts: Record<string, number> = {};
    for (const machine of await fetchPublishedMachines()) {
      const slug = categoriesById.get(machine.categoryId)?.slug;
      if (slug) counts[slug] = (counts[slug] ?? 0) + 1;
    }
    return counts;
  },

  async getOwnerBySlug(slug) {
    return (await fetchOwners()).find((o) => o.slug === slug) ?? null;
  },

  async getOwnerById(id) {
    return (await fetchOwners()).find((o) => o.id === id) ?? null;
  },

  async listOwnerSlugs() {
    return (await fetchOwners()).map((o) => o.slug);
  },

  async listOwners() {
    return fetchOwners();
  },

  async getReviewsForMachine(machineId) {
    const supabase = getSupabase();
    if (!supabase) return [];
    const { data } = await supabase
      .from("reviews")
      .select("*")
      .eq("machine_id", machineId)
      .order("created_at", { ascending: false });
    return (data ?? []).map(toReview);
  },

  async getReviewsForOwner(ownerId) {
    const supabase = getSupabase();
    if (!supabase) return [];
    const { data } = await supabase
      .from("reviews")
      .select("*")
      .eq("owner_id", ownerId)
      .order("created_at", { ascending: false });
    return (data ?? []).map(toReview);
  },

  async getStats() {
    const [machines, owners] = await Promise.all([fetchPublishedMachines(), fetchOwners()]);
    return {
      machines: machines.length,
      owners: owners.length,
      reviews: machines.reduce((sum, m) => sum + m.reviewCount, 0),
      cities: new Set(machines.map((m) => m.locationId)).size,
      isDemo: false,
    };
  },
};
