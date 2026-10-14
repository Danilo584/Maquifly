"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SUPABASE_READY } from "@/lib/site";
import { getSupabase } from "@/lib/supabase";
import { authErrorMessage, useSession } from "@/lib/account";
import { Button, LinkButton } from "@/components/ui/Button";
import { Callout } from "@/components/ui/Callout";
import { Field, Input } from "@/components/ui/Field";
import { PrivacyConsent } from "@/components/common/PrivacyConsent";
import { PlanPicker } from "@/components/account/PlanPicker";
import type { PlanId } from "@/lib/plans";
import { IconCheck, IconMail, IconPlus, IconUser } from "@/components/ui/Icon";

type Mode = "login" | "signup" | "forgot";

const perks = [
  "Publica y edita tus máquinas cuando quieras.",
  "Pausa una máquina cuando ya está alquilada.",
  "Mira cuántas personas vieron y contactaron cada máquina.",
  "Gestiona tu plan Fly Start, Plus o Pro.",
];

export function AuthForm() {
  if (!SUPABASE_READY) return <AccountsUnavailable />;
  return <AuthFormInner />;
}

function AuthFormInner() {
  const router = useRouter();
  const { session, loading } = useSession();
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [consent, setConsent] = useState(false);
  const [plan, setPlan] = useState<PlanId>("start");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<{ email: string; kind: "confirm" | "reset" } | null>(null);

  // Si ya hay sesión, directo al panel.
  useEffect(() => {
    if (!loading && session) router.replace("/cuenta");
  }, [loading, session, router]);

  // /ingresar?plan=plus abre «Crear cuenta» con ese plan ya marcado.
  useEffect(() => {
    const wanted = new URLSearchParams(window.location.search).get("plan");
    if (wanted === "start" || wanted === "plus" || wanted === "pro") {
      setPlan(wanted);
      setMode("signup");
    }
  }, []);

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    setSentTo(null);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const supabase = getSupabase()!;
    const cleanEmail = email.trim().toLowerCase();
    setError(null);

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) return setError("Escribe un correo válido.");

    if (mode === "forgot") {
      setBusy(true);
      const { error: err } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: `${window.location.origin}/cuenta/nueva-clave`,
      });
      setBusy(false);
      if (err) return setError(authErrorMessage(err.message));
      return setSentTo({ email: cleanEmail, kind: "reset" });
    }

    if (password.length < 8) return setError("La contraseña debe tener al menos 8 caracteres.");

    if (mode === "signup") {
      if (name.trim().length < 2) return setError("Escribe tu nombre.");
      if (!consent) return setError("Para crear tu cuenta, acepta la política de privacidad.");
      setBusy(true);
      const { data, error: err } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: { name: name.trim(), plan_choice: plan },
          emailRedirectTo: `${window.location.origin}/cuenta`,
        },
      });
      setBusy(false);
      if (err) return setError(authErrorMessage(err.message));
      // Con confirmación de correo activa, Supabase no revela si el correo ya
      // existía: devuelve un usuario sin identidades.
      if (data.user && data.user.identities?.length === 0) {
        return setError(authErrorMessage("already registered"));
      }
      if (data.session) return router.replace("/cuenta");
      return setSentTo({ email: cleanEmail, kind: "confirm" });
    }

    setBusy(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
    setBusy(false);
    if (err) return setError(authErrorMessage(err.message));
    router.replace("/cuenta");
  }

  if (loading || session) {
    return <p className="py-16 text-center text-sm text-steel-500">Cargando…</p>;
  }

  if (sentTo) {
    return (
      <Card>
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-ink-900 text-volt-400">
          <IconMail size={26} />
        </span>
        <h1 className="mt-5 text-center text-2xl font-extrabold text-ink-900">Revisa tu correo</h1>
        <p className="mt-3 text-center text-[0.95rem] leading-relaxed text-steel-600">
          {sentTo.kind === "confirm"
            ? "Te enviamos un enlace para confirmar tu cuenta a "
            : "Si existe una cuenta con ese correo, te enviamos un enlace para crear una contraseña nueva a "}
          <strong className="text-ink-900">{sentTo.email}</strong>. Ábrelo desde este mismo celular o computadora.
        </p>
        <Callout tone="neutral" className="mt-5">
          ¿No llega en unos minutos? Mira en spam o «Promociones». Si sigue sin llegar, escríbenos por WhatsApp.
        </Callout>
        <Button variant="secondary" fullWidth className="mt-5" onClick={() => switchMode("login")}>
          Volver a iniciar sesión
        </Button>
      </Card>
    );
  }

  const title =
    mode === "login" ? "Ingresa a tu cuenta" : mode === "signup" ? "Crea tu cuenta de propietario" : "Recupera tu contraseña";

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_0.85fr] lg:items-start lg:gap-10">
      <Card>
        {mode !== "forgot" && (
          <div role="tablist" aria-label="Elige una opción" className="mb-6 grid grid-cols-2 gap-1 rounded-xl bg-steel-100 p-1">
            {(["login", "signup"] as const).map((m) => (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={mode === m}
                onClick={() => switchMode(m)}
                className={`h-10 rounded-lg text-sm font-bold transition-colors ${
                  mode === m ? "bg-white text-ink-900 shadow-sm" : "text-steel-600 hover:text-ink-900"
                }`}
              >
                {m === "login" ? "Iniciar sesión" : "Crear cuenta"}
              </button>
            ))}
          </div>
        )}

        <h1 className="text-2xl font-extrabold text-ink-900">{title}</h1>
        {mode === "forgot" && (
          <p className="mt-2 text-sm leading-relaxed text-steel-600">
            Escribe el correo con el que te registraste y te enviamos un enlace para crear una contraseña nueva.
          </p>
        )}

        <form onSubmit={submit} noValidate className="mt-5 flex flex-col gap-4">
          {mode === "signup" && (
            <Field label="Tu nombre" htmlFor="auth-name" required>
              <Input id="auth-name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} />
            </Field>
          )}
          <Field label="Correo" htmlFor="auth-email" required>
            <Input
              id="auth-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          {mode !== "forgot" && (
            <Field
              label="Contraseña"
              htmlFor="auth-pass"
              required
              hint={mode === "signup" ? "Mínimo 8 caracteres." : undefined}
            >
              <div className="relative">
                <Input
                  id="auth-pass"
                  type={showPassword ? "text" : "password"}
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-bold text-brand-700 hover:bg-brand-50"
                  aria-pressed={showPassword}
                >
                  {showPassword ? "Ocultar" : "Mostrar"}
                </button>
              </div>
            </Field>
          )}
          {mode === "login" && (
            <button
              type="button"
              onClick={() => switchMode("forgot")}
              className="-mt-1 self-start text-sm font-semibold text-brand-700 hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </button>
          )}
          {mode === "signup" && <PlanPicker value={plan} onChange={setPlan} name="auth-plan" />}
          {mode === "signup" && (
            <PrivacyConsent id="auth-consent" checked={consent} onChange={setConsent} purpose="crear y gestionar mi cuenta" />
          )}

          {error && (
            <p role="alert" className="rounded-lg border border-danger-500/30 bg-danger-50 px-3 py-2 text-sm text-danger-700">
              {error}
            </p>
          )}

          <Button type="submit" variant="primary" size="lg" fullWidth disabled={busy}>
            {busy
              ? "Un momento…"
              : mode === "login"
                ? "Ingresar"
                : mode === "signup"
                  ? "Crear mi cuenta"
                  : "Enviarme el enlace"}
          </Button>
          {mode === "forgot" && (
            <Button variant="ghost" fullWidth onClick={() => switchMode("login")}>
              Volver
            </Button>
          )}
        </form>
      </Card>

      <aside className="rounded-2xl bg-ink-950 p-6 text-white sm:p-7">
        <span className="flex size-12 items-center justify-center rounded-full bg-volt-400 text-ink-950">
          <IconUser size={22} />
        </span>
        <p className="mt-4 text-lg font-extrabold">Con tu cuenta de propietario</p>
        <ul className="mt-4 flex flex-col gap-3">
          {perks.map((perk) => (
            <li key={perk} className="flex items-start gap-2.5">
              <IconCheck size={16} className="mt-0.5 shrink-0 text-volt-400" />
              <span className="text-sm leading-relaxed text-ink-100">{perk}</span>
            </li>
          ))}
        </ul>
        <p className="mt-5 text-sm leading-relaxed text-ink-300">
          Crear la cuenta es gratis. Si eliges Fly Plus o Fly Pro, al terminar tu perfil te mostramos cómo pagar.{" "}
          <Link href="/planes" className="font-semibold text-volt-300 underline underline-offset-2">
            Ver planes
          </Link>
        </p>
        <div className="mt-6 border-t border-white/10 pt-5">
          <p className="text-sm text-ink-300">¿Solo quieres publicar una máquina rápido?</p>
          <LinkButton href="/publicar" variant="outline" size="sm" className="mt-3">
            <IconPlus size={16} />
            Publicar sin cuenta
          </LinkButton>
        </div>
      </aside>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border border-steel-200 bg-white p-6 sm:p-8">{children}</div>;
}

function AccountsUnavailable() {
  return (
    <div className="mx-auto max-w-lg">
      <Card>
        <h1 className="text-center text-2xl font-extrabold text-ink-900">Las cuentas todavía no están activas</h1>
        <p className="mt-3 text-center text-[0.95rem] leading-relaxed text-steel-600">
          Mientras tanto puedes publicar tu maquinaria sin crear una cuenta.
        </p>
        <LinkButton href="/publicar" variant="primary" size="lg" fullWidth className="mt-6">
          <IconPlus size={19} />
          Publicar sin cuenta
        </LinkButton>
      </Card>
    </div>
  );
}
