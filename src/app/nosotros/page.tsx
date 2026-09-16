import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import { activeLocations, upcomingLocations } from "@/lib/data/locations";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Section, SectionHeading } from "@/components/ui/Section";
import { LinkButton } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { IconPlus, IconSearch } from "@/components/ui/Icon";

export const metadata: Metadata = pageMetadata({
  title: "Sobre MaquiFly",
  description:
    "Qué es MaquiFly, por qué empieza en Piura y cómo pensamos construir una plataforma de alquiler de maquinaria basada en información real y reputación verificable.",
  path: "/nosotros",
});

const principles = [
  {
    title: "Ningún dato inventado",
    text: "No publicamos reseñas falsas, estrellas de relleno, estadísticas infladas ni empresas ficticias presentadas como reales. Si una máquina no tiene reseñas, su ficha lo dice. Si una cifra no existe, no aparece.",
  },
  {
    title: "La plataforma no es dueña de nada",
    text: "MaquiFly no posee maquinaria, no fija precios y no participa en el contrato de alquiler. Conecta a dos partes y se aparta. Eso hay que decirlo claro, no esconderlo en los términos.",
  },
  {
    title: "Verificación que significa algo",
    text: "Una insignia de «verificado» que se reparte a todo el mundo no vale nada. La nuestra solo aparece cuando hubo una verificación real, y mientras tanto decimos simplemente «propietario registrado».",
  },
  {
    title: "Primero funcionar, después crecer",
    text: "Es más útil que veinte propietarios reales de Piura reciban clientes a que la web diga que cubre todo el Perú. La expansión viene después de que el modelo funcione en un sitio.",
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-ink-950">
        <div className="grid-blueprint absolute inset-0" aria-hidden="true" />
        <div className="container-mf relative py-8 sm:py-14">
          <div className="[&_a]:text-ink-300 [&_a:hover]:text-volt-400 [&_span]:text-ink-100 [&_ol]:text-ink-400">
            <Breadcrumbs
              items={[{ label: "Inicio", href: "/" }, { label: "Sobre MaquiFly" }]}
            />
          </div>
          <h1 className="mt-5 max-w-3xl text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">
            Conectamos maquinaria con proyectos
          </h1>
          <p className="mt-5 max-w-2xl text-[1.05rem] leading-relaxed text-ink-200">
            MaquiFly nace de una observación simple: en el norte del Perú hay
            maquinaria parada y hay obras esperándola, y las dos cosas ocurren a
            pocos kilómetros de distancia sin llegar a encontrarse.
          </p>
        </div>
      </section>

      <Section tone="light">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 className="text-2xl font-extrabold">El problema</h2>
            <div className="mt-4 flex flex-col gap-4 text-[1.02rem] leading-relaxed text-steel-700">
              <p>
                El alquiler de maquinaria en el Perú se mueve por contactos. Un
                contratista necesita una retroexcavadora para el lunes y
                empieza a preguntar en grupos de WhatsApp. Un propietario tiene
                un minicargador parado tres semanas y no sabe quién lo está
                buscando a quince minutos de su patio.
              </p>
              <p>
                No falta oferta ni falta demanda. Falta un lugar donde las dos
                puedan verse, con información suficiente para decidir sin
                llamar a ciegas: qué máquina es, dónde está, si incluye
                operador, si hay transporte y quién responde por ella.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-extrabold">Lo que estamos construyendo</h2>
            <div className="mt-4 flex flex-col gap-4 text-[1.02rem] leading-relaxed text-steel-700">
              <p>
                Un marketplace de dos lados. De un lado, propietarios que
                publican su maquinaria con información estructurada y
                comparable. Del otro, empresas y personas que buscan, filtran y
                contactan directamente.
              </p>
              <p>
                La pieza que lo sostiene a largo plazo no es el catálogo, es la
                reputación: saber si un propietario cumple horarios, si la
                máquina llega como se prometió y si responde cuando algo falla.
                Esa información hoy vive en la memoria de la gente. MaquiFly
                quiere que viva en un perfil.
              </p>
            </div>
          </div>
        </div>
      </Section>

      <Section tone="muted">
        <SectionHeading
          eyebrow="Principios"
          title="Reglas que nos pusimos desde el primer día"
          description="Son restricciones sobre lo que el producto tiene prohibido hacer, no frases de marketing."
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {principles.map((principle) => (
            <div
              key={principle.title}
              className="rounded-2xl border border-steel-200 bg-white p-5"
            >
              <h3 className="text-lg font-bold text-ink-900">{principle.title}</h3>
              <p className="mt-2 text-[0.95rem] leading-relaxed text-steel-600">
                {principle.text}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="light">
        <SectionHeading
          eyebrow="Dónde estamos"
          title={`Empezamos en ${siteConfig.contact.city}`}
          description="Una ciudad, hecha bien, antes que diez ciudades a medias. Piura concentra obra urbana, agroindustria e infraestructura: si el modelo funciona aquí, funciona en el resto del norte."
        />
        <div className="mt-8 flex flex-wrap gap-2">
          {activeLocations.map((location) => (
            <Badge key={location.slug} tone="ok">
              {location.name} · activo
            </Badge>
          ))}
          {upcomingLocations.map((location) => (
            <Badge key={location.slug} tone="neutral">
              {location.name} · próximamente
            </Badge>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-steel-200 bg-steel-50 p-6">
          <h3 className="text-lg font-bold text-ink-900">Hacia dónde va</h3>
          <ol className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                step: "Ahora",
                text: "Incorporar los primeros 10–20 propietarios reales en Piura.",
              },
              {
                step: "Después",
                text: "Llegar a 20–50 máquinas publicadas y a los primeros contactos.",
              },
              {
                step: "Luego",
                text: "Primeros alquileres concretados y primeras reseñas reales.",
              },
              {
                step: "Más adelante",
                text: "Abrir Chiclayo, Trujillo, Tumbes y Cajamarca con el mismo método.",
              },
            ].map((item) => (
              <li key={item.step}>
                <p className="text-xs font-bold uppercase tracking-wider text-brand-700">
                  {item.step}
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-steel-700">
                  {item.text}
                </p>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <LinkButton href="/publicar" variant="primary">
            <IconPlus size={18} />
            Publicar mi maquinaria
          </LinkButton>
          <LinkButton href="/maquinaria" variant="secondary">
            <IconSearch size={18} />
            Buscar maquinaria
          </LinkButton>
        </div>
      </Section>
    </>
  );
}
