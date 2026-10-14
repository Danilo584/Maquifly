"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { authErrorMessage, useSession } from "@/lib/account";
import { Button, LinkButton } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";

/**
 * Destino del enlace «Recuperar contraseña». Supabase abre esta página con
 * una sesión temporal en la URL; con ella se puede fijar la contraseña nueva.
 */
export function NewPasswordForm() {
  const router = useRouter();
  const { session, loading } = useSession();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (password.length < 8) return setError("La contraseña debe tener al menos 8 caracteres.");
    setBusy(true);
    setError(null);
    const { error: err } = await getSupabase()!.auth.updateUser({ password });
    setBusy(false);
    if (err) return setError(authErrorMessage(err.message));
    router.replace("/cuenta");
  }

  if (loading) return <p className="py-10 text-center text-sm text-steel-500">Cargando…</p>;

  if (!session) {
    return (
      <div className="rounded-2xl border border-steel-200 bg-white p-6 text-center sm:p-8">
        <h1 className="text-2xl font-extrabold text-ink-900">El enlace ya no es válido</h1>
        <p className="mt-3 text-sm leading-relaxed text-steel-600">
          Puede que haya vencido o que ya lo hayas usado. Pide uno nuevo desde «¿Olvidaste tu contraseña?».
        </p>
        <LinkButton href="/ingresar" variant="primary" fullWidth className="mt-6">
          Ir a iniciar sesión
        </LinkButton>
      </div>
    );
  }

  return (
    <form onSubmit={save} noValidate className="flex flex-col gap-4 rounded-2xl border border-steel-200 bg-white p-6 sm:p-8">
      <h1 className="text-2xl font-extrabold text-ink-900">Crea tu contraseña nueva</h1>
      <p className="-mt-2 text-sm text-steel-600">Para {session.user.email}</p>
      <Field label="Contraseña nueva" htmlFor="np-pass" required hint="Mínimo 8 caracteres.">
        <Input id="np-pass" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </Field>
      {error && (
        <p role="alert" className="rounded-lg border border-danger-500/30 bg-danger-50 px-3 py-2 text-sm text-danger-700">
          {error}
        </p>
      )}
      <Button type="submit" variant="primary" size="lg" fullWidth disabled={busy}>
        {busy ? "Guardando…" : "Guardar y entrar"}
      </Button>
    </form>
  );
}
