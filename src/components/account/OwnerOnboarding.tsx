"use client";

import { useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabase";
import { siteConfig } from "@/lib/site";
import { whatsappUrl } from "@/lib/whatsapp";
import { dbErrorMessage } from "@/lib/account";
import { makeSlug, normalizeWhatsapp, piuraDistricts } from "@/components/admin/admin-shared";
import { Button, LinkButton } from "@/components/ui/Button";
import { Callout } from "@/components/ui/Callout";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { IconWhatsApp } from "@/components/ui/Icon";
import { PlanPicker, planChoiceFrom } from "@/components/account/PlanPicker";
import { plans, type PlanId } from "@/lib/plans";

/**
 * Después de crear la cuenta, dos pasos:
 *   1. Elige tu plan (Fly Start, Plus o Pro).
 *   2. Tu perfil de propietario (nace en Fly Start y sin verificar: lo
 *      fuerza la base de datos; un plan pagado se activa al aprobar el pago).
 * Al terminar: si eligió un plan pagado, «Mi plan» para pagarlo; si es Fly
 * Start, se abre directo «Agregar máquina».
 */
export function OwnerOnboarding({ session, onCreated }: { session: Session; onCreated: () => Promise<void> }) {
  const metaName = (session.user.user_metadata?.name as string | undefined) ?? "";
  const chosenBefore = planChoiceFrom(session.user.user_metadata);
  const [step, setStep] = useState<1 | 2>(1);
  const [plan, setPlan] = useState<PlanId>(chosenBefore);
  const [form, setForm] = useState({ business_name: metaName, whatsapp: "", area: "", description: "" });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (key: keyof typeof form, value: string) => setForm((f) => ({ ...f, [key]: value }));

  function goTo(next: 1 | 2) {
    setStep(next);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (form.business_name.trim().length < 2) return setError("Escribe el nombre que verán los clientes.");
    const whatsapp = normalizeWhatsapp(form.whatsapp);
    if (!/^51\d{9}$/.test(whatsapp)) return setError("Escribe un WhatsApp peruano de 9 dígitos (ej. 987 654 321).");
    if (!form.area.trim()) return setError("Indica tu zona o distrito.");

    setBusy(true);
    setError(null);
    const { error: err } = await getSupabase()!
      .from("owner_profiles")
      .insert({
        user_id: session.user.id,
        slug: makeSlug(form.business_name),
        business_name: form.business_name.trim(),
        whatsapp,
        area: form.area.trim(),
        description: form.description.trim(),
        location_id: "loc-piura",
      });
    if (err) {
      setBusy(false);
      return setError(dbErrorMessage(err.message));
    }
    // El plan elegido se recuerda en la cuenta: «Mi plan» muestra cómo pagarlo.
    if (plan !== chosenBefore) await getSupabase()!.auth.updateUser({ data: { plan_choice: plan } });
    window.history.replaceState(null, "", plan === "start" ? "#nueva-maquina" : "#plan");
    setBusy(false);
    await onCreated();
  }

  const linkMessage = `Hola MaquiFly, ya tienen mis máquinas publicadas y acabo de crear mi cuenta con el correo ${session.user.email}. ¿Pueden vincularla a mi perfil?`;

  return (
    <div className="bg-steel-50">
      <div className="container-mf py-10 sm:py-14">
        <div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-[1fr_0.8fr] lg:items-start">
          <div className="flex flex-col gap-4 rounded-2xl border border-steel-200 bg-white p-6 sm:p-8">
            {/* Indicador de pasos */}
            <ol className="flex items-center gap-2 text-xs font-bold" aria-label="Pasos">
              {[
                { n: 1, label: "Tu plan" },
                { n: 2, label: "Tu perfil" },
              ].map(({ n, label }, i) => (
                <li key={n} className="flex items-center gap-2">
                  {i > 0 && <span className="h-px w-6 bg-steel-300" aria-hidden="true" />}
                  <span
                    aria-current={step === n ? "step" : undefined}
                    className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 ${
                      step === n ? "bg-ink-900 text-white" : step > n ? "bg-ok-50 text-ok-700" : "bg-steel-100 text-steel-500"
                    }`}
                  >
                    {step > n ? "✓" : n}. {label}
                  </span>
                </li>
              ))}
            </ol>

            {step === 1 ? (
              <>
                <div>
                  <h1 className="text-2xl font-extrabold text-ink-900">Elige tu plan</h1>
                  <p className="mt-2 text-sm leading-relaxed text-steel-600">
                    Puedes empezar gratis y mejorar cuando quieras desde tu cuenta.
                  </p>
                </div>
                <PlanPicker value={plan} onChange={setPlan} name="ob-plan" hideLegend />
                <Button variant="primary" size="lg" fullWidth onClick={() => goTo(2)}>
                  Continuar con {plans[plan].name}
                </Button>
              </>
            ) : (
              <form onSubmit={save} noValidate className="flex flex-col gap-4">
                <div>
                  <h1 className="text-2xl font-extrabold text-ink-900">Crea tu perfil de propietario</h1>
                  <p className="mt-2 text-sm leading-relaxed text-steel-600">
                    Así te verán los clientes en MaquiFly. Puedes cambiarlo después.
                  </p>
                </div>

                <Field label="Nombre público (empresa o persona)" htmlFor="ob-name" required hint="Ej. Maquinarias Nonajulca o Juan Pérez">
                  <Input id="ob-name" value={form.business_name} onChange={(e) => set("business_name", e.target.value)} maxLength={80} />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="WhatsApp" htmlFor="ob-wa" required hint="Ej. 987 654 321">
                    <Input id="ob-wa" inputMode="tel" autoComplete="tel" value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} />
                  </Field>
                  <Field label="Zona" htmlFor="ob-area" required hint="Distrito, nunca la dirección exacta">
                    <Input id="ob-area" list="ob-districts" value={form.area} onChange={(e) => set("area", e.target.value)} />
                    <datalist id="ob-districts">
                      {piuraDistricts.map((d) => (
                        <option key={d} value={d} />
                      ))}
                    </datalist>
                  </Field>
                </div>
                <Field label="Descripción (opcional)" htmlFor="ob-desc" hint="Qué máquinas tienes, desde cuándo trabajas, qué zonas cubres.">
                  <Textarea id="ob-desc" className="min-h-24" value={form.description} onChange={(e) => set("description", e.target.value)} maxLength={600} />
                </Field>

                {error && (
                  <p role="alert" className="rounded-lg border border-danger-500/30 bg-danger-50 px-3 py-2 text-sm text-danger-700">
                    {error}
                  </p>
                )}
                <Button type="submit" variant="primary" size="lg" fullWidth disabled={busy}>
                  {busy ? "Creando…" : plan === "start" ? "Crear perfil y agregar mi máquina" : `Crear perfil y pagar ${plans[plan].name}`}
                </Button>
                <button
                  type="button"
                  onClick={() => goTo(1)}
                  className="self-center text-sm font-semibold text-brand-700 hover:underline"
                >
                  ← Cambiar plan ({plans[plan].name})
                </button>
              </form>
            )}

            <button
              type="button"
              onClick={() => getSupabase()!.auth.signOut()}
              className="self-center text-sm font-semibold text-steel-500 hover:text-ink-900"
            >
              Cerrar sesión
            </button>
          </div>

          <div className="flex flex-col gap-4">
            <Callout tone="info" title={plan === "start" ? "Empiezas gratis con Fly Start" : `Elegiste ${plans[plan].name}`}>
              {plan === "start"
                ? "Puedes publicar hasta 2 máquinas. Cuando quieras más alcance, mejoras tu plan desde tu cuenta."
                : "Al crear tu perfil te mostramos cómo pagar. Tu plan se activa apenas verifiquemos el pago; mientras tanto ya puedes subir tus máquinas."}
            </Callout>
            <div className="rounded-2xl border border-steel-200 bg-white p-5">
              <p className="font-bold text-ink-900">¿MaquiFly ya publicó tus máquinas?</p>
              <p className="mt-1 text-sm leading-relaxed text-steel-600">
                No crees otro perfil. Escríbenos y vinculamos tu cuenta al perfil que ya existe, con todas tus máquinas.
              </p>
              <LinkButton href={whatsappUrl(siteConfig.contact.whatsapp, linkMessage)} external variant="whatsapp" size="sm" className="mt-4">
                <IconWhatsApp size={17} />
                Vincular mi cuenta
              </LinkButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
