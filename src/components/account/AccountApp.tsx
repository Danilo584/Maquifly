"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type ComponentType } from "react";
import type { Session } from "@supabase/supabase-js";
import { SUPABASE_READY } from "@/lib/site";
import { getSupabase } from "@/lib/supabase";
import { plans } from "@/lib/plans";
import { verificationLabel } from "@/lib/format";
import { effectivePlan, useSession, type MyMachine, type MyOwner } from "@/lib/account";
import { Badge } from "@/components/ui/Badge";
import { Button, LinkButton } from "@/components/ui/Button";
import { Callout } from "@/components/ui/Callout";
import { IconAward, IconCalendar, IconPlus, IconShield, IconTag, IconTruck, IconUser } from "@/components/ui/Icon";
import { AIconChat, AIconEye, AIconLogout } from "@/components/admin/admin-icons";
import { OwnerOnboarding } from "@/components/account/OwnerOnboarding";
import { MyMachines } from "@/components/account/MyMachines";
import { MyStats, type Totals } from "@/components/account/MyStats";
import { MyPlan } from "@/components/account/MyPlan";
import { MyProfile } from "@/components/account/MyProfile";

type TabKey = "resumen" | "maquinas" | "estadisticas" | "plan" | "datos";

const tabs: Array<{ key: TabKey; label: string; Icon: ComponentType<{ size?: number; className?: string }> }> = [
  { key: "resumen", label: "Resumen", Icon: IconUser },
  { key: "maquinas", label: "Mis máquinas", Icon: IconTruck },
  { key: "estadisticas", label: "Estadísticas", Icon: IconCalendar },
  { key: "plan", label: "Mi plan", Icon: IconAward },
  { key: "datos", label: "Mis datos", Icon: IconTag },
];

export function AccountApp() {
  if (!SUPABASE_READY) {
    return (
      <div className="container-mf py-16">
        <Callout tone="warn" title="Las cuentas todavía no están activas">
          Falta conectar la base de datos.
        </Callout>
      </div>
    );
  }
  return <AccountGate />;
}

function AccountGate() {
  const router = useRouter();
  const { session, loading } = useSession();

  useEffect(() => {
    if (!loading && !session) router.replace("/ingresar");
  }, [loading, session, router]);

  if (loading || !session) return <Loading />;
  return <OwnerLoader session={session} />;
}

function Loading() {
  return <p className="py-24 text-center text-sm text-steel-500">Cargando tu cuenta…</p>;
}

function OwnerLoader({ session }: { session: Session }) {
  const [owner, setOwner] = useState<MyOwner | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data, error: err } = await getSupabase()!
      .from("owner_profiles")
      .select("*")
      .eq("user_id", session.user.id)
      .maybeSingle();
    if (err) setError(err.message);
    setOwner((data as MyOwner | null) ?? null);
  }, [session.user.id]);

  useEffect(() => {
    load();
  }, [load]);

  if (owner === undefined) return <Loading />;
  if (error && !owner) {
    return (
      <div className="container-mf py-16">
        <Callout tone="warn" title="No pudimos cargar tu cuenta">
          {error}
        </Callout>
      </div>
    );
  }
  if (!owner) return <OwnerOnboarding session={session} onCreated={load} />;
  return <Dashboard session={session} owner={owner} reloadOwner={load} />;
}

function Dashboard({
  session,
  owner,
  reloadOwner,
}: {
  session: Session;
  owner: MyOwner;
  reloadOwner: () => Promise<void>;
}) {
  const [tab, setTab] = useState<TabKey>("resumen");
  const [machines, setMachines] = useState<MyMachine[] | null>(null);
  const [totals, setTotals] = useState<Totals | null>(null);
  const [totalsError, setTotalsError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // La pestaña vive en el #hash: el botón «atrás» y los enlaces funcionan.
  useEffect(() => {
    const fromHash = window.location.hash.replace("#", "") as TabKey;
    if (tabs.some((t) => t.key === fromHash)) setTab(fromHash);
  }, []);

  function go(next: TabKey) {
    setTab(next);
    window.history.replaceState(null, "", `#${next}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const loadMachines = useCallback(async () => {
    const { data, error: err } = await getSupabase()!
      .from("machines")
      .select("*")
      .eq("owner_id", owner.id)
      .order("created_at", { ascending: false });
    if (err) setError(err.message);
    setMachines((data as MyMachine[]) ?? []);
  }, [owner.id]);

  const loadTotals = useCallback(async () => {
    const { data, error: err } = await getSupabase()!.rpc("my_stats_totals", { p_days: 30 });
    if (err) {
      setTotalsError(err.message);
      setTotals({ views: 0, whatsapp: 0, profile_views: 0 });
      return;
    }
    const row = (data as Array<Record<string, number>> | null)?.[0];
    setTotals({
      views: Number(row?.views ?? 0),
      whatsapp: Number(row?.whatsapp ?? 0),
      profile_views: Number(row?.profile_views ?? 0),
    });
  }, []);

  useEffect(() => {
    loadMachines();
    loadTotals();
  }, [loadMachines, loadTotals]);

  const reloadAll = useCallback(async () => {
    await Promise.all([loadMachines(), reloadOwner()]);
  }, [loadMachines, reloadOwner]);

  const plan = plans[effectivePlan(owner)];
  const initials = owner.business_name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <>
      {/* Cabecera ------------------------------------------------------- */}
      <section className="relative overflow-hidden bg-ink-950">
        <div className="grid-blueprint absolute inset-0" aria-hidden="true" />
        <div className="container-mf relative py-7 sm:py-9">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-volt-400 font-display text-xl font-extrabold text-ink-950 sm:size-16">
                {initials || "M"}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-volt-300">Mi cuenta</p>
                <h1 className="truncate text-2xl font-extrabold text-white sm:text-3xl">{owner.business_name}</h1>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <Badge tone={plan.id === "start" ? "neutral" : "volt"} size="sm">
                    {plan.name}
                  </Badge>
                  {owner.founder_number !== null && (
                    <Badge tone="dark" size="sm">
                      Socio Fundador #{owner.founder_number}
                    </Badge>
                  )}
                  <Badge tone={owner.verification_status === "registered" ? "neutral" : "ok"} size="sm">
                    {verificationLabel[owner.verification_status]}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <LinkButton href={`/propietario/${owner.slug}`} variant="outline" size="sm">
                Ver mi perfil público
              </LinkButton>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  await getSupabase()!.auth.signOut();
                }}
              >
                <AIconLogout size={16} />
                Cerrar sesión
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Pestañas ------------------------------------------------------- */}
      <div className="sticky top-16 z-30 border-b border-steel-200 bg-white/95 backdrop-blur lg:top-18">
        <div className="container-mf">
          <nav aria-label="Secciones de mi cuenta" className="-mx-4 overflow-x-auto px-4">
            <ul className="flex min-w-max gap-1 py-2">
              {tabs.map((t) => {
                const active = tab === t.key;
                return (
                  <li key={t.key}>
                    <button
                      type="button"
                      onClick={() => go(t.key)}
                      aria-current={active ? "page" : undefined}
                      className={`inline-flex h-10 items-center gap-2 rounded-lg px-3.5 text-sm font-semibold transition-colors ${
                        active ? "bg-ink-900 text-white" : "text-steel-700 hover:bg-steel-100 hover:text-ink-900"
                      }`}
                    >
                      <t.Icon size={16} />
                      {t.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>

      <div className="bg-steel-50">
        <div className="container-mf py-7 sm:py-10">
          {error && (
            <Callout tone="warn" className="mb-5" title="Algo no cargó bien">
              {error}
            </Callout>
          )}
          {tab === "resumen" && (
            <Overview
              owner={owner}
              machines={machines}
              totals={totals}
              email={session.user.email ?? ""}
              personName={(session.user.user_metadata?.name as string | undefined) ?? ""}
              goTo={go}
            />
          )}
          {tab === "maquinas" && (
            <MyMachines owner={owner} userId={session.user.id} machines={machines} onChanged={reloadAll} goTo={go} />
          )}
          {tab === "estadisticas" && (
            <MyStats owner={owner} machines={machines ?? []} totals={totals} totalsError={totalsError} />
          )}
          {tab === "plan" && <MyPlan owner={owner} machines={machines ?? []} />}
          {tab === "datos" && <MyProfile owner={owner} email={session.user.email ?? ""} onSaved={reloadOwner} />}
        </div>
      </div>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Resumen                                                                     */
/* -------------------------------------------------------------------------- */

function Overview({
  owner,
  machines,
  totals,
  email,
  personName,
  goTo,
}: {
  owner: MyOwner;
  machines: MyMachine[] | null;
  totals: Totals | null;
  email: string;
  personName: string;
  goTo: (tab: TabKey) => void;
}) {
  const plan = plans[effectivePlan(owner)];
  const list = machines ?? [];
  const published = list.filter((m) => m.status === "published").length;
  const inReview = list.filter((m) => m.status === "pending_review").length;
  const drafts = list.filter((m) => m.status === "draft" || m.status === "rejected").length;
  const firstName = personName.trim().split(" ")[0];

  const tiles: Array<{ label: string; value: string; hint: string; Icon: ComponentType<{ size?: number }>; tab: TabKey }> = [
    {
      label: "Máquinas publicadas",
      value: machines === null ? "…" : `${published}${plan.maxMachines !== null ? ` de ${plan.maxMachines}` : ""}`,
      hint: plan.maxMachines === null ? "Tu plan no tiene límite" : `Límite de ${plan.name}`,
      Icon: IconTruck,
      tab: "maquinas",
    },
    {
      label: "Vistas a tus máquinas",
      value: totals === null ? "…" : String(totals.views),
      hint: "Últimos 30 días",
      Icon: AIconEye,
      tab: "estadisticas",
    },
    {
      label: "Clics en WhatsApp",
      value: totals === null ? "…" : String(totals.whatsapp),
      hint: "Últimos 30 días",
      Icon: AIconChat,
      tab: "estadisticas",
    },
    {
      label: "Visitas a tu perfil",
      value: totals === null ? "…" : String(totals.profile_views),
      hint: "Últimos 30 días",
      Icon: IconUser,
      tab: "estadisticas",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-extrabold text-ink-900 sm:text-2xl">{firstName ? `Hola, ${firstName}` : "Hola"}</h2>
        <p className="mt-1 text-sm text-steel-600">Ingresaste como {email}.</p>
      </div>

      {machines !== null && list.length === 0 && (
        <div className="flex flex-col gap-4 rounded-2xl border border-brand-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <p className="font-bold text-ink-900">Publica tu primera máquina</p>
            <p className="mt-1 text-sm text-steel-600">
              Sube fotos reales, pon tu precio y envíala a revisión. La publicamos en cuanto la revisemos.
            </p>
          </div>
          <Button variant="primary" onClick={() => goTo("maquinas")}>
            <IconPlus size={18} />
            Agregar máquina
          </Button>
        </div>
      )}

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((t) => (
          <li key={t.label}>
            <button
              type="button"
              onClick={() => goTo(t.tab)}
              className="flex h-full w-full flex-col rounded-2xl border border-steel-200 bg-white p-4 text-left transition-colors hover:border-brand-300 sm:p-5"
            >
              <span className="flex items-center gap-2 text-sm font-semibold text-steel-600">
                <t.Icon size={16} />
                {t.label}
              </span>
              <span className="mt-2 text-3xl font-extrabold text-ink-900">{t.value}</span>
              <span className="mt-1 text-xs text-steel-500">{t.hint}</span>
            </button>
          </li>
        ))}
      </ul>

      {(inReview > 0 || drafts > 0) && (
        <Callout tone="info" title="Pendientes">
          {inReview > 0 && (
            <span className="block">
              {inReview === 1 ? "1 máquina está" : `${inReview} máquinas están`} en revisión. Te avisamos por WhatsApp cuando
              estén publicadas.
            </span>
          )}
          {drafts > 0 && (
            <span className="block">
              Tienes {drafts === 1 ? "1 máquina" : `${drafts} máquinas`} sin enviar a revisión.{" "}
              <button type="button" onClick={() => goTo("maquinas")} className="font-semibold text-brand-700 hover:underline">
                Revisar
              </button>
            </span>
          )}
        </Callout>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-steel-200 bg-white p-5 sm:p-6">
          <p className="text-sm font-semibold text-steel-600">Tu plan</p>
          <p className="mt-1 text-2xl font-extrabold text-ink-900">{plan.name}</p>
          <p className="mt-1 text-sm text-steel-600">
            {plan.id === "start"
              ? "Gratis. Los clientes te contactan a través de MaquiFly."
              : `Vigente hasta el ${new Date(owner.plan_expires_at!).toLocaleDateString("es-PE", { day: "numeric", month: "long", year: "numeric" })}.`}
          </p>
          <Button variant="secondary" size="sm" className="mt-4" onClick={() => goTo("plan")}>
            {plan.id === "pro" ? "Ver mi plan" : "Mejorar mi plan"}
          </Button>
        </div>
        <div className="rounded-2xl border border-steel-200 bg-white p-5 sm:p-6">
          <p className="flex items-center gap-2 text-sm font-semibold text-steel-600">
            <IconShield size={16} />
            Verificación
          </p>
          <p className="mt-1 text-2xl font-extrabold text-ink-900">{verificationLabel[owner.verification_status]}</p>
          <p className="mt-1 text-sm text-steel-600">
            {owner.verification_status === "registered"
              ? "Para recibir el sello verde, MaquiFly confirma tu identidad y tus máquinas. Escríbenos para empezar."
              : "Tu perfil muestra el sello de propietario verificado."}
          </p>
          {owner.verification_status === "registered" && (
            <Link href="/contacto" className="mt-4 inline-block text-sm font-semibold text-brand-700 hover:underline">
              Solicitar verificación
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
