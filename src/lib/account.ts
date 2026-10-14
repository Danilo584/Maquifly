"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabase";
import { FOUNDER_SLOTS, type PlanId } from "@/lib/plans";
import type {
  AvailabilityStatus,
  FuelResponsibility,
  ListingStatus,
  MachineImage,
  PricingUnit,
  VerificationStatus,
} from "@/lib/types";

/**
 * CUENTAS DE PROPIETARIO
 * ---------------------------------------------------------------------------
 * Sesión con Supabase Auth (correo + contraseña). Todo lo que el propietario
 * lee o cambia pasa por las políticas RLS y los triggers de
 * supabase/03-cuentas.sql: aunque alguien manipulara esta página, la base de
 * datos solo le deja tocar lo suyo.
 */

export function useSession(): { session: Session | null; loading: boolean } {
  const [state, setState] = useState<{ session: Session | null; loading: boolean }>({
    session: null,
    loading: true,
  });

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      setState({ session: null, loading: false });
      return;
    }
    let alive = true;
    supabase.auth.getSession().then(({ data }) => {
      if (alive) setState({ session: data.session, loading: false });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      if (alive) setState({ session: next, loading: false });
    });
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return state;
}

/** Fila de owner_profiles tal como la ve su dueño. */
export type MyOwner = {
  id: string;
  user_id: string;
  slug: string;
  business_name: string;
  description: string;
  location_id: string;
  area: string | null;
  whatsapp: string;
  ruc: string | null;
  verification_status: VerificationStatus;
  plan: PlanId;
  plan_expires_at: string | null;
  founder_number: number | null;
  machine_count: number;
  member_since: string;
};

/** Fila de machines tal como la ve su dueño (todas, no solo publicadas). */
export type MyMachine = {
  id: string;
  reference: string;
  slug: string;
  owner_id: string;
  category_id: string;
  name: string;
  brand: string;
  model: string;
  year: number | null;
  description: string;
  location_id: string;
  area: string;
  price: number | null;
  currency: "PEN" | "USD";
  pricing_unit: PricingUnit;
  minimum_rental: string | null;
  operator_available: boolean;
  operator_included_in_price: boolean;
  transport_available: boolean;
  transport_included_in_price: boolean;
  fuel: FuelResponsibility;
  availability: AvailabilityStatus;
  availability_note: string | null;
  specs: Array<{ label: string; value: string }>;
  images: MachineImage[];
  status: ListingStatus;
  featured_until: string | null;
  created_at: string;
  updated_at: string;
};

export type MyPayment = {
  id: string;
  product: "fly-plus" | "fly-pro" | "destacado-7";
  machine_id: string | null;
  amount_pen: number;
  method: "yape" | "plin" | "transfer";
  operation_number: string | null;
  status: "pending" | "approved" | "rejected";
  note: string | null;
  created_at: string;
};

/** Plan que manda hoy: un plan pagado vencido se comporta como Fly Start. */
export function effectivePlan(o: Pick<MyOwner, "plan" | "plan_expires_at">): PlanId {
  return o.plan !== "start" && o.plan_expires_at && new Date(o.plan_expires_at) > new Date()
    ? o.plan
    : "start";
}

export const machineStatusLabel: Record<ListingStatus, string> = {
  draft: "Borrador",
  pending_review: "En revisión",
  published: "Publicada",
  paused: "Pausada",
  rejected: "No aprobada",
  archived: "Archivada",
};

export const machineStatusHelp: Record<ListingStatus, string> = {
  draft: "Solo tú la ves. Envíala a revisión cuando esté lista.",
  pending_review: "MaquiFly la está revisando. Te avisamos por WhatsApp cuando esté publicada.",
  published: "Visible en la web para todos.",
  paused: "Oculta de la web. Puedes reactivarla cuando quieras.",
  rejected: "Revisa los datos y fotos, y vuelve a enviarla.",
  archived: "Guardada fuera de la web.",
};

/** Traduce los errores más comunes de Supabase Auth a algo entendible. */
export function authErrorMessage(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login")) return "Correo o contraseña incorrectos.";
  if (m.includes("not confirmed"))
    return "Todavía no confirmas tu correo. Revisa tu bandeja (y la carpeta de spam) y abre el enlace que te enviamos.";
  if (m.includes("already registered") || m.includes("already been registered"))
    return "Ese correo ya tiene una cuenta. Inicia sesión o recupera tu contraseña.";
  if (m.includes("password") && (m.includes("at least") || m.includes("short") || m.includes("weak")))
    return "La contraseña es muy débil. Usa al menos 8 caracteres, mezclando letras y números.";
  if (m.includes("rate limit") || m.includes("too many") || m.includes("security purposes"))
    return "Demasiados intentos seguidos. Espera unos minutos y vuelve a probar.";
  if (m.includes("signups not allowed") || m.includes("signup is disabled"))
    return "El registro de cuentas está cerrado por ahora. Escríbenos por WhatsApp.";
  if (m.includes("same_password") || m.includes("different from the old"))
    return "La nueva contraseña tiene que ser distinta de la anterior.";
  if (m.includes("failed to fetch") || m.includes("network"))
    return "No hay conexión. Revisa tu internet y vuelve a intentar.";
  return `No se pudo completar: ${message}`;
}

/** Errores de la base de datos (triggers en español) o genéricos. */
export function dbErrorMessage(message: string): string {
  if (/[áéíóúñ]/i.test(message) || message.startsWith("Tu plan") || message.startsWith("Solo ")) return message;
  if (message.includes("duplicate key") && message.includes("owner_profiles_one_per_user"))
    return "Tu cuenta ya tiene un perfil de propietario.";
  if (message.includes("row-level security")) return "No tienes permiso para hacer ese cambio.";
  return `No se pudo guardar: ${message}`;
}

/**
 * Cupos libres del Programa Socio Fundador, leídos de la vista pública
 * (mismo criterio que /planes y /pagar). null mientras carga.
 */
export function useFounderSlotsLeft(): number | null {
  const [slots, setSlots] = useState<number | null>(null);
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      setSlots(0);
      return;
    }
    let alive = true;
    supabase
      .from("owners_public")
      .select("id", { count: "exact", head: true })
      .not("founder_number", "is", null)
      .then(({ count, error }) => {
        if (alive) setSlots(error ? 0 : Math.max(0, FOUNDER_SLOTS - (count ?? 0)));
      });
    return () => {
      alive = false;
    };
  }, []);
  return slots;
}
