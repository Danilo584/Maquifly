"use client";

import { useCallback, useEffect, useState } from "react";
import { whatsappUrl } from "@/lib/whatsapp";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import type { TabProps } from "@/components/admin/AdminApp";
import { Card, db, Empty, ErrorNote, formatDateTime, normalizeWhatsapp, Panel } from "@/components/admin/admin-shared";

type Status = "new" | "searching" | "found" | "not_found";

type MachineRequest = {
  id: string;
  category_slug: string | null;
  machine_label: string;
  zone: string;
  start_date: string | null;
  duration: string;
  operator: "con" | "sin" | "indiferente";
  name: string;
  whatsapp: string;
  status: Status;
  admin_note: string | null;
  created_at: string;
};

const statusInfo: Record<Status, { label: string; tone: BadgeTone }> = {
  new: { label: "Nuevo", tone: "volt" },
  searching: { label: "Buscando", tone: "brand" },
  found: { label: "Conseguida", tone: "ok" },
  not_found: { label: "No se pudo", tone: "neutral" },
};

const operatorLabel = {
  con: "Con operador",
  sin: "Sin operador",
  indiferente: "Operador: le da igual",
} as const;

const views = [
  { key: "open", label: "Pendientes" },
  { key: "closed", label: "Cerrados" },
] as const;

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export function RequestsTab({ onChange }: TabProps) {
  const [view, setView] = useState<(typeof views)[number]["key"]>("open");
  const [items, setItems] = useState<MachineRequest[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const open: Status[] = ["new", "searching"];
    const closed: Status[] = ["found", "not_found"];
    const { data, error: err } = await db()
      .from("machine_requests")
      .select("*")
      .in("status", view === "open" ? open : closed)
      .order("created_at", { ascending: false })
      .limit(200);
    if (err) setError(err.message);
    setItems((data as MachineRequest[]) ?? []);
  }, [view]);

  useEffect(() => {
    load();
  }, [load]);

  async function setStatus(id: string, status: Status) {
    const { error: err } = await db().from("machine_requests").update({ status }).eq("id", id);
    if (err) return setError(err.message);
    await load();
    onChange();
  }

  function replyMessage(r: MachineRequest): string {
    return [
      `Hola ${r.name}, te escribimos de MaquiFly por tu pedido de ${r.machine_label.toLowerCase()} en ${r.zone}.`,
      `Estamos buscando opciones para ti.`,
    ].join(" ");
  }

  return (
    <Panel
      title="Pedidos de clientes"
      description="Personas que no encontraron la máquina y pidieron que se la consigas (formulario «Te la conseguimos»). Escríbeles por WhatsApp y actualiza el estado."
      actions={views.map((v) => (
        <button
          key={v.key}
          type="button"
          onClick={() => setView(v.key)}
          className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${
            view === v.key ? "bg-ink-900 text-white" : "border border-steel-300 bg-white text-ink-800"
          }`}
        >
          {v.label}
        </button>
      ))}
    >
      <ErrorNote message={error} />
      {items === null ? (
        <p className="text-sm text-steel-500">Cargando…</p>
      ) : items.length === 0 ? (
        <Empty>
          {view === "open"
            ? "No hay pedidos pendientes. Cuando alguien pida una máquina desde la web, aparecerá aquí."
            : "Todavía no hay pedidos cerrados."}
        </Empty>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((r) => {
            const info = statusInfo[r.status];
            const phone = normalizeWhatsapp(r.whatsapp);
            return (
              <li key={r.id}>
                <Card className={r.status === "new" ? "border-volt-500 ring-1 ring-volt-400" : ""}>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={info.tone} size="sm">{info.label}</Badge>
                    <span className="text-xs text-steel-500">{formatDateTime(r.created_at)}</span>
                  </div>
                  <p className="mt-2 text-lg font-extrabold text-ink-900">
                    {r.machine_label} <span className="font-semibold text-steel-600">· {r.zone}</span>
                  </p>
                  <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-steel-700">
                    <li>
                      <span className="text-steel-500">Desde:</span>{" "}
                      {r.start_date ? formatDate(r.start_date) : "sin fecha"}
                    </li>
                    <li>
                      <span className="text-steel-500">Tiempo:</span> {r.duration}
                    </li>
                    <li>{operatorLabel[r.operator]}</li>
                  </ul>
                  <p className="mt-2 font-semibold text-ink-900">
                    {r.name} · <span className="text-steel-600">{r.whatsapp}</span>
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2 text-sm">
                    <a
                      href={whatsappUrl(phone, replyMessage(r))}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => r.status === "new" && setStatus(r.id, "searching")}
                      className="rounded-lg bg-[#128C7E] px-3 py-1.5 font-semibold text-white hover:bg-[#0f7a6d]"
                    >
                      Escribir por WhatsApp
                    </a>
                    {r.status === "new" && (
                      <button type="button" onClick={() => setStatus(r.id, "searching")} className="rounded-lg border border-steel-300 px-3 py-1.5 font-semibold text-ink-800 hover:bg-steel-50">
                        Marcar «Buscando»
                      </button>
                    )}
                    {view === "open" ? (
                      <>
                        <button type="button" onClick={() => setStatus(r.id, "found")} className="rounded-lg border border-ok-500/40 bg-ok-50 px-3 py-1.5 font-semibold text-ok-700 hover:bg-ok-500/15">
                          Conseguida
                        </button>
                        <button type="button" onClick={() => setStatus(r.id, "not_found")} className="rounded-lg border border-steel-300 px-3 py-1.5 font-semibold text-steel-600 hover:bg-steel-50">
                          No se pudo
                        </button>
                      </>
                    ) : (
                      <button type="button" onClick={() => setStatus(r.id, "searching")} className="rounded-lg border border-steel-300 px-3 py-1.5 font-semibold text-steel-600 hover:bg-steel-50">
                        Reabrir
                      </button>
                    )}
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}
