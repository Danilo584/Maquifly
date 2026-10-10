import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { repository } from "@/lib/repository";
import {
  FOUNDER_SLOTS,
  FX_REFERENCE_LABEL,
  boostPackages,
  formatPEN,
  formatUSD,
  founderPerks,
  founderPricePEN,
  founderSlotsLeft,
  planOrder,
  plans,
  toUSD,
} from "@/lib/plans";
import { platformWhatsappUrl } from "@/lib/whatsapp";

import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Section, SectionHeading } from "@/components/ui/Section";
import { LinkButton } from "@/components/ui/Button";
import { Callout } from "@/components/ui/Callout";
import { Faq } from "@/components/common/Faq";
import { FeaturedBadge, FounderBadge } from "@/components/owner/PlanBadges";
import { IconAward, IconBolt, IconCheck, IconWhatsApp } from "@/components/ui/Icon";

/** Se regenera cada minuto: lo que publicas en el panel aparece solo. */
export const revalidate = 60;

export const metadata: Metadata = pageMetadata({
  title: "Planes para propietarios — Fly Start, Fly Plus y Fly Pro",
  description:
    "Publica gratis con Fly Start o gana visibilidad con Fly Plus y Fly Pro. Programa Socio Fundador para los 10 primeros propietarios de Piura y Destacados Express desde S/ 25.",
  path: "/planes",
  keywords: ["planes MaquiFly", "publicar maquinaria Piura", "destacar anuncio maquinaria"],
});

const plansFaq = [
  {
    question: "¿Cómo pago un plan?",
    answer:
      "Eliges el plan, pagas por Yape o transferencia y nos envías la captura de la constancia por WhatsApp. Verificamos el abono y activamos tu plan, normalmente el mismo día hábil.",
  },
  {
    question: "¿Quiénes son Socios Fundadores?",
    answer: `Los ${FOUNDER_SLOTS} primeros propietarios que contraten Fly Plus o Fly Pro. Reciben el descuento de lanzamiento y la insignia «Socio Fundador», que es permanente mientras mantengan su cuenta activa.`,
  },
  {
    question: "¿Qué pasa cuando termina el descuento?",
    answer:
      "Se cobra el precio normal del plan. No hay contrato: si no renuevas, tu cuenta vuelve a Fly Start y tus publicaciones siguen visibles hasta el límite de ese plan.",
  },
  {
    question: "¿MaquiFly cobra comisión por mis alquileres?",
    answer:
      "No. Pagas solo el plan o el destacado que elijas. El precio del alquiler y el acuerdo con el cliente son tuyos.",
  },
  {
    question: "¿Por qué en Fly Start el cliente escribe a MaquiFly?",
    answer:
      "En el plan gratuito, MaquiFly recibe la consulta y te pone en contacto con el cliente. Así acompañamos el trato y el flete. Con Fly Plus y Fly Pro, el cliente te escribe directo a tu WhatsApp.",
  },
];

export default async function PlansPage() {
  const owners = await repository.listOwners();
  const slotsLeft = founderSlotsLeft(owners);
  const founderOpen = slotsLeft > 0;

  return (
    <>
      <section className="relative overflow-hidden bg-ink-950">
        <div className="grid-blueprint absolute inset-0" aria-hidden="true" />
        <div className="container-mf relative py-8 sm:py-14">
          <div className="[&_a]:text-ink-300 [&_a:hover]:text-volt-400 [&_span]:text-ink-100 [&_ol]:text-ink-400">
            <Breadcrumbs items={[{ label: "Inicio", href: "/" }, { label: "Planes" }]} />
          </div>
          <h1 className="mt-5 max-w-3xl text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">
            Tu máquina parada no gana. Publícala.
          </h1>
          <p className="mt-5 max-w-2xl text-[1.05rem] leading-relaxed text-ink-200">
            Empieza gratis con Fly Start. Cuando quieras más clientes, Fly Plus y
            Fly Pro ponen tus equipos primero. Sin comisión sobre tus alquileres.
          </p>

          {founderOpen && (
            <div className="mt-8 flex flex-col gap-4 rounded-2xl border-2 border-volt-400 bg-ink-900 p-5 sm:flex-row sm:items-center sm:p-6">
              <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-volt-400 text-ink-950">
                <IconAward size={30} />
              </span>
              <div className="flex-1">
                <p className="text-lg font-extrabold uppercase tracking-wide text-volt-300">
                  Programa Socio Fundador 2026
                </p>
                <p className="mt-1 text-sm leading-relaxed text-ink-100 sm:text-base">
                  Para los {FOUNDER_SLOTS} primeros propietarios con plan de pago:
                  50% de descuento (Fly Plus 3 meses · Fly Pro 1 mes) e insignia
                  permanente «Socio Fundador».
                </p>
              </div>
              <p className="shrink-0 rounded-full bg-volt-400 px-4 py-2 text-center text-sm font-extrabold text-ink-950">
                Quedan {slotsLeft} de {FOUNDER_SLOTS} cupos
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      <Section tone="muted">
        <SectionHeading
          eyebrow="Elige tu plan"
          title="Tres planes, sin contrato"
          description={`Precios en soles. Dólares referenciales (${FX_REFERENCE_LABEL}). Sin comisión sobre tus alquileres.`}
        />

        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {planOrder.map((id) => {
            const plan = plans[id];
            const highlighted = id === "plus";
            const founderPrice = founderPricePEN(plan);
            const dark = highlighted;
            return (
              <article
                key={id}
                className={`flex flex-col overflow-hidden rounded-2xl ${
                  dark
                    ? "border-2 border-volt-400 bg-ink-950 text-white shadow-pop"
                    : "border border-steel-200 bg-white text-ink-900 shadow-card"
                }`}
              >
                <header className={`p-6 ${dark ? "" : id === "pro" ? "bg-brand-600 text-white" : "bg-ink-800 text-white"}`}>
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-2xl font-extrabold tracking-tight text-white">{plan.name}</h2>
                    {highlighted && (
                      <span className="rounded-full bg-volt-400 px-2.5 py-1 text-xs font-extrabold uppercase tracking-wide text-ink-950">
                        Recomendado
                      </span>
                    )}
                  </div>
                  <p className={`mt-1 text-sm ${dark ? "text-ink-200" : "text-white/80"}`}>{plan.idealFor}</p>
                </header>

                <div className={`px-6 pb-2 ${dark ? "" : "pt-5"}`}>
                  {plan.pricePEN === 0 ? (
                    <>
                      <p className="text-4xl font-extrabold">Gratis</p>
                      <p className="mt-1 text-sm text-steel-500">Sin tarjeta y sin contrato</p>
                    </>
                  ) : founderOpen && plan.founderDiscountMonths > 0 ? (
                    <>
                      <p className={`text-sm ${dark ? "text-ink-300" : "text-steel-500"}`}>
                        Precio normal:{" "}
                        <span className="line-through">
                          {formatPEN(plan.pricePEN)} · {formatUSD(toUSD(plan.pricePEN))}
                        </span>{" "}
                        /mes
                      </p>
                      <p className="mt-1 text-4xl font-extrabold">
                        {formatPEN(founderPrice)}
                        <span className={`text-base font-semibold ${dark ? "text-ink-300" : "text-steel-500"}`}> /mes</span>
                      </p>
                      <p className={`text-sm font-semibold ${dark ? "text-ink-200" : "text-steel-600"}`}>
                        {formatUSD(toUSD(founderPrice))} /mes
                      </p>
                      <p className={`mt-2 text-sm font-bold ${dark ? "text-volt-300" : "text-brand-700"}`}>
                        Precio Socio Fundador ·{" "}
                        {plan.founderDiscountMonths === 1
                          ? "primer mes"
                          : `primeros ${plan.founderDiscountMonths} meses`}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-4xl font-extrabold">
                        {formatPEN(plan.pricePEN)}
                        <span className={`text-base font-semibold ${dark ? "text-ink-300" : "text-steel-500"}`}> /mes</span>
                      </p>
                      <p className={`text-sm font-semibold ${dark ? "text-ink-200" : "text-steel-600"}`}>
                        {formatUSD(toUSD(plan.pricePEN))} /mes
                      </p>
                    </>
                  )}
                </div>

                <ul className="flex flex-1 flex-col gap-2.5 px-6 py-5 text-sm">
                  {plan.includesPrevious && (
                    <li className={`flex items-start gap-2.5 font-bold ${dark ? "text-volt-300" : "text-brand-700"}`}>
                      <IconCheck size={17} className="mt-0.5 shrink-0" />
                      {plan.includesPrevious}
                    </li>
                  )}
                  {plan.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-start gap-2.5">
                      <IconCheck size={17} className={`mt-0.5 shrink-0 ${dark ? "text-volt-400" : "text-ok-500"}`} />
                      <span className={dark ? "text-ink-100" : "text-steel-700"}>{benefit}</span>
                    </li>
                  ))}
                </ul>

                <div className="px-6 pb-6">
                  {plan.pricePEN === 0 ? (
                    <LinkButton href="/publicar" variant="secondary" fullWidth>
                      Publicar gratis
                    </LinkButton>
                  ) : (
                    <LinkButton
                      href={`/pagar/fly-${id}`}
                      variant={dark ? "volt" : "primary"}
                      fullWidth
                    >
                      Elegir {plan.name}
                    </LinkButton>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        <ul className="mt-6 grid gap-1.5 text-sm text-steel-600 sm:grid-cols-2">
          <li>• Sin contrato: cancelas cuando quieras.</li>
          <li>• Al terminar la promoción se cobra el precio normal.</li>
          <li>• El plan se activa cuando verificamos tu pago.</li>
          <li>• Cobramos en soles (S/). Los dólares son referenciales.</li>
        </ul>
      </Section>

      {/* ------------------------------------------------------------------ */}
      <Section tone="light" id="fundadores">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
          <div>
            <SectionHeading
              eyebrow="Socios Fundadores"
              title={`Solo para los ${FOUNDER_SLOTS} primeros`}
              description="Los primeros propietarios que confíen en MaquiFly con un plan de pago se quedan con un lugar especial en la plataforma."
            />
            <ul className="mt-6 flex flex-col gap-3">
              {founderPerks.map((perk) => (
                <li key={perk} className="flex items-start gap-3 text-steel-700">
                  <IconCheck size={18} className="mt-0.5 shrink-0 text-ok-500" />
                  {perk}
                </li>
              ))}
            </ul>
            <p className="mt-5 text-sm font-semibold text-ink-900">
              {founderOpen
                ? `Cupos disponibles hoy: ${slotsLeft} de ${FOUNDER_SLOTS}.`
                : "Los 10 cupos de Socio Fundador ya se ocuparon. ¡Gracias!"}
            </p>
          </div>
          <div className="flex flex-col justify-center gap-4 rounded-2xl border border-steel-200 bg-steel-50 p-6">
            <p className="text-sm font-bold uppercase tracking-wider text-steel-500">
              Así se ven las insignias
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <FounderBadge size="md" />
              <FeaturedBadge size="md" />
            </div>
            <p className="text-sm leading-relaxed text-steel-600">
              «Socio Fundador» aparece en tu perfil y en todas tus máquinas.
              «Destacado» aparece en las fichas de Fly Plus, Fly Pro y en las
              máquinas con Destacado Express.
            </p>
          </div>
        </div>
      </Section>

      {/* ------------------------------------------------------------------ */}
      <Section tone="dark" id="destacados">
        <SectionHeading
          tone="dark"
          eyebrow="Destacados Express"
          title="¿Solo quieres impulsar una máquina?"
          description="Sin plan mensual: pagas una vez y tu máquina sube a los primeros lugares del buscador con la etiqueta «Destacado»."
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {boostPackages.map((boost) => (
            <div key={boost.id} className="flex flex-col gap-3 rounded-2xl border border-white/15 bg-white/5 p-6">
              <span className="flex size-11 items-center justify-center rounded-lg bg-volt-400 text-ink-950">
                <IconBolt size={22} />
              </span>
              <h3 className="text-xl font-extrabold text-white">{boost.days} días destacada</h3>
              <p className="text-3xl font-extrabold text-white">
                {formatPEN(boost.pricePEN)}
                <span className="ml-2 text-base font-semibold text-ink-300">
                  ≈ {formatUSD(toUSD(boost.pricePEN))}
                </span>
              </p>
              <p className="text-sm text-ink-200">Una máquina, pago único, se activa al verificar el pago.</p>
              <LinkButton href={`/pagar/${boost.id}`} variant="volt" className="mt-2">
                Destacar mi máquina
              </LinkButton>
            </div>
          ))}
        </div>
      </Section>

      {/* ------------------------------------------------------------------ */}
      <Section tone="muted">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-14">
          <div>
            <SectionHeading eyebrow="Preguntas" title="Antes de elegir" />
            <Callout tone="info" className="mt-6">
              ¿No sabes qué plan te conviene? Escríbenos y te ayudamos según
              cuántas máquinas tienes y dónde trabajas.
            </Callout>
            <LinkButton
              href={platformWhatsappUrl("Quiero ayuda para elegir un plan")}
              external
              variant="whatsapp"
              className="mt-4"
            >
              <IconWhatsApp size={19} />
              Ayúdame a elegir
            </LinkButton>
          </div>
          <Faq items={plansFaq} />
        </div>
      </Section>
    </>
  );
}
