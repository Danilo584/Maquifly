import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { pageMetadata } from "@/lib/seo";
import { repository } from "@/lib/repository";
import { siteConfig } from "@/lib/site";
import { whatsappUrl } from "@/lib/whatsapp";
import {
  FOUNDER_SLOTS,
  formatPEN,
  formatUSD,
  founderPricePEN,
  founderSlotsLeft,
  hasBankAccount,
  payableItems,
  payment,
  toUSD,
  type PayableItem,
} from "@/lib/plans";

import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { LinkButton } from "@/components/ui/Button";
import { Callout } from "@/components/ui/Callout";
import { IconWhatsApp } from "@/components/ui/Icon";

/**
 * PAGO MANUAL
 * ---------------------------------------------------------------------------
 * No hay pasarela automática: la página muestra a dónde pagar y cómo enviar
 * la constancia. El plan o el destacado lo activa la administración después
 * de verificar el abono (tabla `payments` en supabase/schema.sql).
 */

export function generateStaticParams() {
  return payableItems().map(({ slug }) => ({ producto: slug }));
}

function findItem(slug: string): PayableItem | null {
  return payableItems().find((p) => p.slug === slug)?.item ?? null;
}

function itemName(item: PayableItem): string {
  return item.kind === "plan" ? item.plan.name : item.boost.name;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ producto: string }>;
}): Promise<Metadata> {
  const { producto } = await params;
  const item = findItem(producto);
  return {
    ...pageMetadata({
      title: item ? `Pagar ${itemName(item)}` : "Pagar",
      description: "Paga por Yape o transferencia y envía tu constancia por WhatsApp.",
      path: `/pagar/${producto}`,
    }),
    robots: { index: false, follow: false },
  };
}

export default async function PayPage({
  params,
}: {
  params: Promise<{ producto: string }>;
}) {
  const { producto } = await params;
  const item = findItem(producto);
  if (!item) notFound();

  const owners = await repository.listOwners();
  const slotsLeft = founderSlotsLeft(owners);

  const name = itemName(item);
  const normalPEN = item.kind === "plan" ? item.plan.pricePEN : item.boost.pricePEN;
  const founderApplies =
    item.kind === "plan" && item.plan.founderDiscountMonths > 0 && slotsLeft > 0;
  const amountPEN = founderApplies && item.kind === "plan" ? founderPricePEN(item.plan) : normalPEN;

  const proofLines = [
    `Hola MaquiFly, acabo de pagar ${name} por ${formatPEN(amountPEN)}.`,
    ...(founderApplies ? ["Quiero entrar al Programa Socio Fundador."] : []),
    "Adjunto la captura de la constancia.",
    "",
    "Mi nombre o empresa: ",
    ...(item.kind === "boost" ? ["Código de la máquina a destacar (MF-…): "] : []),
  ];
  const proofMessage = proofLines.join("\n");

  const steps = [
    {
      title: "Paga el monto",
      text: `Yapea ${formatPEN(amountPEN)} al ${payment.yape}${hasBankAccount ? ", o haz una transferencia" : ""}.`,
    },
    {
      title: "Toma captura",
      text: "Guarda la captura de la constancia donde se vean el monto, la fecha y el número de operación.",
    },
    {
      title: "Envíala por WhatsApp",
      text: "Mándala a nuestro WhatsApp con el botón «Enviar constancia».",
    },
    {
      title: "Activamos tu plan",
      text: "Verificamos el abono y activamos tu plan o destacado. Te confirmamos por WhatsApp.",
    },
  ];

  return (
    <div className="bg-steel-50">
      <div className="container-mf py-8 sm:py-12">
        <Breadcrumbs
          items={[
            { label: "Inicio", href: "/" },
            { label: "Planes", href: "/planes" },
            { label: `Pagar ${name}` },
          ]}
        />

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_1fr] lg:gap-10">
          {/* Resumen ---------------------------------------------------- */}
          <section className="rounded-2xl bg-ink-950 p-6 text-white sm:p-8">
            <p className="text-sm font-bold uppercase tracking-wider text-volt-300">Vas a pagar</p>
            <h1 className="mt-2 text-3xl font-extrabold text-white">{name}</h1>
            <p className="mt-5 text-5xl font-extrabold">
              {formatPEN(amountPEN)}
              {item.kind === "plan" && <span className="text-lg font-semibold text-ink-300"> /mes</span>}
            </p>
            <p className="mt-1 text-sm text-ink-300">≈ {formatUSD(toUSD(amountPEN))} (referencial)</p>

            {founderApplies && item.kind === "plan" && (
              <p className="mt-4 rounded-xl border border-volt-400/40 bg-volt-400/10 p-3 text-sm leading-relaxed text-volt-200">
                Precio Socio Fundador (quedan {slotsLeft} de {FOUNDER_SLOTS} cupos) por{" "}
                {item.plan.founderDiscountMonths === 1
                  ? "el primer mes"
                  : `los primeros ${item.plan.founderDiscountMonths} meses`}
                . Luego {formatPEN(item.plan.pricePEN)}/mes. Si al verificar tu pago
                los cupos ya se ocuparon, te avisamos antes de activar.
              </p>
            )}
            {item.kind === "boost" && (
              <p className="mt-4 text-sm leading-relaxed text-ink-200">
                Una máquina, {item.boost.days} días en los primeros lugares del buscador con la
                etiqueta «Destacado». Indica el código de la máquina al enviar la constancia.
              </p>
            )}

            <ol className="mt-8 flex flex-col gap-4">
              {steps.map((step, i) => (
                <li key={step.title} className="flex gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-volt-400 text-sm font-extrabold text-ink-950">
                    {i + 1}
                  </span>
                  <span>
                    <span className="block font-bold">{step.title}</span>
                    <span className="block text-sm leading-relaxed text-ink-200">{step.text}</span>
                  </span>
                </li>
              ))}
            </ol>
          </section>

          {/* Medios de pago --------------------------------------------- */}
          <section className="flex flex-col gap-4">
            <div className="rounded-2xl border border-steel-200 bg-white p-6">
              <h2 className="text-lg font-extrabold text-ink-900">Yape</h2>
              <p className="mt-3 text-sm text-steel-500">Número</p>
              <p className="text-3xl font-extrabold tracking-wide text-ink-900">{payment.yape}</p>
              {payment.holder && (
                <p className="mt-1 text-sm text-steel-600">
                  A nombre de <strong>{payment.holder}</strong>
                </p>
              )}
              {payment.yapeQr && (
                <Image
                  src={payment.yapeQr}
                  alt="Código QR de Yape de MaquiFly"
                  width={220}
                  height={220}
                  className="mt-4 rounded-xl border border-steel-200"
                />
              )}
            </div>

            <div className="rounded-2xl border border-steel-200 bg-white p-6">
              <h2 className="text-lg font-extrabold text-ink-900">Transferencia bancaria</h2>
              {hasBankAccount ? (
                <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
                  <dt className="text-steel-500">Banco</dt>
                  <dd className="font-semibold text-ink-900">{payment.bank.name}</dd>
                  <dt className="text-steel-500">Cuenta</dt>
                  <dd className="font-semibold text-ink-900">{payment.bank.account}</dd>
                  {payment.bank.cci && (
                    <>
                      <dt className="text-steel-500">CCI</dt>
                      <dd className="font-semibold text-ink-900">{payment.bank.cci}</dd>
                    </>
                  )}
                  {payment.bank.holder && (
                    <>
                      <dt className="text-steel-500">Titular</dt>
                      <dd className="font-semibold text-ink-900">{payment.bank.holder}</dd>
                    </>
                  )}
                </dl>
              ) : (
                <p className="mt-2 text-sm leading-relaxed text-steel-600">
                  ¿Prefieres transferencia? Escríbenos por WhatsApp y te enviamos
                  los datos de la cuenta.
                </p>
              )}
            </div>

            <LinkButton
              href={whatsappUrl(siteConfig.contact.whatsapp, proofMessage)}
              external
              variant="whatsapp"
              size="lg"
              fullWidth
            >
              <IconWhatsApp size={20} />
              Enviar constancia por WhatsApp
            </LinkButton>

            <Callout tone="warn">
              Paga solo a los datos de esta página. MaquiFly nunca te pedirá
              pagar a otro número ni tus claves bancarias. Tu plan se activa
              cuando verificamos el abono, no al tocar este botón.
            </Callout>
          </section>
        </div>
      </div>
    </div>
  );
}
