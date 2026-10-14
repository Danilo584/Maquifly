"use client";

import { getSupabase } from "@/lib/supabase";

/**
 * Estadísticas por máquina (tabla machine_events). Solo se cuentan máquinas
 * reales, y cada visitante suma UNA vista por máquina por sesión del
 * navegador, para que recargar la página no infle los números.
 */
export function trackMachineEvent(machineId: string, kind: "view" | "whatsapp") {
  const supabase = getSupabase();
  if (!supabase) return;

  if (kind === "view") {
    const key = `maquifly:viewed:${machineId}`;
    try {
      if (window.sessionStorage.getItem(key)) return;
      window.sessionStorage.setItem(key, "1");
    } catch {
      /* sin almacenamiento: se cuenta igual */
    }
  }

  supabase
    .from("machine_events")
    .insert({ machine_id: machineId, kind })
    .then(({ error }) => {
      if (error && process.env.NODE_ENV !== "production") console.warn("[MaquiFly] evento:", error.message);
    });
}

/**
 * Visita al perfil público de un propietario (tabla owner_events). Una por
 * sesión del navegador. La base de datos descarta las del propio dueño y
 * las del admin (supabase/03-cuentas.sql).
 */
export function trackOwnerView(ownerId: string) {
  const supabase = getSupabase();
  if (!supabase) return;

  const key = `maquifly:owner-viewed:${ownerId}`;
  try {
    if (window.sessionStorage.getItem(key)) return;
    window.sessionStorage.setItem(key, "1");
  } catch {
    /* sin almacenamiento: se cuenta igual */
  }

  supabase
    .from("owner_events")
    .insert({ owner_id: ownerId })
    .then(({ error }) => {
      if (error && process.env.NODE_ENV !== "production") console.warn("[MaquiFly] visita de perfil:", error.message);
    });
}
