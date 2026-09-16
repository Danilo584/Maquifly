import Link from "next/link";
import type { Metadata } from "next";

import { Hero } from "@/components/home/Hero";
import { HowItWorks } from "@/components/home/HowItWorks";
import { CategoryGrid } from "@/components/category/CategoryGrid";
import { MachineCard } from "@/components/machine/MachineCard";
import { Faq } from "@/components/common/Faq";
import { DemoNotice } from "@/components/common/Demo";
import { Section, SectionHeading } from "@/components/ui/Section";
import { LinkButton } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  IconArrowRight,
  IconCamera,
  IconPlus,
  IconSearch,
  IconShield,
  IconStar,
  IconTag,
} from "@/components/ui/Icon";

import { repository } from "@/lib/repository";
import { categories, featuredCategorySlugs } from "@/lib/data/categories";
import { homeFaq } from "@/lib/data/faq";
import { faqJsonLd, pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import { pluralize } from "@/lib/format";

export const metadata: Metadata = pageMetadata({
  title: `Alquiler de maquinaria en Piura — ${siteConfig.name}`,
  description:
    "Encuentra maquinaria y equipos disponibles para alquiler en Piura y contacta directamente con el propietario. Minicargadores, excavadoras, retroexcavadoras, volquetes, generadores y más.",
  path: "/",
  keywords: [
    "alquiler de maquinaria Piura",
    "alquiler de maquinaria pesada",
    "alquiler de minicargador Piura",
    "alquiler de excavadora Piura",
    "maquinaria pesada Piura",
  ],
});

const ownerBenefits = [
  {
    Icon: IconTag,
    title: "Publicar es gratis",
    text: "Tu máquina aparece en el buscador sin costo. Sin comisión sobre el alquiler en esta etapa.",
  },
  {
    Icon: IconSearch,
    title: "Te encuentran cuando te buscan",
    text: "Cada categoría y cada ciudad tiene su propia página, pensada para búsquedas reales en Google.",
  },
  {
    Icon: IconStar,
    title: "Construyes reputación",
    text: "Las reseñas de clientes reales quedan asociadas a tu perfil y te acompañan en cada publicación.",
  },
  {
    Icon: IconShield,
    title: "Controlas las condiciones",
    text: "Tú fijas precio, disponibilidad, si incluyes operador y si ofreces transporte.",
  },
];

export default async function HomePage() {
  const [counts, recent, stats] = await Promise.all([
    repository.countMachinesByCategory(),
    repository.searchMachines({ sort: "recent", page: 1 }),
    repository.getStats(),
  ]);

  const featured = featuredCategorySlugs
    .map((slug) => categories.find((c) => c.slug === slug))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  const latest = recent.machines.slice(0, 8);

  return (
    <>
      <Hero />

      {/* ------------------------------------------------------------------ */}
      <Section tone="light">
        <SectionHeading
          eyebrow="Categorías"
          title="¿Qué equipo necesitas?"
          description="Cada categoría tiene su propia página con los equipos disponibles y lo que conviene saber antes de alquilar."
          action={
            <LinkButton href="/categorias" variant="secondary" size="sm">
              Ver todas las categorías
              <IconArrowRight size={16} />
            </LinkButton>
          }
        />
        <div className="mt-8">
          <CategoryGrid items={featured} counts={counts} />
        </div>
      </Section>

      {/* ------------------------------------------------------------------ */}
      <Section tone="muted">
        <SectionHeading
          eyebrow="Publicaciones recientes"
          title="Maquinaria publicada en MaquiFly"
          description={
            stats.isDemo
              ? "Catálogo de demostración: sirve para probar el buscador mientras se incorporan los primeros propietarios reales de Piura."
              : "Equipos publicados por propietarios en las ciudades donde MaquiFly está activo."
          }
          action={
            <LinkButton href="/maquinaria" variant="secondary" size="sm">
              Ver todo el catálogo
              <IconArrowRight size={16} />
            </LinkButton>
          }
        />

        {stats.isDemo && <DemoNotice variant="catalog" className="mt-6" />}

        <div className="mt-6">
          {latest.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {latest.map((machine, index) => (
                <MachineCard key={machine.id} machine={machine} priority={index < 4} />
              ))}
            </div>
          ) : (
            <EmptyState
              tone="dashed"
              icon={<IconCamera size={24} />}
              title="Todavía no hay maquinaria publicada"
              description="Sé de los primeros propietarios en publicar en MaquiFly. Publicar es gratuito y toma pocos minutos."
              action={
                <LinkButton href="/publicar" variant="primary">
                  <IconPlus size={18} />
                  Publicar mi maquinaria
                </LinkButton>
              }
            />
          )}
        </div>
      </Section>

      {/* ------------------------------------------------------------------ */}
      <Section tone="light">
        <SectionHeading
          eyebrow="Cómo funciona"
          title="De la búsqueda al alquiler en cuatro pasos"
          description="MaquiFly actúa como plataforma de conexión. El acuerdo, el precio final y el pago se coordinan directamente entre el cliente y el propietario."
        />
        <div className="mt-8">
          <HowItWorks />
        </div>
        <div className="mt-6">
          <LinkButton href="/como-funciona" variant="ghost" size="sm">
            Ver el detalle completo
            <IconArrowRight size={16} />
          </LinkButton>
        </div>
      </Section>

      {/* ------------------------------------------------------------------ */}
      <section className="grid-blueprint relative overflow-hidden bg-ink-900 py-14 sm:py-20">
        <div className="container-mf relative">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <SectionHeading
                tone="dark"
                eyebrow="Para propietarios"
                title="Publica tu máquina y llega a nuevos clientes"
                description="Si tienes un minicargador, una excavadora, un volquete o equipos que pasan tiempo parados, MaquiFly los pone frente a quien los está buscando ahora mismo."
              />
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <LinkButton href="/publicar" variant="volt" size="md">
                  <IconPlus size={18} />
                  Publicar mi maquinaria
                </LinkButton>
                <LinkButton href="/propietarios" variant="outline" size="md">
                  Cómo funciona para propietarios
                </LinkButton>
              </div>
            </div>

            <ul className="grid gap-3 sm:grid-cols-2">
              {ownerBenefits.map((benefit) => (
                <li
                  key={benefit.title}
                  className="rounded-xl border border-white/10 bg-white/5 p-4"
                >
                  <span className="flex size-10 items-center justify-center rounded-lg bg-volt-400 text-ink-950">
                    <benefit.Icon size={20} />
                  </span>
                  <h3 className="mt-3 text-base font-bold text-white">
                    {benefit.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-200">
                    {benefit.text}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      <Section tone="muted">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-14">
          <div>
            <SectionHeading
              eyebrow="Confianza"
              title="Reputación construida con alquileres reales"
              description="La reputación es la ventaja competitiva que MaquiFly está construyendo. Por eso no arranca con números inflados."
            />
            <div className="mt-6 rounded-2xl border border-steel-200 bg-white p-5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-steel-500">
                Estado actual de la plataforma
              </h3>
              <dl className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-xs font-medium text-steel-500">
                    Publicaciones
                  </dt>
                  <dd className="text-2xl font-extrabold text-ink-900">
                    {stats.machines}
                    {stats.isDemo && (
                      <span className="ml-1.5 align-middle text-xs font-bold text-warn-700">
                        DEMO
                      </span>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-steel-500">Propietarios</dt>
                  <dd className="text-2xl font-extrabold text-ink-900">
                    {stats.owners}
                    {stats.isDemo && (
                      <span className="ml-1.5 align-middle text-xs font-bold text-warn-700">
                        DEMO
                      </span>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-steel-500">
                    Reseñas reales
                  </dt>
                  <dd className="text-2xl font-extrabold text-ink-900">
                    {stats.reviews}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-steel-500">
                    Ciudades activas
                  </dt>
                  <dd className="text-2xl font-extrabold text-ink-900">1</dd>
                </div>
              </dl>
              <p className="mt-4 border-t border-steel-100 pt-4 text-xs leading-relaxed text-steel-500">
                Estas cifras son las reales del catálogo actual. MaquiFly no
                publica «miles de máquinas» ni «más de 10 000 usuarios»: cuando
                esos números existan, saldrán de la base de datos, no del
                material de marketing.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {[
              {
                title: "Sin reseñas inventadas",
                text: "Una máquina sin calificaciones lo dice con todas sus letras: «Aún no hay reseñas». Nunca verás estrellas de relleno.",
              },
              {
                title: "Verificación honesta",
                text: "«Registrado» solo significa que la cuenta existe. La insignia de verificado aparece únicamente cuando MaquiFly verificó al propietario.",
              },
              {
                title: "Precio del propietario",
                text: "Si el propietario no fija tarifa pública, la ficha dice «Consultar precio» en lugar de mostrar un número aproximado.",
              },
              {
                title: "Publicaciones reportables",
                text: "Cualquier usuario puede reportar información falsa, precios incorrectos o un posible fraude desde la propia ficha.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-steel-200 bg-white p-5"
              >
                <h3 className="text-base font-bold text-ink-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-steel-600">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ------------------------------------------------------------------ */}
      <Section tone="light">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
          <SectionHeading
            eyebrow="Preguntas frecuentes"
            title="Lo que casi todos preguntan primero"
            description="Si tu duda no está aquí, escríbenos: las preguntas que recibimos se convierten en nuevas respuestas."
            action={
              <LinkButton href="/contacto" variant="secondary" size="sm">
                Escribir a MaquiFly
              </LinkButton>
            }
          />
          <div>
            <Faq items={homeFaq} />
            <p className="mt-4 text-sm text-steel-500">
              <Link
                href="/como-funciona#preguntas"
                className="font-semibold text-brand-700 hover:underline"
              >
                Ver todas las preguntas frecuentes
              </Link>
            </p>
          </div>
        </div>
      </Section>

      {/* ------------------------------------------------------------------ */}
      <section className="bg-ink-950 py-14 sm:py-16">
        <div className="container-mf">
          <div className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-white/10 bg-white/5 p-7 sm:p-9 lg:flex-row lg:items-center">
            <div className="max-w-xl">
              <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
                Encuentra. Alquila. Trabaja.
              </h2>
              <p className="mt-3 text-[0.98rem] leading-relaxed text-ink-200">
                {stats.isDemo
                  ? `MaquiFly está incorporando a sus primeros propietarios en ${siteConfig.contact.city}. Si tienes maquinaria disponible, tu publicación puede ser una de las primeras reales.`
                  : `${pluralize(stats.machines, "máquina publicada", "máquinas publicadas")} en ${siteConfig.contact.city}.`}
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
              <LinkButton href="/maquinaria" variant="volt" size="lg">
                <IconSearch size={19} />
                Buscar maquinaria
              </LinkButton>
              <LinkButton href="/publicar" variant="outline" size="lg">
                <IconPlus size={19} />
                Publicar la mía
              </LinkButton>
            </div>
          </div>
        </div>
      </section>

      <JsonLd data={faqJsonLd(homeFaq)} />
    </>
  );
}
