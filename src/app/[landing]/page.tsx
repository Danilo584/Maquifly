import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getLanding, seoLandings } from "@/lib/data/seo-landings";
import { getCategory } from "@/lib/data/categories";
import { getLocation } from "@/lib/data/locations";
import { repository } from "@/lib/repository";
import { pageMetadata } from "@/lib/seo";

import { MachineCard } from "@/components/machine/MachineCard";
import { DemoNotice } from "@/components/common/Demo";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { LinkButton } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Section } from "@/components/ui/Section";
import { IconArrowRight, IconPlus, IconSearch } from "@/components/ui/Icon";

/** Se regenera cada minuto: lo que publicas en el panel aparece solo. */
export const revalidate = 60;

type Params = { landing: string };

/**
 * Ruta dinámica a nivel de raíz para las landings locales.
 * `dynamicParams = false` hace que cualquier slug que no esté en el registro
 * devuelva 404 en lugar de renderizar una página vacía. Las rutas estáticas
 * del proyecto (/blog, /maquinaria, /publicar…) tienen prioridad sobre esta.
 */
export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return seoLandings.map((landing) => ({ landing: landing.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { landing: slug } = await params;
  const landing = getLanding(slug);
  if (!landing) return { title: "Página no encontrada" };

  return pageMetadata({
    title: landing.title,
    description: landing.description,
    path: `/${landing.slug}`,
    keywords: landing.keywords,
  });
}

export default async function LandingPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { landing: slug } = await params;
  const landing = getLanding(slug);
  if (!landing) notFound();

  const category = landing.categorySlug ? getCategory(landing.categorySlug) : undefined;
  const location = getLocation(landing.locationSlug);

  const result = await repository.searchMachines({
    category: landing.categorySlug ?? undefined,
    location: landing.locationSlug,
    sort: "relevance",
  });

  const searchHref = [
    "/maquinaria?",
    landing.categorySlug ? `categoria=${landing.categorySlug}&` : "",
    `ciudad=${landing.locationSlug}`,
  ].join("");

  const hasDemo = result.machines.some((m) => m.isDemo);
  const related = landing.related
    .map((s) => getLanding(s))
    .filter((l): l is NonNullable<typeof l> => Boolean(l));

  return (
    <>
      <section className="relative overflow-hidden bg-ink-950">
        <div className="grid-blueprint absolute inset-0" aria-hidden="true" />
        <div
          className="pointer-events-none absolute -right-32 -top-32 size-[28rem] rounded-full bg-brand-700/25 blur-3xl"
          aria-hidden="true"
        />
        <div className="container-mf relative py-8 sm:py-12">
          <div className="[&_a]:text-ink-300 [&_a:hover]:text-volt-400 [&_span]:text-ink-100 [&_ol]:text-ink-400">
            <Breadcrumbs
              items={[
                { label: "Inicio", href: "/" },
                ...(category
                  ? [{ label: category.name, href: `/maquinaria/${category.slug}` }]
                  : [{ label: "Maquinaria", href: "/maquinaria" }]),
                { label: location?.name ?? "Perú" },
              ]}
            />
          </div>

          <h1 className="mt-5 max-w-3xl text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-[2.75rem]">
            {landing.h1}
          </h1>

          <div className="mt-5 flex max-w-3xl flex-col gap-4">
            {landing.intro.map((paragraph) => (
              <p key={paragraph} className="text-[1.02rem] leading-relaxed text-ink-200">
                {paragraph}
              </p>
            ))}
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <LinkButton href={searchHref} variant="volt" size="md">
              <IconSearch size={18} />
              Ver equipos disponibles
            </LinkButton>
            <LinkButton href="/publicar" variant="outline" size="md">
              <IconPlus size={18} />
              Publicar mi maquinaria
            </LinkButton>
          </div>
        </div>
      </section>

      <Section tone="light">
        <h2 className="text-2xl font-extrabold">
          {category ? `${category.name} publicados` : "Maquinaria publicada"} en{" "}
          {location?.name ?? "Perú"}
        </h2>

        {hasDemo && <DemoNotice variant="catalog" className="mt-5" />}

        <div className="mt-6">
          {result.machines.length > 0 ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {result.machines.slice(0, 8).map((machine, index) => (
                  <MachineCard
                    key={machine.id}
                    machine={machine}
                    priority={index < 4}
                  />
                ))}
              </div>
              {result.total > 8 && (
                <LinkButton href={searchHref} variant="secondary" className="mt-6">
                  Ver las {result.total} publicaciones
                  <IconArrowRight size={17} />
                </LinkButton>
              )}
            </>
          ) : (
            <EmptyState
              tone="dashed"
              icon={<IconSearch size={24} />}
              title={`Todavía no hay publicaciones ${category ? `de ${category.name.toLowerCase()} ` : ""}en ${location?.name ?? "esta ciudad"}`}
              description="MaquiFly está incorporando a sus primeros propietarios. Si tienes este equipo disponible, esta es exactamente la página donde te buscarían."
              action={
                <LinkButton href="/publicar" variant="primary">
                  <IconPlus size={18} />
                  Publicar mi maquinaria
                </LinkButton>
              }
              secondaryAction={
                <LinkButton href="/contacto" variant="secondary">
                  Pedir ayuda para encontrarlo
                </LinkButton>
              }
            />
          )}
        </div>
      </Section>

      <Section tone="muted">
        <div className="flex max-w-3xl flex-col gap-10">
          {landing.sections.map((section) => (
            <div key={section.heading}>
              <h2 className="text-2xl font-extrabold">{section.heading}</h2>
              {section.paragraphs?.map((paragraph) => (
                <p
                  key={paragraph}
                  className="mt-3 text-[1.02rem] leading-relaxed text-steel-700"
                >
                  {paragraph}
                </p>
              ))}
              {section.bullets && (
                <ul className="mt-4 flex flex-col gap-2.5">
                  {section.bullets.map((bullet) => (
                    <li key={bullet} className="flex gap-3">
                      <span
                        aria-hidden="true"
                        className="mt-2.5 size-1.5 shrink-0 rounded-full bg-volt-500"
                      />
                      <span className="text-[1.02rem] leading-relaxed text-steel-700">
                        {bullet}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        {related.length > 0 && (
          <div className="mt-12 border-t border-steel-200 pt-8">
            <h2 className="text-sm font-bold uppercase tracking-wider text-steel-500">
              Búsquedas relacionadas
            </h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {related.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={`/${item.slug}`}
                    className="inline-flex rounded-full border border-steel-300 bg-white px-3.5 py-1.5 text-sm font-medium text-steel-700 transition-colors hover:border-brand-300 hover:text-brand-800"
                  >
                    {item.h1}
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
