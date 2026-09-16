import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { platformWhatsappUrl } from "@/lib/whatsapp";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Section, SectionHeading } from "@/components/ui/Section";
import { LinkButton } from "@/components/ui/Button";
import { Callout } from "@/components/ui/Callout";
import { IconCheck, IconPlus, IconWhatsApp } from "@/components/ui/Icon";

export const metadata: Metadata = pageMetadata({
  title: "Para empresas — flotas y necesidades recurrentes",
  description:
    "MaquiFly para empresas: publica varias máquinas bajo un mismo perfil o encuentra proveedores para necesidades recurrentes de maquinaria en Piura.",
  path: "/empresas",
});

export default function CompaniesPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-ink-950">
        <div className="grid-blueprint absolute inset-0" aria-hidden="true" />
        <div className="container-mf relative py-8 sm:py-14">
          <div className="[&_a]:text-ink-300 [&_a:hover]:text-volt-400 [&_span]:text-ink-100 [&_ol]:text-ink-400">
            <Breadcrumbs
              items={[{ label: "Inicio", href: "/" }, { label: "Para empresas" }]}
            />
          </div>
          <h1 className="mt-5 max-w-3xl text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">
            MaquiFly para empresas
          </h1>
          <p className="mt-5 max-w-2xl text-[1.05rem] leading-relaxed text-ink-200">
            Ya sea que tengas una flota que quieres rentabilizar o que
            necesites maquinaria de forma recurrente para tus obras, la
            plataforma está pensada para los dos lados del mismo problema.
          </p>
        </div>
      </section>

      <Section tone="light">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-steel-200 bg-white p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-600">
              Si tienes flota
            </p>
            <h2 className="mt-2 text-2xl font-extrabold">
              Rentabiliza los equipos que están parados
            </h2>
            <p className="mt-3 text-[0.98rem] leading-relaxed text-steel-600">
              Empresas de alquiler, constructoras y contratistas con maquinaria
              propia pueden publicar todas sus máquinas bajo un mismo perfil
              público, con su nombre comercial, su ubicación y sus reseñas.
            </p>
            <ul className="mt-5 flex flex-col gap-2.5">
              {[
                "Un perfil de empresa que agrupa todas tus publicaciones.",
                "Los clientes que llegan por una máquina ven el resto de tu flota.",
                "Control total sobre precios, disponibilidad y condiciones.",
                "Reputación acumulada a nivel de empresa, no de máquina suelta.",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <IconCheck size={16} className="mt-0.5 shrink-0 text-ok-500" />
                  <span className="text-sm leading-relaxed text-steel-700">{item}</span>
                </li>
              ))}
            </ul>
            <LinkButton href="/publicar" variant="primary" className="mt-6">
              <IconPlus size={18} />
              Publicar mi primera máquina
            </LinkButton>
          </div>

          <div className="rounded-2xl border border-steel-200 bg-white p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-600">
              Si necesitas maquinaria
            </p>
            <h2 className="mt-2 text-2xl font-extrabold">
              Encuentra proveedores para tus obras
            </h2>
            <p className="mt-3 text-[0.98rem] leading-relaxed text-steel-600">
              Constructoras, empresas de movimiento de tierras, agroindustria y
              operadores de proyectos pueden comparar equipos disponibles por
              zona y contactar directamente a varios propietarios.
            </p>
            <ul className="mt-5 flex flex-col gap-2.5">
              {[
                "Filtros por categoría, zona, operador, transporte y disponibilidad.",
                "Información estructurada para comparar cotizaciones equivalentes.",
                "Contacto directo por WhatsApp, sin intermediarios ni comisión.",
                "Perfiles de propietario para saber con quién estás tratando.",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <IconCheck size={16} className="mt-0.5 shrink-0 text-ok-500" />
                  <span className="text-sm leading-relaxed text-steel-700">{item}</span>
                </li>
              ))}
            </ul>
            <LinkButton href="/maquinaria" variant="secondary" className="mt-6">
              Ver maquinaria disponible
            </LinkButton>
          </div>
        </div>
      </Section>

      <Section tone="muted">
        <SectionHeading
          eyebrow="Planes"
          title="Qué cuesta hoy y qué podría costar mañana"
          description="Preferimos ser explícitos con el modelo de negocio antes de que inviertas tiempo en publicar."
        />
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border-2 border-brand-500 bg-white p-6">
            <p className="text-xs font-bold uppercase tracking-wider text-brand-700">
              Disponible hoy
            </p>
            <h3 className="mt-2 text-xl font-extrabold text-ink-900">
              Publicación gratuita
            </h3>
            <p className="mt-1 text-3xl font-extrabold text-ink-900">
              S/ 0
              <span className="text-base font-semibold text-steel-500">
                {" "}
                / sin comisión
              </span>
            </p>
            <ul className="mt-5 flex flex-col gap-2.5 text-sm text-steel-700">
              {[
                "Publicaciones ilimitadas",
                "Perfil público de empresa",
                "Contacto directo por WhatsApp",
                "Sin comisión sobre el alquiler",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <IconCheck size={16} className="mt-0.5 shrink-0 text-ok-500" />
                  {item}
                </li>
              ))}
            </ul>
            <LinkButton href="/publicar" variant="primary" fullWidth className="mt-6">
              Empezar ahora
            </LinkButton>
          </div>

          {[
            {
              title: "Publicaciones destacadas",
              text: "Aparecer primero dentro de una categoría o una ciudad. Será opcional y solo tendrá sentido cuando haya suficiente competencia por la misma búsqueda.",
            },
            {
              title: "Plan profesional",
              text: "Pensado para empresas con muchas máquinas: gestión de flota, estadísticas de contacto por equipo y mayor visibilidad dentro de la plataforma.",
            },
          ].map((plan) => (
            <div
              key={plan.title}
              className="rounded-2xl border border-dashed border-steel-300 bg-steel-50 p-6"
            >
              <p className="text-xs font-bold uppercase tracking-wider text-steel-500">
                Más adelante
              </p>
              <h3 className="mt-2 text-xl font-extrabold text-ink-900">
                {plan.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-steel-600">{plan.text}</p>
              <p className="mt-5 text-sm font-semibold text-steel-500">
                Todavía no existe. No hay fecha ni precio anunciado.
              </p>
            </div>
          ))}
        </div>

        <Callout tone="info" className="mt-6">
          Nada de lo que publiques gratis hoy pasará a ser de pago
          retroactivamente. Si algún día MaquiFly cobra comisión por alquileres
          concretados dentro de la plataforma, será sobre operaciones nuevas y
          se avisará con antelación.
        </Callout>
      </Section>

      <section className="bg-ink-950 py-14">
        <div className="container-mf">
          <div className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-white/10 bg-white/5 p-7 sm:p-9 lg:flex-row lg:items-center">
            <div className="max-w-xl">
              <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
                ¿Tienes una flota o una necesidad recurrente?
              </h2>
              <p className="mt-3 text-[0.98rem] leading-relaxed text-ink-200">
                Escríbenos y lo vemos caso por caso. En esta etapa acompañamos
                personalmente a cada empresa que se suma.
              </p>
            </div>
            <LinkButton
              href={platformWhatsappUrl("Consulta de empresa")}
              external
              variant="volt"
              size="lg"
            >
              <IconWhatsApp size={19} />
              Hablar con MaquiFly
            </LinkButton>
          </div>
        </div>
      </section>
    </>
  );
}
