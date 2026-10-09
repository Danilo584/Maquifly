"use client";

import { useEffect, useState, type ComponentType } from "react";
import { FOUNDER_SLOTS, formatPEN } from "@/lib/plans";
import type { Counts, TabKey, TabProps } from "@/components/admin/AdminApp";
import { db, formatDateTime } from "@/components/admin/admin-shared";
import { MiniBarChart } from "@/components/admin/MiniBarChart";
import { fetchMachineStats } from "@/components/admin/tabs/MachinesTab";
import {
  AIconChat,
  AIconEye,
  AIconFlag,
  AIconInbox,
  AIconMachine,
  AIconUpload,
  AIconUsers,
  AIconWallet,
} from "@/components/admin/admin-icons";

type Stats = {
  published: number;
  drafts: number;
  owners: number;
  paid: number;
  founders: number;
  views30: number;
  whatsapp30: number;
  topMachines: Array<{ id: string; name: string; reference: string; views: number; whatsapp: number }>;
};

type Week = { week: string; views: number; whatsapp: number; messages: number; submissions: number };

type Activity = {
  id: string;
  at: string;
  text: string;
  detail: string;
  tab: TabKey;
  Icon: ComponentType<{ size?: number }>;
};

const shortWeek = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString("es-PE", { day: "numeric", month: "short" });

export function OverviewTab({ counts, goTo }: TabProps & { counts: Counts }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [weeks, setWeeks] = useState<Week[] | null>(null);
  const [income, setIncome] = useState<Array<{ label: string; value: number }> | null>(null);
  const [activity, setActivity] = useState<Activity[] | null>(null);

  useEffect(() => {
    const c = db();

    // Indicadores generales + máquinas más vistas
    Promise.all([
      c.from("machines").select("id, name, reference, status"),
      c.from("owner_profiles").select("plan, plan_expires_at, founder_number"),
      fetchMachineStats(30),
    ]).then(([machines, owners, machineStats]) => {
      const rows = owners.data ?? [];
      const list = machines.data ?? [];
      const now = Date.now();
      const statRows = list
        .map((m) => ({ ...m, views: machineStats[m.id]?.views ?? 0, whatsapp: machineStats[m.id]?.whatsapp ?? 0 }))
        .sort((a, b) => b.views + b.whatsapp * 3 - (a.views + a.whatsapp * 3));
      setStats({
        published: list.filter((m) => m.status === "published").length,
        drafts: list.filter((m) => m.status !== "published").length,
        owners: rows.length,
        paid: rows.filter((o) => o.plan !== "start" && o.plan_expires_at && new Date(o.plan_expires_at).getTime() > now).length,
        founders: rows.filter((o) => o.founder_number !== null).length,
        views30: statRows.reduce((s, m) => s + m.views, 0),
        whatsapp30: statRows.reduce((s, m) => s + m.whatsapp, 0),
        topMachines: statRows.filter((m) => m.views + m.whatsapp > 0).slice(0, 5),
      });
    });

    // Serie semanal (si aún no se ejecutó 02-estadisticas.sql, queda vacía)
    c.rpc("weekly_activity", { weeks: 8 }).then(({ data, error }) => {
      setWeeks(
        error || !data
          ? []
          : (data as Week[]).map((w) => ({
              week: w.week,
              views: Number(w.views),
              whatsapp: Number(w.whatsapp),
              messages: Number(w.messages),
              submissions: Number(w.submissions),
            })),
      );
    });

    // Ingresos aprobados por mes (últimos 6 meses)
    const since = new Date();
    since.setMonth(since.getMonth() - 5, 1);
    since.setHours(0, 0, 0, 0);
    c.from("payments")
      .select("amount_pen, reviewed_at, created_at")
      .eq("status", "approved")
      .gte("created_at", since.toISOString())
      .then(({ data }) => {
        const months: Array<{ key: string; label: string; value: number }> = [];
        for (let i = 0; i < 6; i++) {
          const d = new Date(since.getFullYear(), since.getMonth() + i, 1);
          months.push({
            key: `${d.getFullYear()}-${d.getMonth()}`,
            label: d.toLocaleDateString("es-PE", { month: "short", year: "2-digit" }),
            value: 0,
          });
        }
        for (const p of data ?? []) {
          const d = new Date(p.reviewed_at ?? p.created_at);
          const slot = months.find((m) => m.key === `${d.getFullYear()}-${d.getMonth()}`);
          if (slot) slot.value += Number(p.amount_pen);
        }
        setIncome(months.map(({ label, value }) => ({ label, value })));
      });

    // Actividad reciente
    Promise.all([
      c.from("contact_messages").select("id, name, topic, created_at").order("created_at", { ascending: false }).limit(6),
      c.from("listing_submissions").select("id, contact_name, data, created_at").order("created_at", { ascending: false }).limit(6),
      c.from("payments").select("id, product, amount_pen, status, created_at").order("created_at", { ascending: false }).limit(6),
      c.from("machines").select("id, name, created_at").order("created_at", { ascending: false }).limit(6),
      c.from("reports").select("id, reason, created_at").order("created_at", { ascending: false }).limit(6),
    ]).then(([m, s, p, mc, r]) => {
      const items: Activity[] = [
        ...(m.data ?? []).map((x) => ({
          id: `m${x.id}`, at: x.created_at, Icon: AIconInbox, tab: "messages" as TabKey,
          text: `Mensaje de ${x.name}`, detail: x.topic ?? "Contacto",
        })),
        ...(s.data ?? []).map((x) => ({
          id: `s${x.id}`, at: x.created_at, Icon: AIconUpload, tab: "submissions" as TabKey,
          text: `${x.contact_name} envió una publicación`, detail: String((x.data as Record<string, unknown>)?.name ?? ""),
        })),
        ...(p.data ?? []).map((x) => ({
          id: `p${x.id}`, at: x.created_at, Icon: AIconWallet, tab: "payments" as TabKey,
          text: `Pago ${x.status === "approved" ? "aprobado" : x.status === "rejected" ? "rechazado" : "por verificar"}`,
          detail: `${x.product} · ${formatPEN(Number(x.amount_pen))}`,
        })),
        ...(mc.data ?? []).map((x) => ({
          id: `c${x.id}`, at: x.created_at, Icon: AIconMachine, tab: "machines" as TabKey,
          text: "Máquina creada", detail: x.name,
        })),
        ...(r.data ?? []).map((x) => ({
          id: `r${x.id}`, at: x.created_at, Icon: AIconFlag, tab: "reports" as TabKey,
          text: "Nuevo reporte", detail: x.reason,
        })),
      ];
      setActivity(items.sort((a, b) => b.at.localeCompare(a.at)).slice(0, 10));
    });
  }, []);

  const pending: Array<{ label: string; value: number; tab: TabKey; hint: string; Icon: ComponentType<{ size?: number }> }> = [
    { label: "Mensajes nuevos", value: counts.messages, tab: "messages", hint: "Contacto y solicitudes", Icon: AIconInbox },
    { label: "Publicaciones por revisar", value: counts.submissions, tab: "submissions", hint: "Enviadas desde «Publicar»", Icon: AIconUpload },
    { label: "Pagos por verificar", value: counts.payments, tab: "payments", hint: "Revisa el abono y aprueba", Icon: AIconWallet },
    { label: "Reportes abiertos", value: counts.reports, tab: "reports", hint: "Problemas en publicaciones", Icon: AIconFlag },
  ];

  const allClear = pending.every((p) => p.value === 0);

  return (
    <div className="flex flex-col gap-6">
      {/* Bienvenida */}
      <section className="grid-blueprint relative overflow-hidden rounded-2xl bg-ink-950 p-5 text-white sm:p-7">
        <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-brand-700/30 blur-3xl" aria-hidden="true" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-volt-300">Hola de nuevo</p>
            <h2 className="mt-1 text-2xl font-extrabold sm:text-3xl">
              {allClear ? "Todo al día 👌" : "Tienes cosas por atender"}
            </h2>
            <p className="mt-1 max-w-lg text-sm text-ink-200">
              {stats
                ? `${stats.published} máquinas publicadas · ${stats.views30} vistas y ${stats.whatsapp30} clics en WhatsApp en los últimos 30 días.`
                : "Cargando cómo va MaquiFly…"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            <button type="button" onClick={() => goTo("machines")} className="rounded-lg bg-volt-400 px-3.5 py-2 font-bold text-ink-950 hover:bg-volt-300">
              + Publicar máquina
            </button>
            <button type="button" onClick={() => goTo("payments")} className="rounded-lg border border-white/25 px-3.5 py-2 font-semibold text-white hover:bg-white/10">
              + Registrar pago
            </button>
          </div>
        </div>
      </section>

      {/* Pendientes */}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {pending.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => goTo(item.tab)}
            className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition-shadow hover:shadow-card-hover ${
              item.value > 0 ? "border-volt-500 bg-white ring-2 ring-volt-400/60" : "border-steel-200 bg-white"
            }`}
          >
            <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${item.value > 0 ? "bg-volt-400 text-ink-950" : "bg-steel-100 text-steel-500"}`}>
              <item.Icon size={20} />
            </span>
            <span>
              <span className="block text-2xl font-extrabold leading-none text-ink-900">{item.value}</span>
              <span className="mt-1 block text-sm font-bold text-ink-900">{item.label}</span>
              <span className="block text-xs text-steel-500">{item.hint}</span>
            </span>
          </button>
        ))}
      </section>

      {/* Indicadores */}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi Icon={AIconMachine} label="Máquinas publicadas" value={stats?.published} extra={stats ? `${stats.drafts} sin publicar` : ""} />
        <Kpi Icon={AIconUsers} label="Propietarios" value={stats?.owners} extra={stats ? `${stats.paid} con plan de pago` : ""} />
        <Kpi Icon={AIconEye} label="Vistas · 30 días" value={stats?.views30} extra={stats ? `${stats.whatsapp30} clics en WhatsApp` : ""} />
        <Kpi
          Icon={AIconUsers}
          label="Socios Fundadores"
          value={stats ? `${stats.founders}/${FOUNDER_SLOTS}` : undefined}
          extra={stats ? `Quedan ${FOUNDER_SLOTS - stats.founders} cupos` : ""}
          progress={stats ? stats.founders / FOUNDER_SLOTS : undefined}
        />
      </section>

      {/* Gráficos */}
      <section className="grid gap-3 md:grid-cols-2">
        <MiniBarChart
          title="Vistas de máquinas por semana"
          data={(weeks ?? []).map((w) => ({ label: `Sem. ${shortWeek(w.week)}`, value: w.views }))}
          emptyText="Las vistas aparecerán cuando publiques máquinas"
        />
        <MiniBarChart
          title="Clics en WhatsApp por semana"
          data={(weeks ?? []).map((w) => ({ label: `Sem. ${shortWeek(w.week)}`, value: w.whatsapp }))}
          emptyText="Aún nadie tocó WhatsApp en una máquina"
        />
        <MiniBarChart
          title="Mensajes recibidos por semana"
          data={(weeks ?? []).map((w) => ({ label: `Sem. ${shortWeek(w.week)}`, value: w.messages }))}
          emptyText="Aún no llegan mensajes"
        />
        <MiniBarChart
          title="Ingresos por planes (aprobados)"
          data={income ?? []}
          format={(v) => formatPEN(v)}
          emptyText="Aquí verás lo que cobras por planes y destacados"
        />
      </section>

      <section className="grid gap-3 lg:grid-cols-[1.3fr_1fr]">
        {/* Actividad reciente */}
        <div className="rounded-2xl border border-steel-200 bg-white p-4 sm:p-5">
          <h3 className="text-sm font-bold text-ink-900">Actividad reciente</h3>
          {activity === null ? (
            <p className="mt-3 text-sm text-steel-500">Cargando…</p>
          ) : activity.length === 0 ? (
            <p className="mt-3 text-sm text-steel-500">Todavía no hay movimiento. Publica la primera máquina para empezar.</p>
          ) : (
            <ul className="mt-3 flex flex-col">
              {activity.map((a) => (
                <li key={a.id}>
                  <button
                    type="button"
                    onClick={() => goTo(a.tab)}
                    className="flex w-full items-start gap-3 rounded-xl px-2 py-2.5 text-left hover:bg-steel-50"
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-ink-900 text-volt-300">
                      <a.Icon size={16} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-ink-900">{a.text}</span>
                      <span className="block truncate text-xs text-steel-500">{a.detail}</span>
                    </span>
                    <span className="shrink-0 text-xs text-steel-400">{formatDateTime(a.at)}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Máquinas más vistas */}
        <div className="rounded-2xl border border-steel-200 bg-white p-4 sm:p-5">
          <h3 className="text-sm font-bold text-ink-900">Máquinas más vistas · 30 días</h3>
          {!stats ? (
            <p className="mt-3 text-sm text-steel-500">Cargando…</p>
          ) : stats.topMachines.length === 0 ? (
            <p className="mt-3 text-sm text-steel-500">Cuando las máquinas reciban visitas, aquí verás cuáles atraen más clientes.</p>
          ) : (
            <ol className="mt-3 flex flex-col gap-2">
              {stats.topMachines.map((m, i) => (
                <li key={m.id} className="flex items-center gap-3 rounded-xl bg-steel-50 px-3 py-2">
                  <span className="w-5 text-center text-sm font-extrabold text-steel-400">{i + 1}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-ink-900">{m.name}</span>
                    <span className="text-xs text-steel-500">{m.reference}</span>
                  </span>
                  <span className="flex flex-col items-end text-xs font-semibold text-steel-600">
                    <span className="inline-flex items-center gap-1"><AIconEye size={13} /> {m.views}</span>
                    <span className="inline-flex items-center gap-1"><AIconChat size={13} /> {m.whatsapp}</span>
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>
    </div>
  );
}

function Kpi({
  Icon,
  label,
  value,
  extra,
  progress,
}: {
  Icon: ComponentType<{ size?: number }>;
  label: string;
  value: number | string | undefined;
  extra?: string;
  progress?: number;
}) {
  return (
    <div className="rounded-2xl border border-steel-200 bg-white p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-steel-500">{label}</p>
        <span className="text-steel-400"><Icon size={18} /></span>
      </div>
      <p className="mt-1 text-2xl font-extrabold text-ink-900">{value ?? "…"}</p>
      {extra && <p className="text-xs text-steel-500">{extra}</p>}
      {progress !== undefined && (
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-steel-100">
          <div className="h-full rounded-full bg-brand-600" style={{ width: `${Math.round(progress * 100)}%` }} />
        </div>
      )}
    </div>
  );
}
