"use client";

import type { ReactNode } from "react";
import { getSupabase } from "@/lib/supabase";
import { locations } from "@/lib/data/locations";

/** Cliente de Supabase garantizado dentro del panel (solo se monta si existe). */
export function db() {
  const client = getSupabase();
  if (!client) throw new Error("Supabase no está configurado");
  return client;
}

/** Slug legible y único: "minicargador-bobcat-castilla-k3f9". */
export function makeSlug(...parts: Array<string | null | undefined>): string {
  const base = parts
    .filter(Boolean)
    .join(" ")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return `${base}-${Math.random().toString(36).slice(2, 6)}`;
}

/** Deja un WhatsApp peruano como 51XXXXXXXXX. */
export function normalizeWhatsapp(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 9 && digits.startsWith("9")) return `51${digits}`;
  return digits;
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("es-PE", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const piuraDistricts = locations.find((l) => l.id === "loc-piura")?.districts ?? [];

export function Panel({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-ink-900 sm:text-2xl">{title}</h2>
          {description && <p className="mt-1 max-w-2xl text-sm text-steel-600">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
      {children}
    </section>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-steel-300 bg-white px-6 py-12 text-center text-sm text-steel-500">
      {children}
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-steel-200 bg-white p-4 sm:p-5 ${className}`}>{children}</div>
  );
}

/** Ventana modal simple para editores. */
export function Modal({
  title,
  onClose,
  children,
  wide = false,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-60 flex items-end justify-center sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-ink-950/60" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative max-h-[94dvh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 shadow-pop sm:rounded-2xl sm:p-6 ${
          wide ? "max-w-3xl" : "max-w-lg"
        }`}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <h2 className="text-lg font-extrabold text-ink-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-lg px-2 py-1 text-xl leading-none text-steel-500 hover:bg-steel-100"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function ErrorNote({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-lg border border-danger-500/30 bg-danger-50 px-3 py-2 text-sm text-danger-700">
      {message}
    </p>
  );
}
