import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { repository } from "@/lib/repository";
import { locationsById } from "@/lib/data/locations";
import { formatMonthYear, pluralize } from "@/lib/format";
import { ownerJsonLd, pageMetadata } from "@/lib/seo";
import { buildOwnerMessage, whatsappUrl } from "@/lib/whatsapp";
import { plans } from "@/lib/plans";
import { siteConfig } from "@/lib/site";
import { FounderBadge } from "@/components/owner/PlanBadges";

import { MachineCard } from "@/components/machine/MachineCard";
import { RatingStars } from "@/components/reviews/RatingStars";
import { VerificationBadge } from "@/components/owner/VerificationBadge";
import { DemoBadge, DemoNotice } from "@/components/common/Demo";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { EmptyState } from "@/components/ui/EmptyState";
import { LinkButton } from "@/components/ui/Button";
import { Callout } from "@/components/ui/Callout";
import { JsonLd } from "@/components/seo/JsonLd";
import { IconCamera, IconPin, IconPlus, IconWhatsApp } from "@/components/ui/Icon";

type Params = { slug: string };

export async function generateStaticParams(): Promise<Params[]> {
  const slugs = await repository.listOwnerSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const owner = await repository.getOwnerBySlug(slug);
  if (!owner) return { title: "Propietario no encontrado" };
  const location = locationsById.get(owner.locationId);

  return pageMetadata({
    title: `${owner.businessName} — maquinaria en alquiler en ${location?.name ?? "Perú"}`,
    description: `Perfil de ${owner.businessName} en MaquiFly: maquinaria publicada, ubicación y forma de contacto.`,
    path: `/propietario/${owner.slug}`,
    noIndex: owner.isDemo,
  });
}

export default async function OwnerPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const owner = await repository.getOwnerBySlug(slug);
  if (!owner) notFound();

  const [machines, reviews] = await Promise.all([
    repository.getMachinesByOwner(owner.id),
    repository.getReviewsForOwner(owner.id),
  ]);

  const location = locationsById.get(owner.locationId);
  const initials = owner.businessName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <>
      <section className="relative overflow-hidden bg-ink-950">
        <div className="grid-blueprint absolute inset-0" aria-hidden="true" />
        <div className="container-mf relative py-8 sm:py-10">
          <div className="[&_a]:text-ink-300 [&_a:hover]:text-volt-400 [&_span]:text-ink-100 [&_ol]:text-ink-400">
            <Breadcrumbs
              items={[
                { label: "Inicio", href: "/" },
                { label: "Propietarios", href: "/propietarios" },
                { label: owner.businessName },
              ]}
            />
          </div>

          <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-4">
              <span
                aria-hidden="true"
                className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-xl font-extrabold text-volt-400 ring-1 ring-white/15"
              >
                {initials}
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-extrabold text-white sm:text-3xl">
                    {owner.businessName}
                  </h1>
                  {owner.isDemo && <DemoBadge />}
                  {!owner.isDemo && owner.founderNumber !== null && (
                    <FounderBadge size="md" number={owner.founderNumber} />
                  )}
                </div>
                {plans[owner.plan].companyProfile && owner.ruc && (
                  <p className="mt-1 text-sm text-ink-300">RUC {owner.ruc}</p>
                )}
                <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-ink-200">
                  <IconPin size={16} className="text-volt-400" />
                  {owner.area ? `${owner.area}, ` : ""}
                  {location?.name ?? "Perú"}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <VerificationBadge status={owner.verificationStatus} />
                  <span className="text-sm text-ink-300">
                    En MaquiFly desde {formatMonthYear(owner.memberSince)}
                  </span>
                  <span className="text-sm text-ink-300">
                    {pluralize(machines.length, "máquina publicada", "máquinas publicadas", "Sin máquinas publicadas")}
                  </span>
                </div>
                <div className="mt-3">
                  <RatingStars
                    rating={owner.rating}
                    count={owner.reviewCount}
                    emptyLabel="Este propietario aún no tiene reseñas"
                    className="[&_p]:text-ink-300"
                  />
                </div>
              </div>
            </div>

            {!owner.isDemo && (
              <LinkButton
                href={
                  plans[owner.plan].directWhatsapp
                    ? whatsappUrl(owner.whatsapp, buildOwnerMessage(owner))
                    : whatsappUrl(
                        siteConfig.contact.whatsapp,
                        `Hola MaquiFly, quisiera contactar a ${owner.businessName} por un alquiler de maquinaria.`,
                      )
                }
                external
                variant="whatsapp"
                size="md"
              >
                <IconWhatsApp size={19} />
                Escribir por WhatsApp
              </LinkButton>
            )}
          </div>
        </div>
      </section>

      <div className="container-mf py-8 sm:py-10">
        {owner.isDemo && <DemoNotice variant="owner" className="mb-6" />}

        <div className="grid gap-8 lg:grid-cols-[1fr_20rem] lg:gap-12">
          <div className="min-w-0">
            <h2 className="text-xl font-extrabold text-ink-900">Sus máquinas</h2>
            <div className="mt-5">
              {machines.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {machines.map((machine, index) => (
                    <MachineCard
                      key={machine.id}
                      machine={machine}
                      priority={index < 3}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  tone="dashed"
                  icon={<IconCamera size={24} />}
                  title="Este propietario no tiene publicaciones activas"
                  description="Puede que haya pausado sus anuncios temporalmente."
                  action={
                    <LinkButton href="/maquinaria" variant="primary">
                      Ver otra maquinaria
                    </LinkButton>
                  }
                />
              )}
            </div>

            <section className="mt-12 border-t border-steel-200 pt-8">
              <h2 className="text-xl font-extrabold text-ink-900">
                Reseñas del propietario
              </h2>
              <div className="mt-4">
                {reviews.length === 0 ? (
                  <div className="rounded-2xl border-2 border-dashed border-steel-300 bg-steel-50 p-6 text-center">
                    <p className="text-base font-bold text-ink-900">
                      Aún no hay reseñas sobre {owner.businessName}
                    </p>
                    <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-steel-600">
                      Las reseñas se acumulan en el perfil a medida que se
                      concretan alquileres, y califican estado del equipo,
                      puntualidad, comunicación y cumplimiento. MaquiFly no
                      publica calificaciones de relleno.
                    </p>
                  </div>
                ) : null}
              </div>
            </section>
          </div>

          <aside>
            <div className="rounded-2xl border border-steel-200 bg-white p-5">
              <h2 className="text-sm font-bold uppercase tracking-wider text-steel-500">
                Sobre el propietario
              </h2>
              <p className="mt-3 text-[0.95rem] leading-relaxed text-steel-700">
                {owner.description}
              </p>

              <dl className="mt-5 flex flex-col gap-3 border-t border-steel-100 pt-4 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-steel-500">Ubicación</dt>
                  <dd className="font-semibold text-ink-900">
                    {location?.name ?? "Perú"}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-steel-500">Zona</dt>
                  <dd className="font-semibold text-ink-900">{owner.area ?? "—"}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-steel-500">Miembro desde</dt>
                  <dd className="font-semibold text-ink-900">
                    {formatMonthYear(owner.memberSince)}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-steel-500">Publicaciones</dt>
                  <dd className="font-semibold text-ink-900">{machines.length}</dd>
                </div>
              </dl>

              <div className="mt-5 border-t border-steel-100 pt-4">
                <VerificationBadge status={owner.verificationStatus} withHelp />
              </div>
            </div>

            <Callout tone="neutral" className="mt-4">
              MaquiFly no interviene en el acuerdo de alquiler. Confirma
              siempre estado del equipo, condiciones y forma de pago
              directamente con el propietario.
            </Callout>

            <div className="mt-4 rounded-2xl border border-steel-200 bg-steel-50 p-5">
              <h2 className="text-base font-bold text-ink-900">
                ¿También tienes maquinaria?
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-steel-600">
                Publicar es gratuito y tu perfil se ve exactamente así.
              </p>
              <LinkButton href="/publicar" variant="primary" size="sm" className="mt-4">
                <IconPlus size={17} />
                Crear mi perfil
              </LinkButton>
            </div>
          </aside>
        </div>
      </div>

      <JsonLd data={ownerJsonLd(owner)} />
    </>
  );
}
