import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { repository } from "@/lib/repository";
import { categoriesById } from "@/lib/data/categories";
import { locationsById } from "@/lib/data/locations";
import {
  availabilityLabel,
  formatDate,
  formatNumber,
  formatPrice,
  fuelLabel,
  pricingUnitLabel,
} from "@/lib/format";
import { machineJsonLd, pageMetadata } from "@/lib/seo";

import { MachineGallery } from "@/components/machine/MachineGallery";
import { WhatsAppCta } from "@/components/machine/WhatsAppCta";
import { InfoRequestForm } from "@/components/machine/InfoRequestForm";
import { ReportListing } from "@/components/machine/ReportListing";
import { ReviewsSection } from "@/components/reviews/ReviewsSection";
import { OwnerSummaryCard } from "@/components/owner/OwnerSummaryCard";
import { MachineCard } from "@/components/machine/MachineCard";
import { DemoNotice } from "@/components/common/Demo";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Badge } from "@/components/ui/Badge";
import { Callout } from "@/components/ui/Callout";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  IconCalendar,
  IconCheck,
  IconClose,
  IconOperator,
  IconPin,
  IconTag,
  IconTruck,
} from "@/components/ui/Icon";

type Params = { slug: string };

export async function generateStaticParams(): Promise<Params[]> {
  const slugs = await repository.listMachineSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const machine = await repository.getMachineBySlug(slug);
  if (!machine) return { title: "Publicación no encontrada" };

  const location = locationsById.get(machine.locationId);
  const price = formatPrice(machine);

  return pageMetadata({
    title: `${machine.name} en alquiler — ${machine.area}, ${location?.name ?? "Perú"}`,
    description: `${machine.brand} ${machine.model}${machine.year ? ` (${machine.year})` : ""} disponible para alquiler en ${machine.area}, ${location?.name ?? "Perú"}. ${price.amount ? `Desde ${price.label}.` : "Consultar precio."} ${machine.operatorAvailable ? "Con operador disponible." : ""} Contacta al propietario por WhatsApp.`,
    path: `/maquina/${machine.slug}`,
    images: machine.images.map((i) => i.url).slice(0, 1),
    // Las publicaciones DEMO no se indexan: no deben aparecer en Google como
    // si fueran maquinaria real disponible.
    noIndex: machine.isDemo,
  });
}

export default async function MachinePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const machine = await repository.getMachineBySlug(slug);
  if (!machine) notFound();

  const [owner, reviews, related] = await Promise.all([
    repository.getOwnerById(machine.ownerId),
    repository.getReviewsForMachine(machine.id),
    repository.getRelatedMachines(machine, 4),
  ]);

  const category = categoriesById.get(machine.categoryId);
  const location = locationsById.get(machine.locationId);
  const price = formatPrice(machine);

  const conditions = [
    {
      Icon: IconOperator,
      label: "Operador",
      value: machine.operatorAvailable
        ? machine.operatorIncludedInPrice
          ? "Disponible, incluido en el precio"
          : "Disponible, se cobra aparte"
        : "No incluye operador",
      positive: machine.operatorAvailable,
    },
    {
      Icon: IconTruck,
      label: "Transporte",
      value: machine.transportAvailable
        ? machine.transportIncludedInPrice
          ? "Disponible, incluido en el precio"
          : "Disponible, se cotiza aparte"
        : "El cliente coordina el traslado",
      positive: machine.transportAvailable,
    },
    {
      Icon: IconTag,
      label: "Combustible",
      value: fuelLabel[machine.fuel],
      positive: machine.fuel === "owner",
    },
    {
      Icon: IconCalendar,
      label: "Mínimo de alquiler",
      value: machine.minimumRental ?? "A coordinar con el propietario",
      positive: true,
    },
  ];

  return (
    <>
      <div className="border-b border-steel-200 bg-steel-50">
        <div className="container-mf py-3">
          <Breadcrumbs
            items={[
              { label: "Inicio", href: "/" },
              { label: "Maquinaria", href: "/maquinaria" },
              ...(category
                ? [{ label: category.name, href: `/maquinaria/${category.slug}` }]
                : []),
              { label: machine.name },
            ]}
          />
        </div>
      </div>

      <div className="container-mf py-6 sm:py-8">
        {machine.isDemo && <DemoNotice variant="listing" className="mb-6" />}

        <div className="lg:grid lg:grid-cols-[1fr_22rem] lg:gap-8 xl:gap-12">
          {/* ---------------------------------------------------- columna 1 */}
          <div className="min-w-0">
            <MachineGallery
              images={machine.images}
              title={machine.name}
              isDemo={machine.isDemo}
            />

            <div className="mt-7">
              <div className="flex flex-wrap items-center gap-2">
                {category && (
                  <Link
                    href={`/maquinaria/${category.slug}`}
                    className="text-sm font-bold uppercase tracking-wider text-brand-700 hover:underline"
                  >
                    {category.singular}
                  </Link>
                )}
                <Badge
                  tone={
                    machine.availability === "available"
                      ? "ok"
                      : machine.availability === "limited"
                        ? "warn"
                        : "neutral"
                  }
                >
                  {availabilityLabel[machine.availability]}
                </Badge>
                <Badge tone="neutral" size="sm">
                  Código {machine.reference}
                </Badge>
              </div>

              <h1 className="mt-2.5 text-2xl font-extrabold leading-tight text-ink-900 sm:text-3xl lg:text-4xl">
                {machine.name}
              </h1>

              <p className="mt-2.5 inline-flex items-center gap-1.5 text-[0.98rem] text-steel-600">
                <IconPin size={17} className="text-steel-400" />
                {machine.area}
                {location ? `, ${location.name}` : ""}
              </p>
            </div>

            {/* Información técnica ------------------------------------------ */}
            <section aria-labelledby="info" className="mt-8">
              <h2 id="info" className="text-lg font-bold text-ink-900">
                Información
              </h2>
              <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-4 rounded-2xl border border-steel-200 bg-white p-5 sm:grid-cols-3">
                <Spec label="Marca" value={machine.brand} />
                <Spec label="Modelo" value={machine.model} />
                <Spec label="Año" value={machine.year ? String(machine.year) : "No indicado"} />
                <Spec label="Categoría" value={category?.name ?? "—"} />
                <Spec label="Ubicación" value={`${machine.area}${location ? `, ${location.name}` : ""}`} />
                <Spec
                  label="Horas de trabajo"
                  value={
                    machine.workHours !== null
                      ? `${formatNumber(machine.workHours)} h`
                      : "No indicadas"
                  }
                />
                {machine.specs.map((spec) => (
                  <Spec key={spec.label} label={spec.label} value={spec.value} />
                ))}
              </dl>
            </section>

            {/* Condiciones -------------------------------------------------- */}
            <section aria-labelledby="condiciones" className="mt-8">
              <h2 id="condiciones" className="text-lg font-bold text-ink-900">
                Condiciones de alquiler
              </h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {conditions.map((item) => (
                  <li
                    key={item.label}
                    className="flex items-start gap-3 rounded-xl border border-steel-200 bg-white p-4"
                  >
                    <span
                      className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${
                        item.positive
                          ? "bg-brand-50 text-brand-700"
                          : "bg-steel-100 text-steel-500"
                      }`}
                    >
                      <item.Icon size={18} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-bold text-ink-900">
                        {item.label}
                      </span>
                      <span className="mt-0.5 flex items-start gap-1.5 text-sm text-steel-600">
                        {item.positive ? (
                          <IconCheck size={14} className="mt-0.5 shrink-0 text-ok-500" />
                        ) : (
                          <IconClose size={14} className="mt-0.5 shrink-0 text-steel-400" />
                        )}
                        {item.value}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>

              {machine.availabilityNote && (
                <Callout tone="info" className="mt-4" title="Nota de disponibilidad">
                  {machine.availabilityNote}
                </Callout>
              )}
            </section>

            {/* Descripción -------------------------------------------------- */}
            <section aria-labelledby="descripcion" className="mt-8">
              <h2 id="descripcion" className="text-lg font-bold text-ink-900">
                Descripción del propietario
              </h2>
              <p className="mt-3 whitespace-pre-line text-[0.98rem] leading-relaxed text-steel-700">
                {machine.description}
              </p>
              <p className="mt-4 text-xs text-steel-500">
                Publicada el {formatDate(machine.createdAt)} · Última
                actualización {formatDate(machine.updatedAt)}
              </p>
            </section>

            <div className="mt-8 border-t border-steel-200 pt-8">
              <ReviewsSection
                reviews={reviews}
                machineId={machine.id}
                machineName={machine.name}
                isDemo={machine.isDemo}
              />
            </div>

            <div className="mt-8 flex flex-col gap-4 border-t border-steel-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-lg text-xs leading-relaxed text-steel-500">
                MaquiFly es una plataforma de conexión. No verifica el estado
                mecánico de los equipos ni participa en el contrato entre las
                partes.
              </p>
              <ReportListing machineId={machine.id} reference={machine.reference} />
            </div>
          </div>

          {/* ---------------------------------------------------- columna 2 */}
          <aside className="mt-8 lg:mt-0">
            <div className="lg:sticky lg:top-24 lg:flex lg:flex-col lg:gap-4">
              <div className="rounded-2xl border border-steel-200 bg-white p-5 shadow-card">
                {price.amount ? (
                  <>
                    <p className="text-3xl font-extrabold leading-none text-ink-900">
                      {price.amount}
                      <span className="ml-1 text-base font-semibold text-steel-500">
                        {price.unit}
                      </span>
                    </p>
                    <p className="mt-1.5 text-sm text-steel-500">
                      Precio {pricingUnitLabel[machine.pricingUnit]} fijado por el
                      propietario
                      {machine.isDemo ? " · valor DEMO" : ""}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-2xl font-extrabold leading-tight text-ink-900">
                      Consultar precio
                    </p>
                    <p className="mt-1.5 text-sm leading-relaxed text-steel-500">
                      El propietario cotiza según el trabajo, la distancia y la
                      duración.
                    </p>
                  </>
                )}

                <div className="mt-5">
                  <WhatsAppCta machine={machine} owner={owner} />
                </div>

                <div className="mt-3">
                  <InfoRequestForm machine={machine} />
                </div>

                <ul className="mt-5 flex flex-col gap-2 border-t border-steel-100 pt-4">
                  {[
                    "El precio final lo acuerdas directamente con el propietario.",
                    "MaquiFly no cobra comisión por este contacto.",
                    "Confirma siempre disponibilidad y condiciones antes de trasladar la máquina.",
                  ].map((text) => (
                    <li key={text} className="flex items-start gap-2 text-xs text-steel-600">
                      <IconCheck size={14} className="mt-0.5 shrink-0 text-ok-500" />
                      {text}
                    </li>
                  ))}
                </ul>
              </div>

              {owner && <OwnerSummaryCard owner={owner} />}
            </div>
          </aside>
        </div>

        {/* Relacionadas ---------------------------------------------------- */}
        {related.length > 0 && (
          <section aria-labelledby="relacionadas" className="mt-14 border-t border-steel-200 pt-10">
            <h2 id="relacionadas" className="text-xl font-extrabold text-ink-900">
              Otras opciones similares
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((item) => (
                <MachineCard key={item.id} machine={item} />
              ))}
            </div>
          </section>
        )}
      </div>

      <JsonLd data={machineJsonLd(machine, owner)} />
    </>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium text-steel-500">{label}</dt>
      <dd className="mt-0.5 text-sm font-semibold text-ink-900">{value}</dd>
    </div>
  );
}
