"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import type { TabProps } from "@/components/admin/AdminApp";
import { Card, db, Empty, ErrorNote, formatDateTime, Panel } from "@/components/admin/admin-shared";

const reasonLabels: Record<string, string> = {
  false_info: "Información falsa",
  wrong_price: "Precio incorrecto",
  not_available: "No disponible",
  inappropriate: "Contenido inapropiado",
  possible_scam: "Posible estafa",
  other: "Otro",
};

type Report = {
  id: string;
  reason: string;
  comment: string;
  reporter_contact: string | null;
  status: "open" | "reviewing" | "resolved" | "dismissed";
  created_at: string;
  machine: { reference: string; name: string; slug: string } | null;
};

export function ReportsTab({ onChange }: TabProps) {
  const [items, setItems] = useState<Report[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data, error: err } = await db()
      .from("reports")
      .select("id, reason, comment, reporter_contact, status, created_at, machine:machines(reference, name, slug)")
      .order("created_at", { ascending: false })
      .limit(200);
    if (err) setError(err.message);
    setItems((data as unknown as Report[]) ?? []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function setStatus(id: string, status: Report["status"]) {
    const { error: err } = await db().from("reports").update({ status }).eq("id", id);
    if (err) return setError(err.message);
    await load();
    onChange();
  }

  return (
    <Panel title="Reportes" description="Avisos de los visitantes sobre publicaciones con problemas. Revisa la máquina y marca el reporte como resuelto o descartado.">
      <ErrorNote message={error} />
      {items === null ? (
        <p className="text-sm text-steel-500">Cargando…</p>
      ) : items.length === 0 ? (
        <Empty>No hay reportes. ¡Bien!</Empty>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((r) => (
            <li key={r.id}>
              <Card>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={r.status === "open" ? "warn" : "neutral"} size="sm">
                    {r.status === "open" ? "Abierto" : r.status === "resolved" ? "Resuelto" : r.status === "dismissed" ? "Descartado" : "En revisión"}
                  </Badge>
                  <span className="text-sm font-bold text-ink-900">{reasonLabels[r.reason] ?? r.reason}</span>
                  <span className="text-xs text-steel-500">{formatDateTime(r.created_at)}</span>
                </div>
                {r.machine && (
                  <a href={`/maquina/${r.machine.slug}`} target="_blank" rel="noopener noreferrer" className="mt-1 block text-sm font-semibold text-brand-700 hover:underline">
                    {r.machine.reference} · {r.machine.name}
                  </a>
                )}
                {r.comment && <p className="mt-2 text-sm text-steel-700">{r.comment}</p>}
                {r.reporter_contact && <p className="mt-1 text-xs text-steel-500">Contacto: {r.reporter_contact}</p>}
                {r.status === "open" && (
                  <div className="mt-3 flex gap-2 text-sm">
                    <button type="button" onClick={() => setStatus(r.id, "resolved")} className="rounded-lg bg-ok-500 px-3 py-1.5 font-semibold text-white">
                      Resuelto
                    </button>
                    <button type="button" onClick={() => setStatus(r.id, "dismissed")} className="rounded-lg border border-steel-300 px-3 py-1.5 font-semibold text-steel-600">
                      Descartar
                    </button>
                  </div>
                )}
              </Card>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
