"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { plans } from "@/lib/plans";
import { getSupabase } from "@/lib/supabase";
import { effectivePlan, type MyMachine, type MyOwner } from "@/lib/account";
import { Callout } from "@/components/ui/Callout";
import { LinkButton } from "@/components/ui/Button";
import { IconUser, IconWhatsApp } from "@/components/ui/Icon";
import { AIconEye } from "@/components/admin/admin-icons";

export type Totals = { views: number; whatsapp: number; profile_views: number };

type MachineStat = { machine_id: string; views: number; whatsapp: number };
type WeekStat = { week: string; views: number; whatsapp: number; profile_views: number };

const RANGES = [7, 30, 90] as const;
type Range = (typeof RANGES)[number];

const toTotals = (row: Record<string, unknown> | undefined): Totals => ({
  views: Number(row?.views ?? 0),
  whatsapp: Number(row?.whatsapp ?? 0),
  profile_views: Number(row?.profile_views ?? 0),
});

const fmt = (n: number) => n.toLocaleString("es-PE");

/** «De cada 100 que ven, cuántos tocan WhatsApp». null si no hay vistas. */
function contactRate(views: number, whatsapp: number): number | null {
  return views > 0 ? Math.round((whatsapp / views) * 100) : null;
}

/**
 * ESTADÍSTICAS DEL PROPIETARIO
 * ---------------------------------------------------------------------------
 * Números reales de machine_events y owner_events. No cuentan las visitas del
 * propio dueño ni las del equipo de MaquiFly, y cada visitante suma una vista
 * por máquina por sesión.
 *
 * Todos los planes ven sus totales. La comparación con el periodo anterior,
 * el gráfico semanal y el detalle por máquina son el «reporte de visitas y
 * contactos» de Fly Plus y Fly Pro; la propia base de datos los devuelve
 * vacíos en Fly Start.
 *
 * Estilo: marfil + azul marino + dorado solo para lo premium (inspirado en
 * VaultLine, adaptado a la marca MaquiFly).
 */
export function MyStats({
  owner,
  machines,
  totals: totals30,
  totalsError,
}: {
  owner: MyOwner;
  machines: MyMachine[];
  totals: Totals | null;
  totalsError: string | null;
}) {
  const plan = plans[effectivePlan(owner)];
  const hasDetail = plan.id !== "start";
  const [days, setDays] = useState<Range>(30);
  const [current, setCurrent] = useState<Totals | null>(null);
  const [previous, setPrevious] = useState<Totals | null>(null);
  const [byMachine, setByMachine] = useState<MachineStat[] | null>(null);
  const [weeks, setWeeks] = useState<WeekStat[] | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);

  // Totales del periodo elegido (los de 30 días ya vienen de la cuenta).
  useEffect(() => {
    if (days === 30) {
      setCurrent(totals30);
      return;
    }
    setCurrent(null);
    getSupabase()!
      .rpc("my_stats_totals", { p_days: days })
      .then(({ data }) => setCurrent(toTotals((data as Record<string, unknown>[] | null)?.[0])));
  }, [days, totals30]);

  // Detalle de Fly Plus / Fly Pro.
  useEffect(() => {
    if (!hasDetail) return;
    const supabase = getSupabase()!;
    setByMachine(null);
    setPrevious(null);
    Promise.all([
      supabase.rpc("my_machine_stats", { p_days: days }),
      supabase.rpc("my_stats_previous", { p_days: days }),
    ]).then(([m, p]) => {
      if (m.error) setDetailError(m.error.message);
      setByMachine(
        ((m.data as MachineStat[] | null) ?? []).map((r) => ({
          machine_id: r.machine_id,
          views: Number(r.views),
          whatsapp: Number(r.whatsapp),
        })),
      );
      // Si el SQL de la comparación aún no se ejecutó, simplemente no se muestra.
      setPrevious(p.error ? null : toTotals((p.data as Record<string, unknown>[] | null)?.[0]));
    });
  }, [hasDetail, days]);

  useEffect(() => {
    if (!hasDetail) return;
    getSupabase()!
      .rpc("my_weekly_stats", { p_weeks: 8 })
      .then(({ data, error }) => {
        if (error) setDetailError(error.message);
        setWeeks(
          ((data as WeekStat[] | null) ?? []).map((r) => ({
            week: r.week,
            views: Number(r.views),
            whatsapp: Number(r.whatsapp),
            profile_views: Number(r.profile_views),
          })),
        );
      });
  }, [hasDetail]);

  const ranked = useMemo(
    () =>
      (byMachine ?? [])
        .map((s) => ({ ...s, machine: machines.find((m) => m.id === s.machine_id) }))
        .filter((s) => s.machine && s.machine.status !== "archived")
        .sort((a, b) => b.whatsapp - a.whatsapp || b.views - a.views),
    [byMachine, machines],
  );

  const rate = current ? contactRate(current.views, current.whatsapp) : null;
  const tip = buildTip(current, ranked, rate);
  const rangeLabel = `${days} días`;

  return (
    <section className="flex flex-col gap-5">
      {/* Cabecera ------------------------------------------------------- */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-steel-500">
            Estadísticas · últimos {rangeLabel}
          </p>
          <h2 className="mt-1.5 flex flex-wrap items-center gap-2.5 text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">
            Cómo le va a tus máquinas
            {plan.id === "pro" && <GoldBadge>★ Fly Pro</GoldBadge>}
          </h2>
          <p className="mt-1.5 text-sm text-steel-600">
            No cuenta tus propias visitas ni las del equipo de MaquiFly.
          </p>
        </div>
        <div role="group" aria-label="Periodo" className="flex self-start rounded-xl border border-[#e8e4da] bg-white p-1 sm:self-auto">
          {RANGES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setDays(r)}
              aria-pressed={days === r}
              className={`rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors ${
                days === r ? "bg-ink-900 text-white" : "text-steel-600 hover:text-ink-900"
              }`}
            >
              {r} días
            </button>
          ))}
        </div>
      </div>

      {totalsError && (
        <Callout tone="warn" title="Las estadísticas todavía no están activas">
          {totalsError}
        </Callout>
      )}

      {/* Números grandes ------------------------------------------------ */}
      <ul className="grid gap-4 sm:grid-cols-3">
        <Kpi
          dark
          label="Vistas de tus máquinas"
          icon={<AIconEye size={18} />}
          iconClass="bg-white/10 text-volt-400"
          value={current?.views}
          prev={previous?.views}
          rangeLabel={rangeLabel}
          help="Veces que abrieron la ficha de alguna de tus máquinas."
        />
        <Kpi
          label="Toques en WhatsApp"
          icon={<IconWhatsApp size={18} />}
          iconClass="bg-[#e3f6f3] text-[#128C7E]"
          value={current?.whatsapp}
          prev={previous?.whatsapp}
          rangeLabel={rangeLabel}
          help={
            plan.directWhatsapp
              ? "Veces que tocaron el botón para escribirte."
              : "En Fly Start estos toques llegan al WhatsApp de MaquiFly, que te pasa el contacto."
          }
        />
        <Kpi
          label="Visitas a tu perfil"
          icon={<IconUser size={18} />}
          iconClass="bg-[#fbf3dd] text-[#c49a2a]"
          value={current?.profile_views}
          prev={previous?.profile_views}
          rangeLabel={rangeLabel}
          help="Veces que abrieron tu página de propietario."
        />
      </ul>

      {hasDetail ? (
        <>
          {detailError && (
            <Callout tone="warn" title="No pudimos cargar el detalle">
              {detailError}
            </Callout>
          )}

          <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
            <WeeklyChart weeks={weeks} />

            <Card>
              <h3 className="text-base font-extrabold text-ink-900">¿Cuántos te contactan?</h3>
              <p className="mt-0.5 text-xs text-steel-500">De cada 100 que ven tus máquinas</p>
              <div className="mt-5 flex items-center gap-5">
                <Donut value={rate} />
                <p className="text-sm leading-relaxed text-steel-700">
                  {rate === null ? (
                    "Cuando tus máquinas tengan vistas, aquí verás cuántos te escriben."
                  ) : (
                    <>
                      <b className="text-ink-900">{rate} de cada 100</b> tocan el botón de WhatsApp.
                    </>
                  )}
                </p>
              </div>
              {tip && (
                <div className="mt-5 rounded-xl border border-[#efdfb2] bg-[#fbf6e7] px-3.5 py-3 text-[0.82rem] leading-relaxed text-[#5b4610]">
                  <b className="text-[#3b2a05]">Consejo:</b> {tip}
                </div>
              )}
            </Card>
          </div>

          <Card className="!p-0 overflow-hidden">
            <div className="px-5 pt-5">
              <h3 className="text-base font-extrabold text-ink-900">Por máquina</h3>
              <p className="mt-0.5 text-xs text-steel-500">Cuál de tus equipos atrae más clientes · últimos {rangeLabel}</p>
            </div>
            {byMachine === null ? (
              <p className="px-5 py-6 text-sm text-steel-500">Cargando…</p>
            ) : ranked.length === 0 ? (
              <p className="px-5 py-6 text-sm text-steel-500">Cuando tengas máquinas publicadas, aquí verás cómo le va a cada una.</p>
            ) : (
              <MachineTable rows={ranked as Array<MachineStat & { machine: MyMachine }>} />
            )}
            <p className="border-t border-[#f1eee6] px-5 py-3 text-xs text-steel-500">
              «Toques en WhatsApp» cuenta las veces que tocaron el botón; no todos terminan enviando el mensaje.
            </p>
          </Card>
        </>
      ) : (
        <div className="relative overflow-hidden rounded-2xl bg-ink-950 p-6 text-white sm:p-8">
          <div className="grid-blueprint absolute inset-0 opacity-60" aria-hidden="true" />
          <div className="relative max-w-xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-volt-300">Fly Plus y Fly Pro</p>
            <p className="mt-2 text-xl font-extrabold">Mira qué máquina te trae más clientes</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-200">
              Con un plan pagado ves cómo le va a cada máquina, semana a semana, cuánto creciste frente al mes anterior y
              recibes WhatsApp directo de los clientes. Tus totales de arriba los ves siempre, en cualquier plan.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <LinkButton href="/pagar/fly-plus" variant="volt" size="md">
                Mejorar a {plans.plus.name}
              </LinkButton>
              <LinkButton href="/planes" variant="outline" size="md">
                Comparar planes
              </LinkButton>
            </div>
          </div>
        </div>
      )}

      <p className="text-xs leading-relaxed text-steel-500">
        Son números reales: cada persona suma una vista por máquina aunque recargue la página, y las publicaciones de
        demostración no suman.{" "}
        <Link href="/privacidad" className="underline underline-offset-2">
          No guardamos quién visita, solo cuántos.
        </Link>
      </p>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-[#e8e4da] bg-white p-5 shadow-[0_1px_2px_rgba(7,22,40,0.04),0_12px_30px_-26px_rgba(7,22,40,0.35)] ${className}`}
    >
      {children}
    </div>
  );
}

function GoldBadge({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full bg-linear-to-br from-[#fff1c1] via-[#e6b94f] to-[#b8860b] px-2.5 py-1 text-[0.68rem] font-extrabold uppercase tracking-[0.1em] text-[#3b2a05] shadow-[0_6px_16px_-6px_rgb(196_154_42/0.7)]">
      {children}
    </span>
  );
}

function Kpi({
  label,
  icon,
  iconClass,
  value,
  prev,
  rangeLabel,
  help,
  dark = false,
}: {
  label: string;
  icon: ReactNode;
  iconClass: string;
  value: number | undefined;
  prev: number | undefined;
  rangeLabel: string;
  help: string;
  dark?: boolean;
}) {
  let delta: ReactNode = null;
  if (value !== undefined && prev !== undefined) {
    const muted = dark ? "text-ink-300" : "text-steel-500";
    if (prev === 0) {
      delta = value > 0 ? <span className={muted}>Nuevo: antes no había datos</span> : null;
    } else {
      const pct = Math.round(((value - prev) / prev) * 100);
      const up = pct > 0;
      const color = pct === 0 ? "text-warn-700" : up ? (dark ? "text-volt-400" : "text-ok-700") : "text-danger-700";
      delta = (
        <>
          <span className={`font-semibold ${color}`}>
            {pct === 0 ? "● igual" : `${up ? "▲" : "▼"} ${Math.abs(pct)} %`}
          </span>{" "}
          <span className={muted}>vs. {rangeLabel} anteriores</span>
        </>
      );
    }
  }

  return (
    <li
      className={`relative overflow-hidden rounded-2xl border p-5 ${
        dark
          ? "border-transparent bg-linear-to-br from-ink-800 to-ink-900 text-white"
          : "border-[#e8e4da] bg-white shadow-[0_1px_2px_rgba(7,22,40,0.04),0_12px_30px_-26px_rgba(7,22,40,0.35)]"
      }`}
    >
      {dark && (
        <span className="absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-transparent via-[#e6b94f] to-transparent" aria-hidden="true" />
      )}
      <p className={`flex items-center gap-2.5 text-sm font-semibold ${dark ? "text-ink-200" : "text-steel-600"}`}>
        <span className={`flex size-8 items-center justify-center rounded-lg ${iconClass}`}>{icon}</span>
        {label}
      </p>
      <p className="mt-4 font-display text-[2.6rem] font-extrabold leading-none tracking-tight tabular-nums">
        {value === undefined ? "…" : fmt(value)}
      </p>
      <p className="mt-2.5 min-h-[1.25rem] text-xs">{delta}</p>
      <p className={`mt-1 text-xs leading-relaxed ${dark ? "text-ink-300" : "text-steel-500"}`}>{help}</p>
    </li>
  );
}

function WeeklyChart({ weeks }: { weeks: WeekStat[] | null }) {
  const data = weeks ?? [];
  const max = Math.max(1, ...data.map((w) => Math.max(w.views, w.whatsapp)));
  const empty = data.every((w) => w.views === 0 && w.whatsapp === 0);
  const label = (iso: string) =>
    new Date(`${iso}T12:00:00`).toLocaleDateString("es-PE", { day: "numeric", month: "short" });
  const H = 170;

  return (
    <Card>
      <h3 className="text-base font-extrabold text-ink-900">Semana a semana</h3>
      <p className="mt-0.5 text-xs text-steel-500">Vistas y toques en WhatsApp de las últimas 8 semanas</p>
      <div className="mt-3 flex flex-wrap gap-4 text-xs text-steel-500">
        <span className="flex items-center gap-1.5"><i className="size-2.5 rounded-[3px] bg-ink-900" />Vistas</span>
        <span className="flex items-center gap-1.5"><i className="size-2.5 rounded-[3px] bg-[#128C7E]" />Toques en WhatsApp</span>
        <span className="flex items-center gap-1.5"><i className="size-2.5 rounded-[3px] bg-[#c49a2a]" />Semana actual</span>
      </div>

      {weeks === null ? (
        <p className="py-16 text-center text-sm text-steel-500">Cargando…</p>
      ) : empty ? (
        <p className="py-16 text-center text-sm text-steel-500">Aún sin vistas en estas semanas.</p>
      ) : (
        <figure className="mt-4">
          <div
            className="flex items-end gap-2 border-b border-[#e8e4da] px-1 sm:gap-4"
            style={{
              height: H,
              backgroundImage: "repeating-linear-gradient(0deg, transparent 0 41px, #f1eee6 41px 42px)",
            }}
            aria-hidden="true"
          >
            {data.map((w, i) => {
              const now = i === data.length - 1;
              return (
                <div key={w.week} className="flex flex-1 items-end justify-center gap-1" title={`${label(w.week)}: ${w.views} vistas, ${w.whatsapp} toques`}>
                  <i
                    className={`block w-2.5 rounded-t-[5px] sm:w-4 ${now ? "bg-linear-to-b from-[#e6b94f] to-[#c49a2a]" : "bg-ink-900"}`}
                    style={{ height: Math.max(2, (w.views / max) * (H - 10)) }}
                  />
                  <i className="block w-2.5 rounded-t-[5px] bg-[#128C7E] sm:w-4" style={{ height: Math.max(2, (w.whatsapp / max) * (H - 10)) }} />
                </div>
              );
            })}
          </div>
          <div className="flex gap-2 px-1 pt-2 sm:gap-4" aria-hidden="true">
            {data.map((w) => (
              <span key={w.week} className="flex-1 text-center text-[0.68rem] text-steel-500">
                {label(w.week)}
              </span>
            ))}
          </div>
          <table className="sr-only">
            <caption>Vistas y toques en WhatsApp por semana</caption>
            <thead><tr><th>Semana</th><th>Vistas</th><th>Toques en WhatsApp</th></tr></thead>
            <tbody>
              {data.map((w) => (
                <tr key={w.week}><td>{label(w.week)}</td><td>{w.views}</td><td>{w.whatsapp}</td></tr>
              ))}
            </tbody>
          </table>
        </figure>
      )}
    </Card>
  );
}

function Donut({ value }: { value: number | null }) {
  const pct = Math.min(100, value ?? 0);
  return (
    <div
      className="grid size-28 shrink-0 place-items-center rounded-full"
      style={{ background: `conic-gradient(#128C7E 0 ${pct}%, #efece4 ${pct}% 100%)` }}
      role="img"
      aria-label={value === null ? "Sin datos" : `${value} de cada 100`}
    >
      <div className="grid size-20 place-items-center rounded-full bg-white font-display text-2xl font-extrabold text-ink-900">
        {value === null ? "—" : value}
      </div>
    </div>
  );
}

function MachineTable({ rows }: { rows: Array<MachineStat & { machine: MyMachine }> }) {
  const maxWa = Math.max(1, ...rows.map((r) => r.whatsapp));
  return (
    <div className="relative mt-3 overflow-x-auto">
      <table className="w-full text-sm sm:min-w-[34rem]">
        <thead>
          <tr className="text-left text-[0.68rem] uppercase tracking-[0.1em] text-steel-500">
            <th scope="col" className="px-5 py-2.5 font-bold">Máquina</th>
            <th scope="col" className="px-3 py-2.5 text-right font-bold">Vistas</th>
            <th scope="col" className="px-3 py-2.5 text-right font-bold">Toques WhatsApp</th>
            <th scope="col" className="hidden px-3 py-2.5 text-right font-bold sm:table-cell">De cada 100</th>
            <th scope="col" className="hidden px-5 py-2.5 sm:table-cell"><span className="sr-only">Comparación</span></th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ machine: m, views, whatsapp }) => {
            const cover = m.images[0];
            const featured = !!m.featured_until && new Date(m.featured_until) > new Date();
            const r = contactRate(views, whatsapp);
            return (
              <tr key={m.id} className="border-t border-[#f1eee6]">
                <td className="py-3 pl-5 pr-2">
                  <div className="flex items-center gap-3">
                    <span className="hidden h-9 w-12 shrink-0 sm:block overflow-hidden rounded-lg bg-linear-to-br from-ink-600 to-ink-900">
                      {cover && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={cover.url} alt="" className="size-full object-cover" />
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="flex flex-wrap items-center gap-1.5 font-bold text-ink-900">
                        {m.name}
                        {featured && (
                          <span className="rounded-[5px] border border-[#e6c56a] bg-[#fbefc8] px-1.5 py-px text-[0.62rem] font-extrabold uppercase tracking-[0.08em] text-[#3b2a05]">
                            ⚡ Destacada
                          </span>
                        )}
                      </span>
                      <span className="text-xs text-steel-500">
                        {m.area}
                        {m.operator_available ? " · Con operador" : ""}
                        {m.status !== "published" ? " · no publicada ahora" : ""}
                      </span>
                    </span>
                  </div>
                </td>
                <td className="px-3 py-3 text-right font-display font-bold tabular-nums text-ink-900">{fmt(views)}</td>
                <td className="px-3 py-3 text-right font-display font-bold tabular-nums text-ink-900">{fmt(whatsapp)}</td>
                <td className="hidden px-3 py-3 text-right tabular-nums text-steel-700 sm:table-cell">{r ?? "—"}</td>
                <td className="hidden px-5 py-3 sm:table-cell">
                  <span className="block h-1.5 w-28 overflow-hidden rounded-full bg-[#f1eee6]" aria-hidden="true">
                    <span className="block h-full rounded-full bg-[#128C7E]" style={{ width: `${(whatsapp / maxWa) * 100}%` }} />
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** Un consejo concreto a partir de los números reales (o ninguno). */
function buildTip(
  totals: Totals | null,
  ranked: Array<MachineStat & { machine?: MyMachine }>,
  avgRate: number | null,
): ReactNode {
  if (!totals) return null;
  if (totals.views === 0) {
    return "aún no hay vistas en este periodo. Comparte el enlace de tus máquinas en tus grupos de WhatsApp y en Facebook.";
  }
  // Muchas vistas pero pocos toques: algo en la ficha no convence.
  const weak = ranked.find(
    (r) => r.views >= 20 && avgRate !== null && (contactRate(r.views, r.whatsapp) ?? 0) < avgRate / 2,
  );
  if (weak?.machine) {
    return `«${weak.machine.name}» tiene muchas vistas pero pocos toques. Prueba agregar el precio, más fotos o si incluye operador.`;
  }
  const best = ranked[0];
  if (best?.machine && best.whatsapp > 0) {
    const featured = !!best.machine.featured_until && new Date(best.machine.featured_until) > new Date();
    if (!featured) {
      return (
        <>
          «{best.machine.name}» es la que más clientes te trae.{" "}
          <Link href="/pagar/destacado-7" className="font-semibold underline underline-offset-2">
            Destácala 7 días
          </Link>{" "}
          para que la vean aún más.
        </>
      );
    }
  }
  return null;
}
