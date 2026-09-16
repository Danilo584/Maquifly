import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { categories, getCategory } from "@/lib/data/categories";
import { activeLocations } from "@/lib/data/locations";
import { repository } from "@/lib/repository";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

import { MachineCard } from "@/components/machine/MachineCard";
import { CategoryIcon, IconArrowRight, IconCheck, IconPlus } from "@/components/ui/Icon";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { LinkButton } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { DemoNotice } from "@/components/common/Demo";
import { Section, SectionHeading } from "@/components/ui/Section";

type Params = { categoria: string };

/** Cada categoría se pre-genera: es una página indexable con contenido propio. */
export function generateStaticParams(): Params[] {
  return categories.map((category) => ({ categoria: category.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { categoria } = await params;
  const category = getCategory(categoria);
  if (!category) return { title: "Categoría no encontrada" };

  const city = siteConfig.contact.city;
  return pageMetadata({
    title: `Alquiler de ${category.name.toLowerCase()} en ${city}`,
    description: `${category.shortDescription} Encuentra ${category.name.toLowerCase()} en alquiler en ${city} y contacta directamente con el propietario a través de MaquiFly.`,
    path: `/maquinaria/${category.slug}`,
    keywords: [
      `alquiler de ${category.name.toLowerCase()}`,
      `alquiler de ${category.singular.toLowerCase()} ${city}`,
      `${category.singular.toLowerCase()} en ${city}`,
      `${category.name.toLowerCase()} ${city}`,
    ],
  });
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { categoria } = await params;
  const category = getCategory(categoria);
  if (!category) notFound();

  const [result, counts] = await Promise.all([
    repository.searchMachines({ category: category.slug, sort: "relevance" }),
    repository.countMachinesByCategory(),
  ]);

  const city = activeLocations[0];
  const related = categories
    .filter((c) => c.family === category.family && c.slug !== category.slug)
    .slice(0, 5);
  const hasDemo = result.machines.some((m) => m.isDemo);

  return (
    <>
      <section className="relative overflow-hidden bg-ink-950">
        <div className="grid-blueprint absolute inset-0" aria-hidden="true" />
        <div className="container-mf relative py-8 sm:py-12">
          <div className="[&_a]:text-ink-300 [&_a:hover]:text-volt-400 [&_span]:text-ink-100 [&_ol]:text-ink-400">
            <Breadcrumbs
              items={[
                { label: "Inicio", href: "/" },
                { label: "Maquinaria", href: "/maquinaria" },
                { label: category.name },
              ]}
            />
          </div>

          <div className="mt-6 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <span className="inline-flex size-12 items-center justify-center rounded-xl bg-volt-400 text-ink-950">
                <CategoryIcon name={category.icon} size={26} />
              </span>
              <h1 className="mt-4 text-3xl font-extrabold leading-tight text-white sm:text-4xl">
                Alquiler de {category.name.toLowerCase()}
                {city ? ` en ${city.name}` : ""}
              </h1>
              <p className="mt-4 text-[1.02rem] leading-relaxed text-ink-200">
                {category.longDescription}
              </p>
            </div>

            <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col">
              <LinkButton
                href={`/maquinaria?categoria=${category.slug}`}
                variant="volt"
                size="md"
              >
                Ver con filtros
                <IconArrowRight size={17} />
              </LinkButton>
              <LinkButton href="/publicar" variant="outline" size="md">
                <IconPlus size={17} />
                Publicar la mía
              </LinkButton>
            </div>
          </div>
        </div>
      </section>

      <Section tone="light">
        <SectionHeading
          title={`${category.name} disponibles`}
          description={
            result.total > 0
              ? `${result.total} ${result.total === 1 ? "publicación" : "publicaciones"} en esta categoría.`
              : undefined
          }
        />

        {hasDemo && <DemoNotice variant="catalog" className="mt-6" />}

        <div className="mt-6">
          {result.machines.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {result.machines.map((machine, index) => (
                <MachineCard key={machine.id} machine={machine} priority={index < 4} />
              ))}
            </div>
          ) : (
            <EmptyState
              tone="dashed"
              icon={<CategoryIcon name={category.icon} size={26} />}
              title={`Todavía no hay ${category.name.toLowerCase()} publicados`}
              description={`Nadie ha publicado ${category.singular.toLowerCase()} en MaquiFly todavía. Si tienes uno disponible, esta página es exactamente donde te buscarían.`}
              action={
                <LinkButton href="/publicar" variant="primary">
                  <IconPlus size={18} />
                  Publicar mi {category.singular.toLowerCase()}
                </LinkButton>
              }
              secondaryAction={
                <LinkButton href="/maquinaria" variant="secondary">
                  Ver otras categorías
                </LinkButton>
              }
            />
          )}
        </div>
      </Section>

      <Section tone="muted">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 className="text-2xl font-extrabold">
              ¿Para qué se usa {article(category.singular)}{" "}
              {category.singular.toLowerCase()}?
            </h2>
            <ul className="mt-5 flex flex-col gap-3">
              {category.commonUses.map((use) => (
                <li key={use} className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                    <IconCheck size={13} />
                  </span>
                  <span className="text-[0.95rem] leading-relaxed text-steel-700">
                    {use}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-extrabold">Antes de cotizar, ten a mano</h2>
            <p className="mt-3 text-[0.95rem] leading-relaxed text-steel-600">
              Un propietario puede darte un precio firme mucho más rápido si le
              escribes con estos datos. Es la diferencia entre una cotización en
              minutos y tres días de idas y vueltas.
            </p>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                { label: "Ubicación exacta", text: "Distrito y referencia de la obra." },
                { label: "Duración", text: "Horas, días o jornadas estimadas." },
                { label: "Fechas", text: "Cuándo necesitas la máquina en obra." },
                { label: "Trabajo a realizar", text: "Qué se va a hacer y en qué terreno." },
                { label: "Operador", text: "Si necesitas que incluya operador." },
                { label: "Traslado", text: "Si requieres que la lleven a la obra." },
              ].map((item) => (
                <li
                  key={item.label}
                  className="rounded-lg border border-steel-200 bg-white p-3.5"
                >
                  <p className="text-sm font-bold text-ink-900">{item.label}</p>
                  <p className="mt-1 text-sm text-steel-600">{item.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-12 border-t border-steel-200 pt-8">
            <h2 className="text-sm font-bold uppercase tracking-wider text-steel-500">
              Categorías relacionadas
            </h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {related.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={`/maquinaria/${item.slug}`}
                    className="inline-flex items-center gap-2 rounded-full border border-steel-300 bg-white px-3.5 py-1.5 text-sm font-medium text-steel-700 transition-colors hover:border-brand-300 hover:text-brand-800"
                  >
                    <CategoryIcon name={item.icon} size={16} />
                    {item.name}
                    <span className="text-xs text-steel-400">
                      {counts[item.slug] ?? 0}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Section>
    </>
  );
}

/** Artículo indefinido correcto en español para el encabezado. */
function article(singular: string): string {
  const feminine = /a$/i.test(singular);
  return feminine ? "una" : "un";
}
