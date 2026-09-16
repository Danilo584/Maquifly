"use client";

/**
 * Capa de analítica.
 * ---------------------------------------------------------------------------
 * Todos los eventos de negocio pasan por aquí, así que integrar Google
 * Analytics 4 (o Plausible, o Umami) es implementar un único `send`.
 *
 * Estado actual: los eventos se emiten a `dataLayer` si existe y se registran
 * en consola en desarrollo. NO hay ningún proveedor conectado todavía; no se
 * está recogiendo ningún dato. Ver README → "Qué falta conectar".
 */

export type AnalyticsEvent =
  | { name: "search_submit"; query: string; category?: string; location?: string }
  | { name: "filter_apply"; filter: string; value: string }
  | { name: "machine_view"; machineId: string; reference: string }
  | { name: "whatsapp_click"; machineId: string; reference: string; ownerId: string }
  | { name: "contact_form_submit"; context: string }
  | { name: "listing_draft_saved"; categorySlug: string }
  | { name: "listing_preview"; categorySlug: string }
  | { name: "report_submit"; machineId: string; reason: string }
  | { name: "review_submit"; machineId: string };

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

export function track(event: AnalyticsEvent): void {
  if (typeof window === "undefined") return;

  const payload = { event: event.name, ...event };

  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push(payload);
  }

  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.info("[MaquiFly analytics]", payload);
  }
}
