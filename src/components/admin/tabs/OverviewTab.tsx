"use client";

import { useEffect, useState } from "react";
import { FOUNDER_SLOTS } from "@/lib/plans";
import type { Counts, TabKey, TabProps } from "@/components/admin/AdminApp";
import { Card, db, Panel } from "@/components/admin/admin-shared";

type Stats = {
  published: number;
  drafts: number;
  owners: number;
  paid: number;
  founders: number;
};

export function OverviewTab({ counts, goTo }: TabProps & { counts: Counts }) {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    const c = db();
    Promise.all([
      c.from("machines").select("id", { count: "exact", head: true }).eq("status", "published"),
      c.from("machines").select("id", { count: "exact", head: true }).neq("status", "published"),
      c.from("owner_profiles").select("plan, plan_expires_at, founder_number"),
    ]).then(([pub, drafts, owners]) => {
      const rows = owners.data ?? [];
      const now = Date.now();
      setStats({
        published: pub.count ?? 0,
        drafts: drafts.count ?? 0,
        owners: rows.length,
        paid: rows.filter(
          (o) => o.plan !== "start" && o.plan_expires_at && new Date(o.plan_expires_at).getTime() > now,
        ).length,
        founders: rows.filter((o) => o.founder_number !== null).length,
      });
    });
  }, []);

  const pending: Array<{ label: string; value: number; tab: TabKey; hint: string }> = [
    { label: "Mensajes nuevos", value: counts.messages, tab: "messages", hint: "Contacto y solicitudes de información" },
    { label: "Publicaciones por revisar", value: counts.submissions, tab: "submissions", hint: "Enviadas desde «Publicar»" },
    { label: "Pagos por verificar", value: counts.payments, tab: "payments", hint: "Revisa el abono y aprueba" },
    { label: "Reportes abiertos", value: counts.reports, tab: "reports", hint: "Problemas en publicaciones" },
  ];

  return (
    <Panel title="Resumen" description="Lo que necesita tu atención hoy y cómo va MaquiFly.">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {pending.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => goTo(item.tab)}
            className={`rounded-2xl border p-4 text-left transition-shadow hover:shadow-card-hover ${
              item.value > 0 ? "border-volt-500 bg-ink-950 text-white" : "border-steel-200 bg-white text-ink-900"
            }`}
          >
            <p className="text-3xl font-extrabold">{item.value}</p>
            <p className="mt-1 text-sm font-bold">{item.label}</p>
            <p className={`mt-0.5 text-xs ${item.value > 0 ? "text-ink-300" : "text-steel-500"}`}>{item.hint}</p>
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Máquinas publicadas" value={stats?.published} extra={stats ? `${stats.drafts} sin publicar` : ""} />
        <Stat label="Propietarios" value={stats?.owners} />
        <Stat label="Planes de pago activos" value={stats?.paid} extra="Fly Plus y Fly Pro" />
        <Stat
          label="Socios Fundadores"
          value={stats ? `${stats.founders}/${FOUNDER_SLOTS}` : undefined}
          extra={stats ? `Quedan ${FOUNDER_SLOTS - stats.founders} cupos` : ""}
        />
      </div>

      <Card>
        <h3 className="text-sm font-bold uppercase tracking-wider text-steel-500">Atajos</h3>
        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          <button type="button" onClick={() => goTo("machines")} className="rounded-lg bg-brand-600 px-3 py-2 font-semibold text-white hover:bg-brand-700">
            + Publicar una máquina
          </button>
          <button type="button" onClick={() => goTo("owners")} className="rounded-lg border border-steel-300 px-3 py-2 font-semibold text-ink-900 hover:bg-steel-50">
            + Nuevo propietario
          </button>
          <button type="button" onClick={() => goTo("payments")} className="rounded-lg border border-steel-300 px-3 py-2 font-semibold text-ink-900 hover:bg-steel-50">
            + Registrar un pago
          </button>
        </div>
      </Card>
    </Panel>
  );
}

function Stat({ label, value, extra }: { label: string; value: number | string | undefined; extra?: string }) {
  return (
    <Card>
      <p className="text-xs font-semibold uppercase tracking-wider text-steel-500">{label}</p>
      <p className="mt-1 text-2xl font-extrabold text-ink-900">{value ?? "…"}</p>
      {extra && <p className="text-xs text-steel-500">{extra}</p>}
    </Card>
  );
}
