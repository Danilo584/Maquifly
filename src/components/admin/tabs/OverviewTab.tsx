"use client";

import { useEffect, useState, type ComponentType, type ReactNode } from "react";
import { FOUNDER_SLOTS, formatPEN } from "@/lib/plans";
import { siteConfig } from "@/lib/site";
import type { Counts, TabKey, TabProps } from "@/components/admin/AdminApp";
import { db, formatDateTime } from "@/components/admin/admin-shared";
import { fetchMachineStats } from "@/components/admin/tabs/MachinesTab";
import {
  AIconFlag,
  AIconInbox,
  AIconMachine,
  AIconSearch,
  AIconUpload,
  AIconWallet,
} from "@/components/admin/admin-icons";

/**
 * RESUMEN DEL PANEL
 * ---------------------------------------------------------------------------
 * Estilo «marfil + azul marino + dorado» (inspirado en VaultLine): el dorado
 * se reserva para el dinero y lo premium (ingresos, Socios Fundadores, semana
 * actual); el verde lima marca lo nuevo por atender.
 */

type Stats = {
  published: number;
  drafts: number;
  owners: number;
  paid: number;
  founders: number;
  topMachines: Array<{ id: string; name: string; owner: string; views: number; whatsapp: number }>;
};

type Week = { week: string; views: number; whatsapp: number; requests: number };

type Month = { key: string; label: string; value: number; plans: number; boosts: number };

type ActivityKind = "request" | "message" | "submission" | "payment" | "machine" | "report";

type Activity = { id: string; at: string; kind: ActivityKind; title: string; text: string; detail: string; tab: TabKey };

const kindStyle: Record<ActivityKind, { box: string; Icon: ComponentType<{ size?: number }> }> = {
  request: { box: "bg-volt-200 text-volt-900", Icon: AIconSearch },
  message: { box: "bg-ink-50 text-ink-700", Icon: AIconInbox },
  submission: { box: "bg-brand-50 text-brand-700", Icon: AIconUpload },
  payment: { box: "bg-[#fbf3dd] text-[#8a6a12]", Icon: AIconWallet },
  machine: { box: "bg-[#e3f6f3] text-[#0c6659]", Icon: AIconMachine },
  report: { box: "bg-danger-50 text-danger-700", Icon: AIconFlag },
};

const LINE = "border-[#e8e4da]";
const SOFT = "border-[#f1eee6]";
const CARD = `min-w-0 rounded-2xl border ${LINE} bg-white shadow-[0_1px_2px_rgba(7,22,40,0.04),0_12px_30px_-26px_rgba(7,22,40,0.35)]`;

const shortDate = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString("es-PE", { day: "numeric", month: "short" });

/** Lunes (UTC) de la semana de una fecha, como lo agrupa date_trunc('week'). */
function mondayUTC(iso: string): string {
  const d = new Date(iso);
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  return d.toISOString().slice(0, 10);
}

function greeting(): string {
  const h = Number(new Date().toLocaleString("en-US", { hour: "numeric", hour12: false, timeZone: "America/Lima" }));
  return h < 12 ? "Buenos días" : h < 19 ? "Buenas tardes" : "Buenas noches";
}

export function OverviewTab({ counts, goTo }: TabProps & { counts: Counts }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [weeks, setWeeks] = useState<Week[] | null>(null);
  const [months, setMonths] = useState<Month[] | null>(null);
  const [activity, setActivity] = useState<Activity[] | null>(null);

  useEffect(() => {
    const c = db();

    // Indicadores + máquinas más vistas
    Promise.all([
      c.from("machines").select("id, name, status, owner_id"),
      c.from("owner_profiles").select("id, business_name, plan, plan_expires_at, founder_number"),
      fetchMachineStats(30),
    ]).then(([machines, owners, machineStats]) => {
      const rows = owners.data ?? [];
      const list = machines.data ?? [];
      const now = Date.now();
      const ownerName = new Map(rows.map((o) => [o.id as string, o.business_name as string]));
      const ranked = list
        .map((m) => ({
          id: m.id as string,
          name: m.name as string,
          owner: ownerName.get(m.owner_id) ?? "",
          views: machineStats[m.id]?.views ?? 0,
          whatsapp: machineStats[m.id]?.whatsapp ?? 0,
        }))
        .filter((m) => m.views + m.whatsapp > 0)
        .sort((a, b) => b.views - a.views || b.whatsapp - a.whatsapp);
      setStats({
        published: list.filter((m) => m.status === "published").length,
        drafts: list.filter((m) => m.status !== "published" && m.status !== "archived").length,
        owners: rows.length,
        paid: rows.filter((o) => o.plan !== "start" && o.plan_expires_at && new Date(o.plan_expires_at).getTime() > now).length,
        founders: rows.filter((o) => o.founder_number !== null).length,
        topMachines: ranked.slice(0, 5),
      });
    });

    // Serie semanal: vistas y WhatsApp (weekly_activity) + pedidos de clientes.
    const since = new Date(Date.now() - 8 * 7 * 864e5).toISOString();
    Promise.all([
      c.rpc("weekly_activity", { weeks: 8 }),
      c.from("machine_requests").select("created_at").gte("created_at", since),
    ]).then(([w, r]) => {
      const perWeek = new Map<string, number>();
      for (const x of r.data ?? []) {
        const k = mondayUTC(x.created_at as string);
        perWeek.set(k, (perWeek.get(k) ?? 0) + 1);
      }
      setWeeks(
        w.error || !w.data
          ? []
          : (w.data as Array<Record<string, unknown>>).map((row) => ({
              week: String(row.week),
              views: Number(row.views),
              whatsapp: Number(row.whatsapp),
              requests: perWeek.get(String(row.week)) ?? 0,
            })),
      );
    });

    // Ingresos aprobados por mes (últimos 6 meses), separando planes y destacados.
    const from = new Date();
    from.setMonth(from.getMonth() - 5, 1);
    from.setHours(0, 0, 0, 0);
    c.from("payments")
      .select("amount_pen, product, reviewed_at, created_at")
      .eq("status", "approved")
      .gte("created_at", new Date(from.getTime() - 31 * 864e5).toISOString())
      .then(({ data }) => {
        const list: Month[] = [];
        for (let i = 0; i < 6; i++) {
          const d = new Date(from.getFullYear(), from.getMonth() + i, 1);
          list.push({
            key: `${d.getFullYear()}-${d.getMonth()}`,
            label: d.toLocaleDateString("es-PE", { month: "short" }).replace(".", ""),
            value: 0,
            plans: 0,
            boosts: 0,
          });
        }
        for (const p of data ?? []) {
          const d = new Date((p.reviewed_at ?? p.created_at) as string);
          const slot = list.find((m) => m.key === `${d.getFullYear()}-${d.getMonth()}`);
          if (!slot) continue;
          slot.value += Number(p.amount_pen);
          if (p.product === "destacado-7") slot.boosts += 1;
          else slot.plans += 1;
        }
        setMonths(list);
      });

    // Actividad reciente
    Promise.all([
      c.from("machine_requests").select("id, machine_label, zone, name, created_at").order("created_at", { ascending: false }).limit(6),
      c.from("contact_messages").select("id, name, topic, message, created_at").order("created_at", { ascending: false }).limit(6),
      c.from("listing_submissions").select("id, contact_name, data, created_at").order("created_at", { ascending: false }).limit(6),
      c.from("payments").select("id, product, amount_pen, status, created_at").order("created_at", { ascending: false }).limit(6),
      c.from("machines").select("id, name, status, created_at").order("created_at", { ascending: false }).limit(6),
      c.from("reports").select("id, reason, created_at").order("created_at", { ascending: false }).limit(6),
    ]).then(([q, m, s, p, mc, r]) => {
      const productName: Record<string, string> = { "fly-plus": "Fly Plus", "fly-pro": "Fly Pro", "destacado-7": "Destacado 7 días" };
      const items: Activity[] = [
        ...(q.data ?? []).map((x) => ({
          id: `q${x.id}`, at: x.created_at, kind: "request" as const, tab: "requests" as TabKey,
          title: "Pedido", text: `${x.machine_label} en ${x.zone}`, detail: x.name,
        })),
        ...(m.data ?? []).map((x) => ({
          id: `m${x.id}`, at: x.created_at, kind: "message" as const, tab: "messages" as TabKey,
          title: "Mensaje", text: `«${String(x.message).slice(0, 60)}${String(x.message).length > 60 ? "…" : ""}»`, detail: x.name,
        })),
        ...(s.data ?? []).map((x) => ({
          id: `s${x.id}`, at: x.created_at, kind: "submission" as const, tab: "submissions" as TabKey,
          title: "Publicación recibida", text: String((x.data as Record<string, unknown>)?.name ?? "Máquina"), detail: x.contact_name,
        })),
        ...(p.data ?? []).map((x) => ({
          id: `p${x.id}`, at: x.created_at, kind: "payment" as const, tab: "payments" as TabKey,
          title: x.status === "approved" ? "Pago aprobado" : x.status === "rejected" ? "Pago rechazado" : "Pago por verificar",
          text: `${productName[x.product] ?? x.product} · ${formatPEN(Number(x.amount_pen))}`, detail: "",
        })),
        ...(mc.data ?? []).map((x) => ({
          id: `c${x.id}`, at: x.created_at, kind: "machine" as const, tab: "machines" as TabKey,
          title: x.status === "pending_review" ? "Máquina por revisar" : "Máquina creada", text: x.name, detail: "",
        })),
        ...(r.data ?? []).map((x) => ({
          id: `r${x.id}`, at: x.created_at, kind: "report" as const, tab: "reports" as TabKey,
          title: "Reporte", text: x.reason, detail: "",
        })),
      ];
      setActivity(items.sort((a, b) => b.at.localeCompare(a.at)).slice(0, 7));
    });
  }, []);

  // Orden de prioridad: primero lo que trae dinero o clientes.
  const pending: Array<{ label: string; value: number; tab: TabKey; hint: string; zeroHint: string }> = [
    { label: "Pedidos de clientes", value: counts.requests, tab: "requests", hint: "Buscan una máquina", zeroHint: "Ninguno pendiente" },
    { label: "Pagos por verificar", value: counts.payments, tab: "payments", hint: "Revisa el abono y aprueba", zeroHint: "Al día" },
    { label: "Máquinas por revisar", value: counts.machines, tab: "machines", hint: "Enviadas desde una cuenta", zeroHint: "Ninguna" },
    { label: "Publicaciones recibidas", value: counts.submissions, tab: "submissions", hint: "Enviadas desde «Publicar»", zeroHint: "Ninguna" },
    { label: "Mensajes", value: counts.messages, tab: "messages", hint: "Contacto y solicitudes", zeroHint: "Bandeja vacía" },
    { label: "Reportes", value: counts.reports, tab: "reports", hint: "Problemas en publicaciones", zeroHint: "Todo en orden" },
  ];
  const totalPending = pending.reduce((s, p) => s + p.value, 0);
  const first = pending.find((p) => p.value > 0);

  const thisMonth = months?.[5];
  const lastMonth = months?.[4];
  const monthDelta = thisMonth && lastMonth ? thisMonth.value - lastMonth.value : null;
  const sixMonths = months?.reduce((s, m) => s + m.value, 0) ?? 0;
  const monthName = new Date().toLocaleDateString("es-PE", { month: "long" });
  const today = new Date().toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long", timeZone: "America/Lima" });

  return (
    <div className="flex flex-col gap-5">
      {/* Saludo --------------------------------------------------------- */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-steel-500">{today}</p>
          <h2 className="mt-1.5 text-[1.75rem] font-extrabold leading-tight tracking-tight text-ink-900 sm:text-[2rem]">
            {greeting()}, {siteConfig.adminName}
          </h2>
          <p className="mt-1 text-sm text-steel-600">
            {totalPending === 0 ? (
              "Todo al día 👌 No hay nada pendiente."
            ) : (
              <>
                Tienes <b className="text-ink-900">{totalPending} {totalPending === 1 ? "cosa" : "cosas"} por atender</b>
                {first ? `. Empieza por ${first.label.toLowerCase()}.` : "."}
              </>
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          <button type="button" onClick={() => goTo("machines")} className="rounded-lg bg-ink-900 px-3.5 py-2 font-semibold text-white hover:bg-ink-800">
            + Publicar máquina
          </button>
          <button type="button" onClick={() => goTo("payments")} className={`rounded-lg border ${LINE} bg-white px-3.5 py-2 font-semibold text-ink-900 hover:bg-[#f6f3ea]`}>
            + Registrar pago
          </button>
        </div>
      </section>

      {/* Por atender ---------------------------------------------------- */}
      <section className={`${CARD} grid grid-cols-2 overflow-hidden sm:grid-cols-3 xl:grid-cols-6`} aria-label="Por atender">
        {pending.map((item) => {
          const hot = item.value > 0;
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => goTo(item.tab)}
              className={`relative border-b border-r ${SOFT} px-4 py-4 text-left transition-colors hover:bg-[#fbfaf6]`}
            >
              {hot && <span className="absolute inset-y-3.5 left-0 w-[3px] rounded-r bg-volt-400" aria-hidden="true" />}
              <span className="flex items-center gap-2">
                <span className={`font-display text-[1.75rem] font-extrabold leading-none tracking-tight ${hot ? "text-ink-900" : "text-[#c3cbd6]"}`}>
                  {item.value}
                </span>
                {hot && (
                  <span className="rounded-[5px] bg-volt-400 px-1.5 py-0.5 text-[0.6rem] font-extrabold uppercase tracking-[0.08em] text-ink-950">
                    Nuevo
                  </span>
                )}
              </span>
              <span className="mt-1.5 block text-[0.82rem] font-bold text-ink-900">{item.label}</span>
              <span className="block text-xs text-steel-500">{hot ? item.hint : item.zeroHint}</span>
            </button>
          );
        })}
      </section>

      {/* Indicadores ---------------------------------------------------- */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-[1.25fr_1fr_1fr_1fr]">
        <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-ink-800 to-ink-900 p-5 text-white">
          <span className="absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-transparent via-[#e6b94f] to-transparent" aria-hidden="true" />
          <p className="text-sm font-semibold text-ink-200">Ingresos de {monthName}</p>
          <p className="mt-3 font-display text-[2.4rem] font-extrabold leading-none tracking-tight text-[#f5d27a] tabular-nums">
            {thisMonth ? formatPEN(thisMonth.value) : "…"}
          </p>
          <p className="mt-2.5 text-xs text-ink-300">
            {monthDelta !== null && (
              <span className={`font-semibold ${monthDelta > 0 ? "text-volt-400" : monthDelta < 0 ? "text-danger-500" : "text-ink-200"}`}>
                {monthDelta > 0 ? "▲" : monthDelta < 0 ? "▼" : "●"} {formatPEN(Math.abs(monthDelta))}
              </span>
            )}{" "}
            {lastMonth && <>vs. {lastMonth.label}</>}
            {thisMonth && (thisMonth.plans > 0 || thisMonth.boosts > 0) && (
              <> · {thisMonth.plans} {thisMonth.plans === 1 ? "plan" : "planes"} y {thisMonth.boosts} {thisMonth.boosts === 1 ? "destacado" : "destacados"}</>
            )}
          </p>
        </div>
        <Kpi label="Máquinas publicadas" value={stats?.published} extra={stats ? `${stats.drafts} sin publicar todavía` : ""} />
        <Kpi label="Propietarios" value={stats?.owners} extra={stats ? `${stats.paid} con plan de pago` : ""} />
        <Kpi
          label="Socios Fundadores"
          value={
            stats ? (
              <>
                {stats.founders}
                <span className="text-xl text-[#9aa6b5]">/{FOUNDER_SLOTS}</span>
              </>
            ) : undefined
          }
          extra={stats ? `Quedan ${Math.max(0, FOUNDER_SLOTS - stats.founders)} cupos` : ""}
        >
          {stats && (
            <div className="mt-3 flex gap-1" aria-hidden="true">
              {Array.from({ length: FOUNDER_SLOTS }, (_, i) => (
                <i key={i} className={`h-1.5 flex-1 rounded-sm ${i < stats.founders ? "bg-linear-to-r from-[#e6b94f] to-[#c49a2a]" : "bg-[#f1eee6]"}`} />
              ))}
            </div>
          )}
        </Kpi>
      </section>

      {/* Gráficos ------------------------------------------------------- */}
      <section className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className={`${CARD} p-5`}>
          <h3 className="text-base font-extrabold text-ink-900">Movimiento de la web</h3>
          <p className="mt-0.5 text-xs text-steel-500">Vistas, toques en WhatsApp y pedidos · 8 semanas</p>
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-steel-500">
            <Legend color="bg-ink-900">Vistas</Legend>
            <Legend color="bg-[#128C7E]">Toques en WhatsApp</Legend>
            <Legend color="bg-volt-400 ring-1 ring-volt-600/40">Pedidos de clientes</Legend>
            <Legend color="bg-[#c49a2a]">Semana actual</Legend>
          </div>
          <WeeklyChart weeks={weeks} />
        </div>

        <div className={`${CARD} p-5`}>
          <h3 className="text-base font-extrabold text-ink-900">Ingresos por mes</h3>
          <p className="mt-0.5 text-xs text-steel-500">Planes y destacados aprobados</p>
          <p className="mt-3 font-display text-3xl font-extrabold text-[#3b2a05] tabular-nums">
            {months ? formatPEN(sixMonths) : "…"}
            <span className="ml-2 font-sans text-xs font-semibold text-steel-500">en los últimos 6 meses</span>
          </p>
          {months && (
            <div className="mt-4 flex h-32 items-end gap-2.5">
              {months.map((m, i) => {
                const max = Math.max(1, ...months.map((x) => x.value));
                const now = i === months.length - 1;
                return (
                  <div key={m.key} className="flex flex-1 flex-col items-center gap-1.5" title={`${m.label}: ${formatPEN(m.value)}`}>
                    <i
                      className={`block w-full rounded-t-md ${now ? "bg-linear-to-b from-[#e6b94f] to-[#c49a2a]" : "bg-[#efe6cc]"}`}
                      style={{ height: Math.max(3, (m.value / max) * 100) }}
                    />
                    <span className="text-[0.68rem] text-steel-500">{m.label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Actividad + ranking ------------------------------------------- */}
      <section className="grid gap-4 lg:grid-cols-2">
        <div className={`${CARD} p-5`}>
          <h3 className="text-base font-extrabold text-ink-900">Actividad reciente</h3>
          <p className="mt-0.5 text-xs text-steel-500">Lo último que pasó en MaquiFly</p>
          {activity === null ? (
            <p className="mt-4 text-sm text-steel-500">Cargando…</p>
          ) : activity.length === 0 ? (
            <p className="mt-4 text-sm text-steel-500">Todavía no hay movimiento. Publica la primera máquina para empezar.</p>
          ) : (
            <ul className="mt-2">
              {activity.map((a) => {
                const k = kindStyle[a.kind];
                return (
                  <li key={a.id} className={`border-b ${SOFT} last:border-0`}>
                    <button type="button" onClick={() => goTo(a.tab)} className="flex w-full items-start gap-3 rounded-lg py-2.5 text-left hover:bg-[#fbfaf6]">
                      <span className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${k.box}`}>
                        <k.Icon size={16} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm text-ink-900">
                          <b>{a.title}:</b> {a.text}
                        </span>
                        <span className="block truncate text-xs text-steel-500">
                          {formatDateTime(a.at)}
                          {a.detail ? ` · ${a.detail}` : ""}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className={`${CARD} p-5`}>
          <h3 className="text-base font-extrabold text-ink-900">Máquinas más vistas</h3>
          <p className="mt-0.5 text-xs text-steel-500">Últimos 30 días</p>
          {!stats ? (
            <p className="mt-4 text-sm text-steel-500">Cargando…</p>
          ) : stats.topMachines.length === 0 ? (
            <p className="mt-4 text-sm text-steel-500">Cuando las máquinas reciban visitas, aquí verás cuáles atraen más clientes.</p>
          ) : (
            <table className="mt-3 w-full text-sm">
              <thead>
                <tr className={`border-b ${LINE} text-left text-[0.66rem] uppercase tracking-[0.1em] text-steel-500`}>
                  <th scope="col" className="py-2 pr-2 font-bold">#</th>
                  <th scope="col" className="py-2 pr-2 font-bold">Máquina</th>
                  <th scope="col" className="py-2 pr-2 text-right font-bold">Vistas</th>
                  <th scope="col" className="py-2 text-right font-bold">WhatsApp</th>
                </tr>
              </thead>
              <tbody>
                {stats.topMachines.map((m, i) => (
                  <tr key={m.id} className={`border-b ${SOFT} last:border-0`}>
                    <td className="py-2.5 pr-2 font-display text-xs font-extrabold text-[#c49a2a]">{String(i + 1).padStart(2, "0")}</td>
                    <td className="py-2.5 pr-2">
                      <span className="block font-display font-bold text-ink-900">{m.name}</span>
                      <span className="block text-xs text-steel-500">{m.owner}</span>
                    </td>
                    <td className="py-2.5 pr-2 text-right tabular-nums">{m.views}</td>
                    <td className="py-2.5 text-right tabular-nums">{m.whatsapp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}

function Legend({ color, children }: { color: string; children: ReactNode }) {
  return (
    <span className="flex items-center gap-1.5">
      <i className={`size-2.5 rounded-[3px] ${color}`} />
      {children}
    </span>
  );
}

function Kpi({
  label,
  value,
  extra,
  children,
}: {
  label: string;
  value: ReactNode | number | undefined;
  extra?: string;
  children?: ReactNode;
}) {
  return (
    <div className={`${CARD} p-5`}>
      <p className="text-sm font-semibold text-steel-600">{label}</p>
      <p className="mt-3 font-display text-[2.2rem] font-extrabold leading-none tracking-tight text-ink-900 tabular-nums">
        {value ?? "…"}
      </p>
      {children}
      {extra && <p className="mt-2.5 text-xs text-steel-500">{extra}</p>}
    </div>
  );
}

function WeeklyChart({ weeks }: { weeks: Week[] | null }) {
  if (weeks === null) return <p className="py-16 text-center text-sm text-steel-500">Cargando…</p>;
  const empty = weeks.every((w) => w.views + w.whatsapp + w.requests === 0);
  if (empty) return <p className="py-16 text-center text-sm text-steel-500">Las vistas aparecerán cuando las máquinas reciban visitas.</p>;
  const max = Math.max(1, ...weeks.map((w) => Math.max(w.views, w.whatsapp, w.requests)));
  const H = 160;
  return (
    <figure className="relative mt-4">
      <div
        className={`flex items-end gap-2 border-b ${LINE} px-1 sm:gap-3`}
        style={{ height: H, backgroundImage: "repeating-linear-gradient(0deg, transparent 0 39px, #f1eee6 39px 40px)" }}
        aria-hidden="true"
      >
        {weeks.map((w, i) => {
          const now = i === weeks.length - 1;
          const h = (v: number) => Math.max(2, (v / max) * (H - 8));
          return (
            <div
              key={w.week}
              className="flex flex-1 items-end justify-center gap-[3px]"
              title={`${shortDate(w.week)}: ${w.views} vistas, ${w.whatsapp} toques, ${w.requests} pedidos`}
            >
              <i className={`block w-2 rounded-t-[4px] sm:w-3.5 ${now ? "bg-linear-to-b from-[#e6b94f] to-[#c49a2a]" : "bg-ink-900"}`} style={{ height: h(w.views) }} />
              <i className="block w-2 rounded-t-[4px] bg-[#128C7E] sm:w-3.5" style={{ height: h(w.whatsapp) }} />
              <i className="block w-2 rounded-t-[4px] bg-volt-400 sm:w-3.5" style={{ height: h(w.requests) }} />
            </div>
          );
        })}
      </div>
      <div className="flex gap-2 px-1 pt-2 sm:gap-3" aria-hidden="true">
        {weeks.map((w) => (
          <span key={w.week} className="flex-1 text-center text-[0.66rem] text-steel-500">
            {shortDate(w.week)}
          </span>
        ))}
      </div>
      <div className="sr-only">
      <table>
        <caption>Vistas, toques en WhatsApp y pedidos por semana</caption>
        <thead><tr><th>Semana</th><th>Vistas</th><th>Toques</th><th>Pedidos</th></tr></thead>
        <tbody>
          {weeks.map((w) => (
            <tr key={w.week}><td>{shortDate(w.week)}</td><td>{w.views}</td><td>{w.whatsapp}</td><td>{w.requests}</td></tr>
          ))}
        </tbody>
      </table>
      </div>
    </figure>
  );
}
