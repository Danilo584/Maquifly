"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { plans } from "@/lib/plans";
import { getSupabase } from "@/lib/supabase";
import { effectivePlan, type MyMachine, type MyOwner } from "@/lib/account";
import { Callout } from "@/components/ui/Callout";
import { LinkButton } from "@/components/ui/Button";
import { MiniBarChart } from "@/components/admin/MiniBarChart";
import { AIconChat, AIconEye } from "@/components/admin/admin-icons";
import { IconUser } from "@/components/ui/Icon";

export type Totals = { views: number; whatsapp: number; profile_views: number };

type MachineStat = { machine_id: string; views: number; whatsapp: number };
type WeekStat = { week: string; views: number; whatsapp: number; profile_views: number };

/**
 * ESTADÍSTICAS DEL PROPIETARIO
 * ---------------------------------------------------------------------------
 * Números reales de la tabla machine_events y owner_events. No cuentan las
 * visitas del propio dueño ni las del equipo de MaquiFly, y cada visitante
 * suma una vista por máquina por sesión.
 *
 * Todos los planes ven sus totales de 30 días. El detalle por máquina y por
 * semana es el «reporte de visitas y contactos» de Fly Plus y Fly Pro; la
 * propia base de datos lo devuelve vacío en Fly Start.
 */
export function MyStats({
  owner,
  machines,
  totals,
  totalsError,
}: {
  owner: MyOwner;
  machines: MyMachine[];
  totals: Totals | null;
  totalsError: string | null;
}) {
  const plan = plans[effectivePlan(owner)];
  const hasDetail = plan.id !== "start";
  const [byMachine, setByMachine] = useState<MachineStat[] | null>(null);
  const [weeks, setWeeks] = useState<WeekStat[] | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);

  useEffect(() => {
    if (!hasDetail) return;
    const supabase = getSupabase()!;
    Promise.all([supabase.rpc("my_machine_stats", { p_days: 30 }), supabase.rpc("my_weekly_stats", { p_weeks: 8 })]).then(
      ([m, w]) => {
        if (m.error || w.error) setDetailError((m.error ?? w.error)!.message);
        setByMachine(
          ((m.data as MachineStat[] | null) ?? []).map((r) => ({
            machine_id: r.machine_id,
            views: Number(r.views),
            whatsapp: Number(r.whatsapp),
          })),
        );
        setWeeks(
          ((w.data as WeekStat[] | null) ?? []).map((r) => ({
            week: r.week,
            views: Number(r.views),
            whatsapp: Number(r.whatsapp),
            profile_views: Number(r.profile_views),
          })),
        );
      },
    );
  }, [hasDetail]);

  const tiles = [
    { label: "Vistas a tus máquinas", value: totals?.views, Icon: AIconEye, help: "Personas que abrieron la ficha de alguna de tus máquinas." },
    {
      label: "Clics en WhatsApp",
      value: totals?.whatsapp,
      Icon: AIconChat,
      help: plan.directWhatsapp
        ? "Personas que tocaron el botón para escribirte."
        : "En Fly Start estos clics llegan al WhatsApp de MaquiFly, que te pasa el contacto.",
    },
    { label: "Visitas a tu perfil", value: totals?.profile_views, Icon: IconUser, help: "Personas que abrieron tu página de propietario." },
  ];

  const weekLabel = (iso: string) =>
    new Date(`${iso}T12:00:00`).toLocaleDateString("es-PE", { day: "numeric", month: "short" });
  const machineName = (id: string) => machines.find((m) => m.id === id);
  const ranked = (byMachine ?? [])
    .map((s) => ({ ...s, machine: machineName(s.machine_id) }))
    .filter((s) => s.machine && s.machine.status !== "archived")
    .sort((a, b) => b.whatsapp - a.whatsapp || b.views - a.views);

  return (
    <section className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-extrabold text-ink-900 sm:text-2xl">Estadísticas</h2>
        <p className="mt-1 text-sm text-steel-600">Últimos 30 días.</p>
      </div>

      {totalsError && (
        <Callout tone="warn" title="Las estadísticas todavía no están activas">
          {totalsError}
        </Callout>
      )}

      <ul className="grid gap-3 sm:grid-cols-3">
        {tiles.map((t) => (
          <li key={t.label} className="rounded-2xl border border-steel-200 bg-white p-4 sm:p-5">
            <p className="flex items-center gap-2 text-sm font-semibold text-steel-600">
              <t.Icon size={16} />
              {t.label}
            </p>
            <p className="mt-2 text-4xl font-extrabold text-ink-900">{t.value ?? "…"}</p>
            <p className="mt-2 text-xs leading-relaxed text-steel-500">{t.help}</p>
          </li>
        ))}
      </ul>

      {hasDetail ? (
        <>
          {detailError && (
            <Callout tone="warn" title="No pudimos cargar el detalle">
              {detailError}
            </Callout>
          )}
          <div className="grid gap-4 lg:grid-cols-3">
            <MiniBarChart
              title="Vistas por semana"
              data={(weeks ?? []).map((w) => ({ label: weekLabel(w.week), value: w.views }))}
              emptyText="Aún sin vistas"
            />
            <MiniBarChart
              title="Clics en WhatsApp por semana"
              data={(weeks ?? []).map((w) => ({ label: weekLabel(w.week), value: w.whatsapp }))}
              color="#128C7E"
              emptyText="Aún sin clics"
            />
            <MiniBarChart
              title="Visitas a tu perfil por semana"
              data={(weeks ?? []).map((w) => ({ label: weekLabel(w.week), value: w.profile_views }))}
              color="var(--color-ink-700)"
              emptyText="Aún sin visitas"
            />
          </div>

          <div className="overflow-hidden rounded-2xl border border-steel-200 bg-white">
            <div className="border-b border-steel-200 px-4 py-3 sm:px-5">
              <p className="font-bold text-ink-900">Por máquina</p>
              <p className="text-xs text-steel-500">Ordenadas por clics en WhatsApp: los contactos son lo que más importa.</p>
            </div>
            {byMachine === null ? (
              <p className="px-5 py-6 text-sm text-steel-500">Cargando…</p>
            ) : ranked.length === 0 ? (
              <p className="px-5 py-6 text-sm text-steel-500">Cuando tengas máquinas publicadas, aquí verás cómo le va a cada una.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[28rem] text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wider text-steel-500">
                      <th scope="col" className="px-4 py-2.5 font-semibold sm:px-5">Máquina</th>
                      <th scope="col" className="px-4 py-2.5 text-right font-semibold">Vistas</th>
                      <th scope="col" className="px-4 py-2.5 text-right font-semibold sm:pr-5">Clics WhatsApp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ranked.map((s) => (
                      <tr key={s.machine_id} className="border-t border-steel-100">
                        <td className="px-4 py-3 sm:px-5">
                          <span className="block font-semibold text-ink-900">{s.machine!.name}</span>
                          <span className="text-xs text-steel-500">
                            {s.machine!.reference}
                            {s.machine!.status !== "published" ? " · no publicada ahora" : ""}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold tabular-nums text-ink-900">{s.views}</td>
                        <td className="px-4 py-3 text-right font-semibold tabular-nums text-ink-900 sm:pr-5">{s.whatsapp}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="relative overflow-hidden rounded-2xl bg-ink-950 p-6 text-white sm:p-8">
          <div className="grid-blueprint absolute inset-0 opacity-60" aria-hidden="true" />
          <div className="relative max-w-xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-volt-300">Fly Plus y Fly Pro</p>
            <p className="mt-2 text-xl font-extrabold">Mira qué máquina te trae más clientes</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-200">
              Con un plan pagado ves las vistas y los clics de cada máquina, semana a semana, y recibes WhatsApp directo de los
              clientes. Tus totales de arriba los ves siempre, en cualquier plan.
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
        Son números reales: no cuentan tus propias visitas ni las del equipo de MaquiFly, y cada persona suma una vista por
        máquina aunque recargue la página. Las publicaciones de demostración no suman.{" "}
        <Link href="/privacidad" className="underline underline-offset-2">
          No guardamos quién visita, solo cuántos.
        </Link>
      </p>
    </section>
  );
}
