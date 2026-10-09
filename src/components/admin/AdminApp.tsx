"use client";

import { useCallback, useEffect, useRef, useState, type ComponentType } from "react";
import type { Session } from "@supabase/supabase-js";
import { SUPABASE_READY } from "@/lib/site";
import { getSupabase } from "@/lib/supabase";
import { LogoMark } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { Callout } from "@/components/ui/Callout";
import { db, ErrorNote } from "@/components/admin/admin-shared";
import {
  AIconBell,
  AIconExternal,
  AIconFlag,
  AIconHome,
  AIconInbox,
  AIconLogout,
  AIconMachine,
  AIconMenu,
  AIconRefresh,
  AIconUpload,
  AIconUsers,
  AIconWallet,
} from "@/components/admin/admin-icons";
import { OverviewTab } from "@/components/admin/tabs/OverviewTab";
import { MessagesTab } from "@/components/admin/tabs/MessagesTab";
import { SubmissionsTab } from "@/components/admin/tabs/SubmissionsTab";
import { MachinesTab } from "@/components/admin/tabs/MachinesTab";
import { OwnersTab } from "@/components/admin/tabs/OwnersTab";
import { PaymentsTab } from "@/components/admin/tabs/PaymentsTab";
import { ReportsTab } from "@/components/admin/tabs/ReportsTab";

export type TabKey =
  | "overview"
  | "messages"
  | "submissions"
  | "machines"
  | "owners"
  | "payments"
  | "reports";

export type Counts = {
  messages: number;
  submissions: number;
  payments: number;
  reports: number;
};

const tabs: Array<{
  key: TabKey;
  label: string;
  Icon: ComponentType<{ size?: number }>;
  badge?: keyof Counts;
  group: string;
}> = [
  { key: "overview", label: "Resumen", Icon: AIconHome, group: "General" },
  { key: "messages", label: "Mensajes", Icon: AIconInbox, badge: "messages", group: "Bandeja" },
  { key: "submissions", label: "Publicaciones recibidas", Icon: AIconUpload, badge: "submissions", group: "Bandeja" },
  { key: "reports", label: "Reportes", Icon: AIconFlag, badge: "reports", group: "Bandeja" },
  { key: "machines", label: "Máquinas", Icon: AIconMachine, group: "Catálogo" },
  { key: "owners", label: "Propietarios", Icon: AIconUsers, group: "Catálogo" },
  { key: "payments", label: "Pagos y planes", Icon: AIconWallet, badge: "payments", group: "Negocio" },
];

export type TabProps = {
  onChange: () => void;
  goTo: (tab: TabKey) => void;
};

/**
 * PANEL DE CONTROL DE MAQUIFLY
 * ---------------------------------------------------------------------------
 * Requiere iniciar sesión con una cuenta cuyo perfil tenga role = 'admin'.
 * Todo permiso se valida en la base de datos (RLS + triggers): aunque alguien
 * abriera esta página, sin ser admin no puede leer ni cambiar nada.
 */
export function AdminApp() {
  if (!SUPABASE_READY) {
    return (
      <AuthShell>
        <Callout tone="warn" title="Falta conectar la base de datos">
          El panel necesita Supabase configurado.
        </Callout>
      </AuthShell>
    );
  }
  return <AdminGate />;
}

function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid-blueprint flex min-h-dvh items-center justify-center bg-ink-950 px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <LogoMark size={52} className="text-ink-800" />
          <div>
            <p className="font-display text-2xl font-extrabold tracking-tight text-white">
              Maqui<span className="text-brand-400">Fly</span>
            </p>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-volt-300">Panel de control</p>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

function AdminGate() {
  const [session, setSession] = useState<Session | null>(null);
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = getSupabase()!;
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setChecking(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) {
      setIsAdmin(null);
      return;
    }
    db()
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .maybeSingle()
      .then(({ data }) => setIsAdmin(data?.role === "admin"));
  }, [session]);

  if (checking || (session && isAdmin === null)) {
    return (
      <AuthShell>
        <p className="text-center text-sm text-ink-300">Cargando…</p>
      </AuthShell>
    );
  }
  if (!session) return <LoginForm />;
  if (!isAdmin) {
    return (
      <AuthShell>
        <div className="rounded-2xl bg-white p-6">
          <Callout tone="warn" title="Esta cuenta no es administradora">
            Iniciaste sesión como {session.user.email}, pero esa cuenta no tiene permisos de administración.
          </Callout>
          <Button variant="secondary" fullWidth className="mt-4" onClick={() => db().auth.signOut()}>
            Cerrar sesión
          </Button>
        </div>
      </AuthShell>
    );
  }
  return <Dashboard email={session.user.email ?? ""} />;
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const { error: err } = await db().auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (err) {
      const msg = err.message.toLowerCase();
      setError(
        msg.includes("not confirmed")
          ? "Este usuario no está confirmado. En Supabase → Authentication → Users, confírmalo o créalo de nuevo con «Auto Confirm User»."
          : msg.includes("invalid login")
            ? "Correo o contraseña incorrectos."
            : `No se pudo ingresar: ${err.message}`,
      );
    }
  }

  return (
    <AuthShell>
      <form onSubmit={submit} className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-pop">
        <h1 className="text-lg font-extrabold text-ink-900">Ingresar</h1>
        <Field label="Correo" htmlFor="admin-email">
          <Input id="admin-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="Contraseña" htmlFor="admin-pass">
          <Input
            id="admin-pass"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        <ErrorNote message={error} />
        <Button type="submit" variant="primary" disabled={busy}>
          {busy ? "Ingresando…" : "Ingresar al panel"}
        </Button>
      </form>
      <a href="/" className="mt-5 block text-center text-sm text-ink-300 hover:text-volt-300">
        ← Volver a la web
      </a>
    </AuthShell>
  );
}

/* -------------------------------------------------------------------------- */
/* Avisos: sonido + notificación del navegador + contador en la pestaña        */
/* -------------------------------------------------------------------------- */

function beep() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    [0, 0.18].forEach((delay, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = i === 0 ? 880 : 1175;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + delay + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + 0.16);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.18);
    });
  } catch {
    /* sin audio disponible */
  }
}

const ALERTS_KEY = "maquifly:admin-alerts";

function Dashboard({ email }: { email: string }) {
  const [tab, setTab] = useState<TabKey>("overview");
  const [counts, setCounts] = useState<Counts>({ messages: 0, submissions: 0, payments: 0, reports: 0 });
  const [menuOpen, setMenuOpen] = useState(false);
  const [alertsOn, setAlertsOn] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const previousTotal = useRef<number | null>(null);

  useEffect(() => {
    try {
      setAlertsOn(window.localStorage.getItem(ALERTS_KEY) === "on");
    } catch {
      /* almacenamiento no disponible */
    }
  }, []);

  const refreshCounts = useCallback(async () => {
    const c = db();
    const [m, s, p, r] = await Promise.all([
      c.from("contact_messages").select("id", { count: "exact", head: true }).eq("status", "new"),
      c.from("listing_submissions").select("id", { count: "exact", head: true }).eq("status", "new"),
      c.from("payments").select("id", { count: "exact", head: true }).eq("status", "pending"),
      c.from("reports").select("id", { count: "exact", head: true }).eq("status", "open"),
    ]);
    const next = {
      messages: m.count ?? 0,
      submissions: s.count ?? 0,
      payments: p.count ?? 0,
      reports: r.count ?? 0,
    };
    setCounts(next);

    const total = next.messages + next.submissions + next.payments + next.reports;
    if (previousTotal.current !== null && total > previousTotal.current) {
      // No se recarga la sección abierta (podrías estar editando): solo se avisa.
      let alerts = false;
      try {
        alerts = window.localStorage.getItem(ALERTS_KEY) === "on";
      } catch {
        /* sin almacenamiento */
      }
      if (alerts) {
        beep();
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("MaquiFly", { body: "Tienes novedades en el panel: mensajes, publicaciones o pagos." });
        }
      }
    }
    previousTotal.current = total;
    document.title = total > 0 ? `(${total}) Panel · MaquiFly` : "Panel · MaquiFly";
  }, []);

  // Revisa novedades cada 30 segundos mientras el panel está abierto.
  useEffect(() => {
    refreshCounts();
    const timer = setInterval(refreshCounts, 30_000);
    return () => clearInterval(timer);
  }, [refreshCounts]);

  async function toggleAlerts() {
    const next = !alertsOn;
    if (next) {
      if ("Notification" in window && Notification.permission === "default") {
        await Notification.requestPermission();
      }
      beep();
    }
    setAlertsOn(next);
    try {
      window.localStorage.setItem(ALERTS_KEY, next ? "on" : "off");
    } catch {
      /* sin almacenamiento */
    }
  }

  function go(next: TabKey) {
    setTab(next);
    setMenuOpen(false);
    window.scrollTo({ top: 0 });
  }

  const current = tabs.find((t) => t.key === tab)!;
  const groups = Array.from(new Set(tabs.map((t) => t.group)));
  const props = { onChange: refreshCounts, goTo: go };

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-5 pb-6 pt-6">
        <LogoMark size={38} className="text-ink-800" />
        <div className="leading-tight">
          <p className="font-display text-lg font-extrabold tracking-tight text-white">
            Maqui<span className="text-brand-400">Fly</span>
          </p>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-volt-300">Panel de control</p>
        </div>
      </div>

      <nav aria-label="Secciones del panel" className="flex-1 overflow-y-auto px-3">
        {groups.map((group) => (
          <div key={group} className="mb-5">
            <p className="px-3 pb-2 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-ink-400">{group}</p>
            <ul className="flex flex-col gap-1">
              {tabs
                .filter((t) => t.group === group)
                .map((item) => {
                  const badge = item.badge ? counts[item.badge] : 0;
                  const active = tab === item.key;
                  return (
                    <li key={item.key}>
                      <button
                        type="button"
                        onClick={() => go(item.key)}
                        aria-current={active ? "page" : undefined}
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-colors ${
                          active ? "bg-volt-400 text-ink-950" : "text-ink-100 hover:bg-white/10"
                        }`}
                      >
                        <item.Icon size={19} />
                        <span className="flex-1">{item.label}</span>
                        {badge > 0 && (
                          <span
                            className={`min-w-6 rounded-full px-1.5 py-0.5 text-center text-xs font-extrabold ${
                              active ? "bg-ink-950 text-volt-300" : "bg-volt-400 text-ink-950"
                            }`}
                          >
                            {badge}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 p-4">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="mb-3 flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-semibold text-ink-200 hover:bg-white/10"
        >
          <AIconExternal size={16} /> Ver la web
        </a>
        <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-extrabold text-white">
            {email.slice(0, 1).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-white">{email}</p>
            <p className="text-[0.65rem] text-ink-300">Administrador</p>
          </div>
          <button
            type="button"
            onClick={() => db().auth.signOut()}
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
            className="rounded-lg p-1.5 text-ink-300 hover:bg-white/10 hover:text-white"
          >
            <AIconLogout size={18} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-dvh bg-steel-50">
      {/* Barra lateral (escritorio) */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-68 bg-ink-950 lg:block">{sidebar}</aside>

      {/* Menú móvil */}
      {menuOpen && (
        <div className="fixed inset-0 z-60 lg:hidden">
          <div className="absolute inset-0 bg-ink-950/60" onClick={() => setMenuOpen(false)} aria-hidden="true" />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-ink-950 shadow-pop">{sidebar}</aside>
        </div>
      )}

      <div className="lg:pl-68">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-steel-200 bg-white/90 px-4 py-3 backdrop-blur sm:px-6">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Abrir menú"
            className="rounded-lg p-2 text-ink-900 hover:bg-steel-100 lg:hidden"
          >
            <AIconMenu size={22} />
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-steel-500">
              {new Date().toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long" })}
            </p>
            <p className="truncate text-base font-extrabold text-ink-900">{current.label}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              refreshCounts();
              setRefreshKey((k) => k + 1);
            }}
            className="flex items-center gap-2 rounded-lg border border-steel-300 px-3 py-2 text-sm font-semibold text-ink-800 hover:bg-steel-50"
            title="Actualizar"
          >
            <AIconRefresh size={17} />
            <span className="hidden sm:inline">Actualizar</span>
          </button>
          <button
            type="button"
            onClick={toggleAlerts}
            aria-pressed={alertsOn}
            title={alertsOn ? "Avisos activados: sonará cuando llegue algo nuevo" : "Activar avisos con sonido"}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${
              alertsOn ? "bg-ink-900 text-volt-300" : "border border-steel-300 text-ink-800 hover:bg-steel-50"
            }`}
          >
            <AIconBell size={17} />
            <span className="hidden sm:inline">{alertsOn ? "Avisos activos" : "Activar avisos"}</span>
          </button>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8" key={refreshKey}>
          {tab === "overview" && <OverviewTab counts={counts} {...props} />}
          {tab === "messages" && <MessagesTab {...props} />}
          {tab === "submissions" && <SubmissionsTab {...props} />}
          {tab === "machines" && <MachinesTab {...props} />}
          {tab === "owners" && <OwnersTab {...props} />}
          {tab === "payments" && <PaymentsTab {...props} />}
          {tab === "reports" && <ReportsTab {...props} />}
        </main>
      </div>
    </div>
  );
}
