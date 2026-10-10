import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { repository } from "@/lib/repository";
import { siteConfig } from "@/lib/site";

import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Section, SectionHeading } from "@/components/ui/Section";
import { LinkButton } from "@/components/ui/Button";
import { Callout } from "@/components/ui/Callout";
import { Faq } from "@/components/common/Faq";
import { IconCheck, IconPlus, IconSearch, IconStar, IconTag } from "@/components/ui/Icon";

/** Se regenera cada minuto: lo que publicas en el panel aparece solo. */
export const revalidate = 60;

export const metadata: Metadata = pageMetadata({
  title: "Para propietarios — publica tu maquinaria gratis",
  description:
    "Si tienes maquinaria disponible, publícala gratis en MaquiFly y llega a quienes la están buscando en Piura. Tú fijas el precio, las condiciones y la disponibilidad.",
  path: "/propietarios",
  keywords: [
    "publicar maquinaria en alquiler",
    "alquilar mi excavadora",
    "propietarios de maquinaria Piura",
  ],
});

const ownerFaq = [
  {
    question: "¿Cuánto cuesta publicar en MaquiFly?",
    answer:
      "Publicar es gratis con Fly Start (hasta 2 máquinas). Si quieres más visibilidad existen Fly Plus y Fly Pro, y los Destacados Express para una sola máquina; todo es opcional y se detalla en la página de planes. No cobramos comisión sobre tus alquileres.",
  },
  {
    question: "¿MaquiFly se queda con mis clientes?",
    answer:
      "No. En Fly Start el cliente escribe primero a MaquiFly y nosotros te lo pasamos; en Fly Plus y Fly Pro te escribe directo a tu WhatsApp. En ningún caso cobramos el alquiler ni comisión: el precio y el acuerdo son tuyos.",
  },
  {
    question: "¿Puedo publicar varias máquinas?",
    answer:
      "Sí. Todas tus publicaciones quedan agrupadas en un perfil público con tu nombre comercial, tu ubicación y tus reseñas, de modo que un cliente que llega por una máquina puede ver el resto de tu flota.",
  },
  {
    question: "¿Qué pasa si mi máquina deja de estar disponible?",
    answer:
      "Puedes cambiar la disponibilidad a «limitada» o «no disponible», o pausar la publicación. Mantenerla actualizada es lo que más protege tu reputación: nada molesta más a un cliente que contactar por una máquina que ya está comprometida.",
  },
  {
    question: "¿Tengo que mostrar mi dirección?",
    answer:
      "No. La publicación muestra solo el distrito o la zona. La dirección exacta la compartes tú directamente al coordinar el alquiler.",
  },
];

export default async function OwnersPage() {
  const stats = await repository.getStats();

  return (
    <>
      <section className="relative overflow-hidden bg-ink-950">
        <div className="grid-blueprint absolute inset-0" aria-hidden="true" />
        <div
          className="pointer-events-none absolute -right-32 -top-40 size-[30rem] rounded-full bg-volt-500/10 blur-3xl"
          aria-hidden="true"
        />
        <div className="container-mf relative py-8 sm:py-14">
          <div className="[&_a]:text-ink-300 [&_a:hover]:text-volt-400 [&_span]:text-ink-100 [&_ol]:text-ink-400">
            <Breadcrumbs
              items={[{ label: "Inicio", href: "/" }, { label: "Para propietarios" }]}
            />
          </div>
          <h1 className="mt-5 max-w-3xl text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">
            Tu maquinaria parada no genera nada
          </h1>
          <p className="mt-5 max-w-2xl text-[1.05rem] leading-relaxed text-ink-200">
            Si tienes un minicargador, una excavadora, un volquete o equipos que
            pasan semanas sin trabajar, MaquiFly los pone frente a quien los
            está buscando ahora mismo en {siteConfig.contact.city}. Publicar es
            gratis y las condiciones las pones tú.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <LinkButton href="/publicar" variant="volt" size="lg">
              <IconPlus size={19} />
              Publicar mi maquinaria
            </LinkButton>
            <LinkButton href="/maquinaria" variant="outline" size="lg">
              <IconSearch size={19} />
              Ver cómo se ven las publicaciones
            </LinkButton>
          </div>
        </div>
      </section>

      <Section tone="light">
        <SectionHeading
          eyebrow="Por qué publicar aquí"
          title="Lo que MaquiFly hace por tu máquina"
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              Icon: IconTag,
              title: "Gratis para empezar",
              text: "Con Fly Start publicas hasta 2 máquinas sin pagar. Sin comisión sobre tus alquileres, en ningún plan.",
            },
            {
              Icon: IconSearch,
              title: "Te encuentran buscando",
              text: "Cada categoría y cada ciudad tiene su propia página optimizada para búsquedas como «alquiler de excavadora Piura».",
            },
            {
              Icon: IconStar,
              title: "Reputación acumulable",
              text: "Las reseñas reales de tus clientes quedan en tu perfil y acompañan a todas tus publicaciones, presentes y futuras.",
            },
            {
              Icon: IconCheck,
              title: "Tú controlas todo",
              text: "Precio, disponibilidad, operador, transporte y condiciones. MaquiFly no negocia por ti ni fija tarifas.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-steel-200 bg-white p-5"
            >
              <span className="flex size-11 items-center justify-center rounded-lg bg-ink-900 text-volt-400">
                <item.Icon size={22} />
              </span>
              <h3 className="mt-3.5 text-base font-bold text-ink-900">{item.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-steel-600">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="muted">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionHeading
              eyebrow="Sinceridad primero"
              title="En qué punto está MaquiFly hoy"
              description="Vas a ser de los primeros. Preferimos decírtelo de frente antes de que publiques."
            />
            <div className="mt-6 rounded-2xl border border-steel-200 bg-white p-5">
              <dl className="grid grid-cols-2 gap-5">
                <div>
                  <dt className="text-xs font-medium text-steel-500">
                    Publicaciones reales
                  </dt>
                  <dd className="text-3xl font-extrabold text-ink-900">
                    {stats.isDemo ? 0 : stats.machines}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-steel-500">
                    Propietarios reales
                  </dt>
                  <dd className="text-3xl font-extrabold text-ink-900">
                    {stats.isDemo ? 0 : stats.owners}
                  </dd>
                </div>
              </dl>
              <p className="mt-4 border-t border-steel-100 pt-4 text-sm leading-relaxed text-steel-600">
                MaquiFly recién arranca y solo muestra publicaciones reales:
                nada de catálogos de relleno. La meta inmediata es incorporar entre 10 y 20
                propietarios reales en {siteConfig.contact.city} y llegar a 20–50
                máquinas publicadas. Después, las primeras reseñas reales. Y
                después, otras ciudades.
              </p>
            </div>
            <Callout tone="info" className="mt-4">
              Publicar temprano tiene una ventaja concreta: cuando alguien busque
              tu tipo de máquina en {siteConfig.contact.city}, habrá muy pocas
              opciones y la tuya será una de ellas.
            </Callout>
          </div>

          <div>
            <SectionHeading
              eyebrow="Cómo destacar"
              title="Lo que separa una publicación que recibe mensajes de una que no"
            />
            <ul className="mt-6 flex flex-col gap-3">
              {[
                "Fotos propias, con luz de día y desde varios ángulos. Las fotos de catálogo generan desconfianza.",
                "Marca y modelo exactos: muchísimos clientes buscan directamente por modelo.",
                "Un precio publicado. Aunque sea referencial y sujeto a confirmación, recibe más consultas que «consultar precio».",
                "Disponibilidad actualizada. Es lo que más cuida tu reputación.",
                "Una descripción que diga el estado real del equipo y qué implementos incluye.",
                "Respuesta rápida en WhatsApp. En alquiler de maquinaria, la primera respuesta se lleva el trabajo.",
              ].map((tip) => (
                <li
                  key={tip}
                  className="flex items-start gap-3 rounded-xl border border-steel-200 bg-white p-4"
                >
                  <IconCheck size={16} className="mt-0.5 shrink-0 text-ok-500" />
                  <span className="text-[0.95rem] leading-relaxed text-steel-700">
                    {tip}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section tone="light">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <SectionHeading
            eyebrow="Dudas frecuentes"
            title="Lo que preguntan los propietarios"
            action={
              <LinkButton href="/contacto" variant="secondary" size="sm">
                Hablar con MaquiFly
              </LinkButton>
            }
          />
          <Faq items={ownerFaq} />
        </div>
      </Section>

      <section className="bg-ink-950 py-14">
        <div className="container-mf">
          <div className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-white/10 bg-white/5 p-7 sm:p-9 lg:flex-row lg:items-center">
            <div className="max-w-xl">
              <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
                Publica tu máquina en pocos minutos
              </h2>
              <p className="mt-3 text-[0.98rem] leading-relaxed text-ink-200">
                Sin costo, sin exclusividad y sin compromiso. Puedes pausar o
                borrar tu publicación cuando quieras.
              </p>
            </div>
            <LinkButton href="/publicar" variant="volt" size="lg">
              <IconPlus size={19} />
              Publicar mi maquinaria
            </LinkButton>
          </div>
        </div>
      </section>
    </>
  );
}
