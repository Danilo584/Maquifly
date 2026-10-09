/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * IMPLEMENTACIÓN DE REFERENCIA CONTRA SUPABASE
 * ===========================================================================
 * Archivo de ejemplo (extensión `.example.ts`, fuera del build). Muestra que
 * la arquitectura no es una promesa: el contrato `MaquiflyRepository` se
 * cumple igual leyendo archivos locales que leyendo Postgres.
 *
 * Para activarlo:
 *   1. npm install @supabase/supabase-js
 *   2. Ejecutar supabase/schema.sql en tu proyecto de Supabase.
 *   3. Renombrar este archivo a `supabase-repository.ts` y descomentar.
 *   4. Completar NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY.
 *   5. En `src/lib/repository/index.ts`, devolver `supabaseRepository`
 *      cuando DATA_SOURCE === "supabase".
 *
 * Ninguna página ni componente necesita cambiar.
 * ===========================================================================
 */

/*
import { createClient } from "@supabase/supabase-js";
import type { MaquiflyRepository } from "@/lib/repository/types";
import type { Machine, OwnerProfile, Review, SearchResult } from "@/lib/types";
import { PAGE_SIZE } from "@/lib/repository/demo-repository";
import { categoriesBySlug } from "@/lib/data/categories";
import { locationsBySlug } from "@/lib/data/locations";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

// Las columnas llegan en snake_case; el dominio usa camelCase.
function toMachine(row: any): Machine {
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
    description: row.description,
    locationId: row.location_id,
    area: row.area,
    price: row.price === null ? null : Number(row.price),
    currency: row.currency,
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
    // Vienen calculados por trigger a partir de reseñas reales.
    rating: row.rating === null ? null : Number(row.rating),
    reviewCount: row.review_count ?? 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    // Vienen de la vista machines_public (join con owner_profiles).
    ownerPlan: row.owner_plan ?? "start",
    ownerIsFounder: row.owner_is_founder ?? false,
    featuredUntil: row.featured_until,
    isDemo: false,
  };
}

function toOwner(row: any): OwnerProfile {
  return {
    id: row.id,
    userId: row.user_id,
    slug: row.slug,
    businessName: row.business_name,
    description: row.description,
    locationId: row.location_id,
    area: row.area,
    logoUrl: row.logo_url,
    // null en Fly Start: el contacto pasa por MaquiFly.
    whatsapp: row.whatsapp ?? "",
    phone: row.phone,
    rating: row.rating === null ? null : Number(row.rating),
    reviewCount: row.review_count ?? 0,
    machineCount: row.machine_count ?? 0,
    verificationStatus: row.verification_status,
    memberSince: row.member_since,
    plan: row.plan,
    planExpiresAt: row.plan_expires_at,
    founderNumber: row.founder_number,
    ruc: row.ruc,
    isDemo: false,
  };
}

function toReview(row: any): Review {
  return {
    id: row.id,
    machineId: row.machine_id,
    ownerId: row.owner_id,
    reviewerId: row.reviewer_id,
    reviewerName: row.reviewer?.name ?? "Usuario",
    rating: row.rating,
    comment: row.comment,
    criteria: row.criteria ?? undefined,
    verifiedRental: row.verified_rental,
    createdAt: row.created_at,
    ownerReply: row.owner_reply ?? null,
  };
}

export const supabaseRepository: MaquiflyRepository = {
  async searchMachines(filters): Promise<SearchResult> {
    const page = filters.page ?? 1;
    const from = (page - 1) * PAGE_SIZE;

    let query = supabase
      .from("machines_public")
      .select("*", { count: "exact" })
      .eq("status", "published");

    if (filters.q) {
      // Índice GIN sobre search_vector (ver supabase/schema.sql).
      query = query.textSearch("search_vector", filters.q, {
        type: "websearch",
        config: "spanish",
      });
    }
    if (filters.category) {
      const category = categoriesBySlug.get(filters.category);
      if (!category) return { machines: [], total: 0, page, pageSize: PAGE_SIZE, totalPages: 1 };
      query = query.eq("category_id", category.id);
    }
    if (filters.location) {
      const location = locationsBySlug.get(filters.location);
      if (!location) return { machines: [], total: 0, page, pageSize: PAGE_SIZE, totalPages: 1 };
      query = query.eq("location_id", location.id);
    }
    if (filters.area) query = query.eq("area", filters.area);
    if (filters.operator) query = query.eq("operator_available", true);
    if (filters.transport) query = query.eq("transport_available", true);
    if (filters.availability) query = query.eq("availability", filters.availability);
    if (filters.withPrice) query = query.not("price", "is", null);

    switch (filters.sort) {
      case "price_asc":
        query = query.order("price", { ascending: true, nullsFirst: false });
        break;
      case "price_desc":
        query = query.order("price", { ascending: false, nullsFirst: false });
        break;
      case "recent":
        query = query.order("created_at", { ascending: false });
        break;
      case "rating":
        query = query.order("rating", { ascending: false, nullsFirst: false });
        break;
      default:
        // Reglas de visibilidad (src/lib/plans.ts): Destacado Express
        // vigente → Fly Pro → Fly Plus → Fly Start; luego disponibilidad.
        query = query
          .order("visibility_rank", { ascending: false })
          .order("availability", { ascending: true })
          .order("created_at", { ascending: false });
    }

    const { data, count, error } = await query.range(from, from + PAGE_SIZE - 1);
    if (error) throw error;

    const total = count ?? 0;
    return {
      machines: (data ?? []).map(toMachine),
      total,
      page,
      pageSize: PAGE_SIZE,
      totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    };
  },

  async getMachineBySlug(slug) {
    const { data } = await supabase
      .from("machines_public")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();
    return data ? toMachine(data) : null;
  },

  async getMachineById(id) {
    const { data } = await supabase.from("machines_public").select("*").eq("id", id).maybeSingle();
    return data ? toMachine(data) : null;
  },

  async listMachineSlugs() {
    const { data } = await supabase.from("machines_public").select("slug").eq("status", "published");
    return (data ?? []).map((row: any) => row.slug);
  },

  async getMachinesByOwner(ownerId) {
    const { data } = await supabase
      .from("machines_public")
      .select("*")
      .eq("owner_id", ownerId)
      .eq("status", "published")
      .order("created_at", { ascending: false });
    return (data ?? []).map(toMachine);
  },

  async getRelatedMachines(machine, limit = 4) {
    const { data } = await supabase
      .from("machines_public")
      .select("*")
      .eq("status", "published")
      .neq("id", machine.id)
      .or(`category_id.eq.${machine.categoryId},location_id.eq.${machine.locationId}`)
      .limit(limit);
    return (data ?? []).map(toMachine);
  },

  async countMachinesByCategory() {
    // Función SQL auxiliar: select category_id, count(*) ... group by category_id
    const { data } = await supabase.rpc("count_machines_by_category");
    const counts: Record<string, number> = {};
    for (const row of data ?? []) counts[row.slug] = Number(row.total);
    return counts;
  },

  async getOwnerBySlug(slug) {
    const { data } = await supabase
      .from("owners_public")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    return data ? toOwner(data) : null;
  },

  async getOwnerById(id) {
    const { data } = await supabase
      .from("owners_public")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    return data ? toOwner(data) : null;
  },

  async listOwnerSlugs() {
    const { data } = await supabase.from("owners_public").select("slug");
    return (data ?? []).map((row: any) => row.slug);
  },

  async listOwners() {
    const { data } = await supabase.from("owners_public").select("*");
    return (data ?? []).map(toOwner);
  },

  async getReviewsForMachine(machineId) {
    const { data } = await supabase
      .from("reviews")
      .select("*, reviewer:profiles(name)")
      .eq("machine_id", machineId)
      .order("created_at", { ascending: false });
    return (data ?? []).map(toReview);
  },

  async getReviewsForOwner(ownerId) {
    const { data } = await supabase
      .from("reviews")
      .select("*, reviewer:profiles(name)")
      .eq("owner_id", ownerId)
      .order("created_at", { ascending: false });
    return (data ?? []).map(toReview);
  },

  async getStats() {
    const [machines, owners, reviews] = await Promise.all([
      supabase.from("machines_public").select("id", { count: "exact", head: true }).eq("status", "published"),
      supabase.from("owners_public").select("id", { count: "exact", head: true }),
      supabase.from("reviews").select("id", { count: "exact", head: true }),
    ]);
    return {
      machines: machines.count ?? 0,
      owners: owners.count ?? 0,
      reviews: reviews.count ?? 0,
      cities: 1,
      isDemo: false,
    };
  },
};
*/

export {};
