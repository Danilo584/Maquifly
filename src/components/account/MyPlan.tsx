"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  boostPackages,
  FOUNDER_SLOTS,
  formatPEN,
  founderPricePEN,
  hasBankAccount,
  payment,
  planOrder,
  plans,
  type PlanId,
} from "@/lib/plans";
import { getSupabase } from "@/lib/supabase";
import { siteConfig } from "@/lib/site";
import { whatsappUrl } from "@/lib/whatsapp";
import { dbErrorMessage, effectivePlan, useFounderSlotsLeft, type MyMachine, type MyOwner, type MyPayment } from "@/lib/account";
import { Badge } from "@/components/ui/Badge";
import { Button, LinkButton } from "@/components/ui/Button";
import { Callout } from "@/components/ui/Callout";
import { Field, Input, Select } from "@/components/ui/Field";
import { IconBolt, IconCheck, IconWhatsApp } from "@/components/ui/Icon";

const productLabel: Record<MyPayment["product"], string> = {
  "fly-plus": `${plans.plus.name} (1 mes)`,
  "fly-pro": `${plans.pro.name} (1 mes)`,
  "destacado-7": boostPackages[0]?.name ?? "Destacado Express",
};

const productPrice: Record<MyPayment["product"], number> = {
  "fly-plus": plans.plus.pricePEN,
  "fly-pro": plans.pro.pricePEN,
  "destacado-7": boostPackages[0]?.pricePEN ?? 0,
};

/** Precio a pagar: con descuento Socio Fundador si quedan cupos (mismo criterio que /pagar). */
function priceFor(product: MyPayment["product"], founderOpen: boolean): number {
  if (founderOpen && product !== "destacado-7") {
    const p = plans[product === "fly-plus" ? "plus" : "pro"];
    if (p.founderDiscountMonths > 0) return founderPricePEN(p);
  }
  return productPrice[product];
}

const statusLabel: Record<MyPayment["status"], { text: string; tone: "warn" | "ok" | "danger" }> = {
  pending: { text: "En verificación", tone: "warn" },
  approved: { text: "Aprobado", tone: "ok" },
  rejected: { text: "No aprobado", tone: "danger" },
};

/**
 * MI PLAN
 * ---------------------------------------------------------------------------
 * Los precios y beneficios salen de src/lib/plans.ts (misma fuente que
 * /planes). El cobro sigue siendo manual: el propietario paga, registra aquí
 * su número de operación y la administración lo aprueba en el panel. Nada se
 * activa solo.
 */
export function MyPlan({
  owner,
  machines,
  planChoice,
}: {
  owner: MyOwner;
  machines: MyMachine[];
  /** Plan que eligió al crear su cuenta (o después). */
  planChoice: PlanId;
}) {
  const current = effectivePlan(owner);
  const plan = plans[current];
  const published = machines.filter((m) => m.status === "published").length;
  const expired = owner.plan !== "start" && current === "start";

  const [payments, setPayments] = useState<MyPayment[] | null>(null);
  const [showForm, setShowForm] = useState(false);
  const slotsLeft = useFounderSlotsLeft();
  const founderOpen = (slotsLeft ?? 0) > 0;

  const loadPayments = useCallback(async () => {
    const { data } = await getSupabase()!
      .from("payments")
      .select("id, product, machine_id, amount_pen, method, operation_number, status, note, created_at")
      .eq("owner_id", owner.id)
      .order("created_at", { ascending: false })
      .limit(20);
    setPayments((data as MyPayment[]) ?? []);
  }, [owner.id]);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  const pending = (payments ?? []).filter((p) => p.status === "pending");

  // Eligió un plan pagado que aún no tiene y no hay un pago de ese plan en
  // verificación: se le muestra cómo pagarlo, arriba de todo.
  const wantsUpgrade =
    planChoice !== "start" &&
    planOrder.indexOf(planChoice) > planOrder.indexOf(current) &&
    payments !== null &&
    !pending.some((p) => p.product === `fly-${planChoice}`);
  const pct = plan.maxMachines === null ? 100 : Math.min(100, Math.round((published / plan.maxMachines) * 100));

  return (
    <section className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-extrabold text-ink-900 sm:text-2xl">Mi plan</h2>
        <p className="mt-1 text-sm text-steel-600">Qué incluye tu plan y cómo mejorarlo.</p>
      </div>

      {expired && (
        <Callout tone="warn" title={`Tu ${plans[owner.plan].name} venció`}>
          Volviste a Fly Start. Renueva para recuperar el WhatsApp directo y la prioridad en las búsquedas.
        </Callout>
      )}
      {pending.length > 0 && (
        <Callout tone="info" title="Estamos verificando tu pago">
          Apenas confirmemos el abono activamos tu plan y te avisamos por WhatsApp.
        </Callout>
      )}

      {wantsUpgrade && slotsLeft !== null && (
        <CompletePayment owner={owner} planId={planChoice} slotsLeft={slotsLeft} onPaid={loadPayments} />
      )}

      {/* Plan actual --------------------------------------------------- */}
      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <div className="rounded-2xl bg-ink-950 p-6 text-white sm:p-7">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-volt-300">Tu plan actual</p>
          <p className="mt-2 text-3xl font-extrabold">{plan.name}</p>
          <p className="mt-1 text-sm text-ink-200">
            {current === "start"
              ? "Gratis, sin fecha de vencimiento."
              : `Vigente hasta el ${new Date(owner.plan_expires_at!).toLocaleDateString("es-PE", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}.`}
          </p>
          {owner.founder_number !== null && (
            <Badge tone="volt" size="sm" className="mt-3">
              Socio Fundador #{owner.founder_number}
            </Badge>
          )}

          <div className="mt-6">
            <div className="flex items-baseline justify-between text-sm">
              <span className="text-ink-200">Máquinas publicadas</span>
              <span className="font-bold">
                {published}
                {plan.maxMachines !== null ? ` de ${plan.maxMachines}` : " · sin límite"}
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
              <div
                className={`h-full rounded-full ${pct >= 100 && plan.maxMachines !== null ? "bg-warn-500" : "bg-volt-400"}`}
                style={{ width: `${plan.maxMachines === null ? 100 : Math.max(pct, published > 0 ? 8 : 0)}%` }}
              />
            </div>
          </div>

          <ul className="mt-6 flex flex-col gap-2">
            {plan.benefits.map((b) => (
              <li key={b} className="flex items-start gap-2.5 text-sm text-ink-100">
                <IconCheck size={15} className="mt-0.5 shrink-0 text-volt-400" />
                {b}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-steel-200 bg-white p-5 sm:p-6">
            <p className="flex items-center gap-2 font-bold text-ink-900">
              <IconBolt size={18} className="text-brand-600" />
              {boostPackages[0]?.name}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-steel-600">
              Sube una máquina a los primeros lugares del buscador por {boostPackages[0]?.days} días, sin cambiar de plan.
            </p>
            <p className="mt-3 text-2xl font-extrabold text-ink-900">{formatPEN(boostPackages[0]?.pricePEN ?? 0)}</p>
            <LinkButton href="/pagar/destacado-7" variant="secondary" size="sm" className="mt-3">
              Destacar una máquina
            </LinkButton>
          </div>
          <div className="rounded-2xl border border-steel-200 bg-white p-5 sm:p-6">
            <p className="font-bold text-ink-900">¿Ya pagaste?</p>
            <p className="mt-1 text-sm leading-relaxed text-steel-600">
              Registra tu número de operación aquí para que lo verifiquemos más rápido. También puedes mandar la captura por
              WhatsApp.
            </p>
            <Button variant="primary" size="sm" className="mt-3" onClick={() => setShowForm((v) => !v)}>
              {showForm ? "Cerrar" : "Registrar mi pago"}
            </Button>
          </div>
        </div>
      </div>

      {showForm && (
        <PaymentForm
          owner={owner}
          machines={machines}
          founderOpen={founderOpen}
          onDone={async () => {
            setShowForm(false);
            await loadPayments();
          }}
        />
      )}

      {/* Comparar planes ------------------------------------------------ */}
      <div>
        <h3 className="text-lg font-extrabold text-ink-900">Planes</h3>
        <ul className="mt-3 grid gap-4 md:grid-cols-3">
          {planOrder.map((id) => (
            <PlanCard key={id} id={id} current={current} slotsLeft={slotsLeft} />
          ))}
        </ul>
        <p className="mt-3 text-sm text-steel-500">
          Detalles, Programa Socio Fundador y preguntas frecuentes en{" "}
          <Link href="/planes" className="font-semibold text-brand-700 hover:underline">
            la página de planes
          </Link>
          .
        </p>
      </div>

      {/* Historial ------------------------------------------------------ */}
      <div>
        <h3 className="text-lg font-extrabold text-ink-900">Mis pagos</h3>
        {payments === null ? (
          <p className="mt-3 text-sm text-steel-500">Cargando…</p>
        ) : payments.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-dashed border-steel-300 bg-white px-5 py-8 text-center text-sm text-steel-500">
            Todavía no registras pagos.
          </p>
        ) : (
          <ul className="mt-3 flex flex-col gap-2">
            {payments.map((p) => (
              <li
                key={p.id}
                className="flex flex-col gap-1 rounded-xl border border-steel-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold text-ink-900">
                    {productLabel[p.product]} · {formatPEN(Number(p.amount_pen))}
                  </p>
                  <p className="text-xs text-steel-500">
                    {new Date(p.created_at).toLocaleDateString("es-PE", { day: "numeric", month: "short", year: "numeric" })}
                    {p.operation_number ? ` · Operación ${p.operation_number}` : ""}
                    {p.status === "rejected" && p.note ? ` · ${p.note}` : ""}
                  </p>
                </div>
                <Badge tone={statusLabel[p.status].tone} size="sm">
                  {statusLabel[p.status].text}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function PlanCard({ id, current, slotsLeft }: { id: PlanId; current: PlanId; slotsLeft: number | null }) {
  const p = plans[id];
  const founder = p.founderDiscountMonths > 0 && (slotsLeft ?? 0) > 0;
  const isCurrent = id === current;
  const rank = planOrder.indexOf(id) - planOrder.indexOf(current);

  return (
    <li
      className={`flex flex-col rounded-2xl border bg-white p-5 ${
        isCurrent ? "border-brand-500 ring-2 ring-brand-500/20" : "border-steel-200"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-lg font-extrabold text-ink-900">{p.name}</p>
        {isCurrent && (
          <Badge tone="brand" size="sm">
            Tu plan
          </Badge>
        )}
      </div>
      <p className="text-sm text-steel-600">{p.idealFor}</p>
      {founder ? (
        <>
          <p className="mt-3 text-sm text-steel-500">
            Precio normal: <span className="line-through">{formatPEN(p.pricePEN)}</span> /mes
          </p>
          <p className="text-3xl font-extrabold text-ink-900">
            {formatPEN(founderPricePEN(p))}
            <span className="text-sm font-semibold text-steel-500"> /mes</span>
          </p>
          <p className="mt-1 text-xs font-bold text-brand-700">
            Precio Socio Fundador · {p.founderDiscountMonths === 1 ? "primer mes" : `primeros ${p.founderDiscountMonths} meses`}
          </p>
        </>
      ) : (
        <p className="mt-3 text-3xl font-extrabold text-ink-900">
          {p.pricePEN === 0 ? "Gratis" : slotsLeft === null ? "…" : formatPEN(p.pricePEN)}
          {p.pricePEN > 0 && slotsLeft !== null && <span className="text-sm font-semibold text-steel-500"> /mes</span>}
        </p>
      )}
      <ul className="mt-4 flex flex-1 flex-col gap-2">
        {p.includesPrevious && <li className="text-sm font-semibold text-ink-900">{p.includesPrevious}, más:</li>}
        {p.benefits.slice(0, 5).map((b) => (
          <li key={b} className="flex items-start gap-2 text-sm text-steel-700">
            <IconCheck size={14} className="mt-0.5 shrink-0 text-ok-500" />
            {b}
          </li>
        ))}
        {p.benefits.length > 5 && <li className="text-xs text-steel-500">y {p.benefits.length - 5} beneficios más</li>}
      </ul>
      <div className="mt-5">
        {id === "start" ? null : isCurrent ? (
          <LinkButton href={`/pagar/fly-${id}`} variant="secondary" size="sm" fullWidth>
            Renovar
          </LinkButton>
        ) : rank > 0 ? (
          <LinkButton href={`/pagar/fly-${id}`} variant="primary" size="sm" fullWidth>
            Mejorar a {p.name}
          </LinkButton>
        ) : null}
      </div>
    </li>
  );
}

function PaymentForm({
  owner,
  machines,
  onDone,
  initialProduct,
  initialAmount,
  founderRequested = false,
  founderOpen = false,
  title = "Registrar mi pago",
  showIntro = true,
}: {
  owner: MyOwner;
  machines: MyMachine[];
  onDone: () => Promise<void>;
  initialProduct?: MyPayment["product"];
  initialAmount?: number;
  founderRequested?: boolean;
  founderOpen?: boolean;
  title?: string;
  showIntro?: boolean;
}) {
  const live = machines.filter((m) => m.status === "published");
  const startProduct: MyPayment["product"] = initialProduct ?? (owner.plan === "pro" ? "fly-pro" : "fly-plus");
  const [product, setProduct] = useState<MyPayment["product"]>(startProduct);
  const [machineId, setMachineId] = useState(live[0]?.id ?? "");
  const [method, setMethod] = useState<"yape" | "transfer">("yape");
  const [amount, setAmount] = useState(String(initialAmount ?? priceFor(startProduct, founderOpen)));
  const [operation, setOperation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    const value = Number(amount.replace(",", "."));
    if (!Number.isFinite(value) || value <= 0) return setError("Escribe el monto que pagaste.");
    if (operation.trim().length < 4) return setError("Escribe el número de operación que aparece en tu constancia.");
    if (product === "destacado-7" && !machineId) return setError("Elige la máquina que quieres destacar (tiene que estar publicada).");

    setBusy(true);
    setError(null);
    const { error: err } = await getSupabase()!
      .from("payments")
      .insert({
        owner_id: owner.id,
        product,
        machine_id: product === "destacado-7" ? machineId : null,
        amount_pen: value,
        method,
        operation_number: operation.trim().slice(0, 40),
        founder_requested: (founderRequested || founderOpen) && product !== "destacado-7" && value < productPrice[product],
      });
    setBusy(false);
    if (err) return setError(dbErrorMessage(err.message));
    await onDone();
  }

  return (
    <form onSubmit={save} noValidate className="flex flex-col gap-4 rounded-2xl border border-brand-200 bg-white p-5 sm:p-6">
      <div>
        <p className="font-bold text-ink-900">{title}</p>
        {showIntro && (
          <p className="mt-1 text-sm text-steel-600">
            Paga primero por Yape al {payment.yape} o por transferencia (datos en la página de pago). Tu plan se activa cuando
            verificamos el abono, no al registrar este formulario.
          </p>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="¿Qué pagaste?" htmlFor="pay-product" required>
          <Select
            id="pay-product"
            value={product}
            onChange={(e) => {
              const next = e.target.value as MyPayment["product"];
              setProduct(next);
              setAmount(String(priceFor(next, founderOpen)));
            }}
          >
            {(Object.keys(productLabel) as Array<MyPayment["product"]>).map((k) => (
              <option key={k} value={k}>
                {productLabel[k]}
              </option>
            ))}
          </Select>
        </Field>
        {product === "destacado-7" && (
          <Field label="Máquina a destacar" htmlFor="pay-machine" required>
            <Select id="pay-machine" value={machineId} onChange={(e) => setMachineId(e.target.value)}>
              {live.length === 0 && <option value="">— Necesitas una máquina publicada —</option>}
              {live.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.reference} · {m.name}
                </option>
              ))}
            </Select>
          </Field>
        )}
        <Field label="Medio de pago" htmlFor="pay-method" required>
          <Select id="pay-method" value={method} onChange={(e) => setMethod(e.target.value as "yape" | "transfer")}>
            <option value="yape">Yape</option>
            <option value="transfer">Transferencia bancaria</option>
          </Select>
        </Field>
        <Field label="Monto pagado (S/)" htmlFor="pay-amount" required hint="Si eres Socio Fundador, pon el monto con descuento.">
          <Input id="pay-amount" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </Field>
        <Field label="Número de operación" htmlFor="pay-op" required hint="Aparece en la constancia de Yape o del banco.">
          <Input id="pay-op" inputMode="numeric" value={operation} onChange={(e) => setOperation(e.target.value)} maxLength={40} />
        </Field>
      </div>
      {error && (
        <p role="alert" className="rounded-lg border border-danger-500/30 bg-danger-50 px-3 py-2 text-sm text-danger-700">
          {error}
        </p>
      )}
      <div className="flex justify-end">
        <Button type="submit" variant="primary" disabled={busy}>
          {busy ? "Enviando…" : "Enviar para verificación"}
        </Button>
      </div>
    </form>
  );
}

/**
 * «Completa tu pago»: aparece cuando el propietario eligió Fly Plus o Fly Pro
 * al registrarse. Muestra el monto, a dónde pagar y el formulario para
 * registrar el número de operación. El plan lo activa el admin al aprobar.
 */
function CompletePayment({
  owner,
  planId,
  slotsLeft,
  onPaid,
}: {
  owner: MyOwner;
  planId: PlanId;
  slotsLeft: number;
  onPaid: () => Promise<void>;
}) {
  const target = plans[planId];
  const [busy, setBusy] = useState(false);

  // Mismo criterio que /planes y /pagar: con cupos libres, precio Socio Fundador.
  const founder = target.founderDiscountMonths > 0 && slotsLeft > 0;
  const amount = founder ? founderPricePEN(target) : target.pricePEN;
  const proof = [
    `Hola MaquiFly, acabo de pagar ${target.name} por ${formatPEN(amount)}.`,
    ...(founder ? ["Quiero entrar al Programa Socio Fundador."] : []),
    "Adjunto la captura de la constancia.",
    "",
    `Mi cuenta: ${owner.business_name}`,
  ].join("\n");

  async function keepFree() {
    setBusy(true);
    await getSupabase()!.auth.updateUser({ data: { plan_choice: "start" } });
    setBusy(false);
  }

  return (
    <div className="overflow-hidden rounded-2xl border-2 border-brand-500 bg-white">
      <div className="bg-ink-950 p-6 text-white sm:p-7">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-volt-300">Completa tu pago</p>
        <p className="mt-2 text-2xl font-extrabold sm:text-3xl">Elegiste {target.name}</p>
        <p className="mt-3 text-4xl font-extrabold">
          {formatPEN(amount)}
          <span className="text-base font-semibold text-ink-300"> /mes</span>
        </p>
        {founder ? (
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-volt-200">
            Precio Socio Fundador (quedan {slotsLeft} de {FOUNDER_SLOTS} cupos) por{" "}
            {target.founderDiscountMonths === 1 ? "el primer mes" : `los primeros ${target.founderDiscountMonths} meses`}. Luego{" "}
            {formatPEN(target.pricePEN)}/mes.
          </p>
        ) : (
          <p className="mt-3 text-sm text-ink-300">Luego {formatPEN(target.pricePEN)}/mes.</p>
        )}
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-200">
          Mientras verificamos tu pago sigues con Fly Start y ya puedes subir tus máquinas.
        </p>
      </div>

      <div className="grid gap-4 p-5 sm:p-6 lg:grid-cols-2">
        <div className="rounded-xl border border-steel-200 p-4">
          <p className="text-sm font-bold text-ink-900">1. Yapea {formatPEN(amount)}</p>
          <p className="mt-2 text-2xl font-extrabold tracking-wide text-ink-900">{payment.yape}</p>
          {payment.holder && <p className="text-sm text-steel-600">A nombre de {payment.holder}</p>}
          {hasBankAccount && (
            <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 border-t border-steel-100 pt-3 text-sm">
              <dt className="text-steel-500">o transfiere a</dt>
              <dd className="font-semibold text-ink-900">{payment.bank.name}</dd>
              <dt className="text-steel-500">Cuenta</dt>
              <dd className="font-semibold text-ink-900">{payment.bank.account}</dd>
              {payment.bank.cci && (
                <>
                  <dt className="text-steel-500">CCI</dt>
                  <dd className="font-semibold text-ink-900">{payment.bank.cci}</dd>
                </>
              )}
            </dl>
          )}
          <LinkButton href={whatsappUrl(siteConfig.contact.whatsapp, proof)} external variant="whatsapp" size="sm" className="mt-4">
            <IconWhatsApp size={16} />
            Enviar captura por WhatsApp
          </LinkButton>
        </div>
        <PaymentForm
          owner={owner}
          machines={[]}
          onDone={onPaid}
          initialProduct={`fly-${planId}` as MyPayment["product"]}
          initialAmount={amount}
          founderRequested={founder}
          title="2. Registra tu número de operación"
          showIntro={false}
        />
      </div>

      <div className="flex flex-col gap-2 border-t border-steel-100 px-5 py-4 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-steel-500">Tu plan se activa cuando verificamos el abono. Te avisamos por WhatsApp.</p>
        <button type="button" onClick={keepFree} disabled={busy} className="font-semibold text-steel-600 hover:text-ink-900">
          {busy ? "Un momento…" : "Prefiero seguir con Fly Start por ahora"}
        </button>
      </div>
    </div>
  );
}
