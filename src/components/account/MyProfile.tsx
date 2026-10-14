"use client";

import { useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { plans } from "@/lib/plans";
import { authErrorMessage, dbErrorMessage, effectivePlan, type MyOwner } from "@/lib/account";
import { normalizeWhatsapp, piuraDistricts } from "@/components/admin/admin-shared";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Field";

export function MyProfile({ owner, email, onSaved }: { owner: MyOwner; email: string; onSaved: () => Promise<void> }) {
  return (
    <section className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-extrabold text-ink-900 sm:text-2xl">Mis datos</h2>
        <p className="mt-1 text-sm text-steel-600">Lo que ven los clientes en tu perfil y tus máquinas.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-start">
        <ProfileForm owner={owner} onSaved={onSaved} />
        <PasswordForm email={email} />
      </div>
    </section>
  );
}

function ProfileForm({ owner, onSaved }: { owner: MyOwner; onSaved: () => Promise<void> }) {
  const [form, setForm] = useState({
    business_name: owner.business_name,
    whatsapp: owner.whatsapp,
    area: owner.area ?? "",
    description: owner.description ?? "",
    ruc: owner.ruc ?? "",
  });
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const set = (key: keyof typeof form, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  };
  const isPro = effectivePlan(owner) === "pro";
  const direct = plans[effectivePlan(owner)].directWhatsapp;

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (form.business_name.trim().length < 2) return setError("Escribe el nombre que verán los clientes.");
    const whatsapp = normalizeWhatsapp(form.whatsapp);
    if (!/^51\d{9}$/.test(whatsapp)) return setError("Escribe un WhatsApp peruano de 9 dígitos.");
    if (form.ruc.trim() && !/^(10|15|17|20)\d{9}$/.test(form.ruc.trim())) {
      return setError("RUC no válido: 11 dígitos, empieza con 10 o 20.");
    }

    setBusy(true);
    setError(null);
    const { error: err } = await getSupabase()!
      .from("owner_profiles")
      .update({
        business_name: form.business_name.trim(),
        whatsapp,
        area: form.area.trim() || null,
        description: form.description.trim(),
        ruc: form.ruc.trim() || null,
      })
      .eq("id", owner.id);
    setBusy(false);
    if (err) return setError(dbErrorMessage(err.message));
    setSaved(true);
    await onSaved();
  }

  return (
    <form onSubmit={save} noValidate className="flex flex-col gap-4 rounded-2xl border border-steel-200 bg-white p-5 sm:p-6">
      <p className="font-bold text-ink-900">Perfil de propietario</p>
      <Field label="Nombre público (empresa o persona)" htmlFor="pr-name" required>
        <Input id="pr-name" value={form.business_name} onChange={(e) => set("business_name", e.target.value)} maxLength={80} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="WhatsApp"
          htmlFor="pr-wa"
          required
          hint={direct ? "Visible para los clientes en tus fichas." : "Con Fly Start no se muestra: los clientes escriben a MaquiFly."}
        >
          <Input id="pr-wa" inputMode="tel" value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} />
        </Field>
        <Field label="Zona" htmlFor="pr-area" hint="Distrito, nunca la dirección exacta">
          <Input id="pr-area" list="pr-districts" value={form.area} onChange={(e) => set("area", e.target.value)} />
          <datalist id="pr-districts">
            {piuraDistricts.map((d) => (
              <option key={d} value={d} />
            ))}
          </datalist>
        </Field>
      </div>
      <Field label="Descripción" htmlFor="pr-desc">
        <Textarea id="pr-desc" className="min-h-24" value={form.description} onChange={(e) => set("description", e.target.value)} maxLength={600} />
      </Field>
      <Field label="RUC (opcional)" htmlFor="pr-ruc" hint={isPro ? "Se muestra en tu perfil de empresa." : "Solo se muestra con Fly Pro."}>
        <Input id="pr-ruc" inputMode="numeric" value={form.ruc} onChange={(e) => set("ruc", e.target.value)} maxLength={11} />
      </Field>
      {error && (
        <p role="alert" className="rounded-lg border border-danger-500/30 bg-danger-50 px-3 py-2 text-sm text-danger-700">
          {error}
        </p>
      )}
      <div className="flex items-center justify-end gap-3">
        {saved && <span className="text-sm font-semibold text-ok-700">Guardado</span>}
        <Button type="submit" variant="primary" disabled={busy}>
          {busy ? "Guardando…" : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}

function PasswordForm({ email }: { email: string }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (password.length < 8) return setError("Mínimo 8 caracteres.");
    setBusy(true);
    setError(null);
    const { error: err } = await getSupabase()!.auth.updateUser({ password });
    setBusy(false);
    if (err) return setError(authErrorMessage(err.message));
    setPassword("");
    setDone(true);
  }

  return (
    <form onSubmit={save} noValidate className="flex flex-col gap-4 rounded-2xl border border-steel-200 bg-white p-5 sm:p-6">
      <p className="font-bold text-ink-900">Acceso</p>
      <div>
        <p className="text-sm font-semibold text-ink-900">Correo</p>
        <p className="text-sm text-steel-600">{email}</p>
      </div>
      <Field label="Nueva contraseña" htmlFor="pw-new" hint="Mínimo 8 caracteres.">
        <Input
          id="pw-new"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setDone(false);
          }}
        />
      </Field>
      {error && (
        <p role="alert" className="rounded-lg border border-danger-500/30 bg-danger-50 px-3 py-2 text-sm text-danger-700">
          {error}
        </p>
      )}
      {done && <p className="text-sm font-semibold text-ok-700">Contraseña actualizada.</p>}
      <Button type="submit" variant="secondary" disabled={busy || !password}>
        {busy ? "Guardando…" : "Cambiar contraseña"}
      </Button>
    </form>
  );
}
