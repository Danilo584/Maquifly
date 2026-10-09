"use client";

import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { SUPABASE_READY } from "@/lib/site";
import { getSupabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { Callout } from "@/components/ui/Callout";
import { db, ErrorNote } from "@/components/admin/admin-shared";
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

const tabs: Array<{ key: TabKey; label: string; badge?: keyof Counts }> = [
  { key: "overview", label: "Resumen" },
  { key: "messages", label: "Mensajes", badge: "messages" },
  { key: "submissions", label: "Publicaciones recibidas", badge: "submissions" },
  { key: "machines", label: "Máquinas" },
  { key: "owners", label: "Propietarios" },
  { key: "payments", label: "Pagos y planes", badge: "payments" },
  { key: "reports", label: "Reportes", badge: "reports" },
];

export type Counts = {
  messages: number;
  submissions: number;
  payments: number;
  reports: number;
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
      <Callout tone="warn" title="Falta conectar la base de datos">
        El panel necesita Supabase. Cuando la web tenga la URL y la clave
        pública del proyecto, aquí aparecerá el inicio de sesión.
      </Callout>
    );
  }
  return <AdminGate />;
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

  if (checking) return <p className="py-10 text-center text-sm text-steel-500">Cargando…</p>;
  if (!session) return <LoginForm />;
  if (isAdmin === null) return <p className="py-10 text-center text-sm text-steel-500">Verificando permisos…</p>;
  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-md">
        <Callout tone="warn" title="Esta cuenta no es administradora">
          Iniciaste sesión como {session.user.email}, pero esa cuenta no tiene
          permisos de administración.
        </Callout>
        <Button variant="secondary" className="mt-4" onClick={() => db().auth.signOut()}>
          Cerrar sesión
        </Button>
      </div>
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
    if (err) setError("Correo o contraseña incorrectos.");
  }

  return (
    <form onSubmit={submit} className="mx-auto flex max-w-sm flex-col gap-4 rounded-2xl border border-steel-200 bg-white p-6">
      <h2 className="text-lg font-extrabold text-ink-900">Ingresar al panel</h2>
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
        {busy ? "Ingresando…" : "Ingresar"}
      </Button>
    </form>
  );
}

function Dashboard({ email }: { email: string }) {
  const [tab, setTab] = useState<TabKey>("overview");
  const [counts, setCounts] = useState<Counts>({ messages: 0, submissions: 0, payments: 0, reports: 0 });

  const refreshCounts = useCallback(async () => {
    const c = db();
    const [m, s, p, r] = await Promise.all([
      c.from("contact_messages").select("id", { count: "exact", head: true }).eq("status", "new"),
      c.from("listing_submissions").select("id", { count: "exact", head: true }).eq("status", "new"),
      c.from("payments").select("id", { count: "exact", head: true }).eq("status", "pending"),
      c.from("reports").select("id", { count: "exact", head: true }).eq("status", "open"),
    ]);
    setCounts({
      messages: m.count ?? 0,
      submissions: s.count ?? 0,
      payments: p.count ?? 0,
      reports: r.count ?? 0,
    });
  }, []);

  // Revisa novedades cada minuto mientras el panel está abierto.
  useEffect(() => {
    refreshCounts();
    const timer = setInterval(refreshCounts, 60_000);
    return () => clearInterval(timer);
  }, [refreshCounts]);

  const props = { onChange: refreshCounts, goTo: setTab };

  return (
    <div className="grid gap-6 lg:grid-cols-[15rem_minmax(0,1fr)]">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <nav aria-label="Secciones del panel" className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
          {tabs.map((item) => {
            const badge = item.badge ? counts[item.badge] : 0;
            const active = tab === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setTab(item.key)}
                aria-current={active ? "page" : undefined}
                className={`flex shrink-0 items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm font-semibold transition-colors ${
                  active ? "bg-ink-900 text-white" : "bg-white text-ink-800 hover:bg-steel-100"
                }`}
              >
                <span className="whitespace-nowrap">{item.label}</span>
                {badge > 0 && (
                  <span className="rounded-full bg-volt-400 px-2 py-0.5 text-xs font-extrabold text-ink-950">{badge}</span>
                )}
              </button>
            );
          })}
        </nav>
        <div className="mt-4 hidden rounded-xl border border-steel-200 bg-white p-3 text-xs text-steel-500 lg:block">
          Sesión: <span className="font-semibold text-ink-800">{email}</span>
          <button
            type="button"
            onClick={() => db().auth.signOut()}
            className="mt-2 block font-semibold text-brand-700 hover:underline"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="min-w-0">
        {tab === "overview" && <OverviewTab counts={counts} {...props} />}
        {tab === "messages" && <MessagesTab {...props} />}
        {tab === "submissions" && <SubmissionsTab {...props} />}
        {tab === "machines" && <MachinesTab {...props} />}
        {tab === "owners" && <OwnersTab {...props} />}
        {tab === "payments" && <PaymentsTab {...props} />}
        {tab === "reports" && <ReportsTab {...props} />}
      </div>
    </div>
  );
}

export type TabProps = {
  onChange: () => void;
  goTo: (tab: TabKey) => void;
};
