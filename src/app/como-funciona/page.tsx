import type { Metadata } from "next";
import { faq } from "@/lib/data/faq";
import { faqJsonLd, pageMetadata } from "@/lib/seo";
import { Faq } from "@/components/common/Faq";
import { HowItWorks } from "@/components/home/HowItWorks";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Section, SectionHeading } from "@/components/ui/Section";
import { LinkButton } from "@/components/ui/Button";
import { Callout } from "@/components/ui/Callout";
import { JsonLd } from "@/components/seo/JsonLd";
import { VerificationBadge } from "@/components/owner/VerificationBadge";
import { IconPlus, IconSearch } from "@/components/ui/Icon";

export const metadata: Metadata = pageMetadata({
  title: "Cómo funciona MaquiFly",
  description:
    "Cómo funciona MaquiFly para quien busca maquinaria y para quien la alquila: búsqueda, comparación, contacto por WhatsApp, reseñas y niveles de verificación.",
  path: "/como-funciona",
});

const ownerSteps = [
  {
    title: "Publicas tu máquina",
    text: "Completas el formulario con categoría, marca, modelo, ubicación, condiciones y fotos. Toma pocos minutos y es gratuito.",
  },
  {
    title: "Revisamos la publicación",
    text: "Antes de que sea pública, MaquiFly revisa que la información esté completa y sea coherente. Esto protege a todos los propietarios serios.",
  },
  {
    title: "Te contactan por WhatsApp",
    text: "Los clientes te escriben con el nombre de la máquina y el código de la publicación ya en el mensaje. Tú cotizas y acuerdas directamente.",
  },
  {
    title: "Construyes reputación",
    text: "Las reseñas de tus clientes se acumulan en tu perfil y acompañan a todas tus publicaciones.",
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-ink-950">
        <div className="grid-blueprint absolute inset-0" aria-hidden="true" />
        <div className="container-mf relative py-8 sm:py-12">
          <div className="[&_a]:text-ink-300 [&_a:hover]:text-volt-400 [&_span]:text-ink-100 [&_ol]:text-ink-400">
            <Breadcrumbs
              items={[{ label: "Inicio", href: "/" }, { label: "Cómo funciona" }]}
            />
          </div>
          <h1 className="mt-5 max-w-3xl text-3xl font-extrabold leading-tight text-white sm:text-4xl">
            Cómo funciona MaquiFly
          </h1>
          <p className="mt-4 max-w-2xl text-[1.02rem] leading-relaxed text-ink-200">
            MaquiFly conecta maquinaria disponible con proyectos que la
            necesitan. No somos dueños de las máquinas, no fijamos precios y no
            participamos en el contrato de alquiler: eso lo acuerdan el
            propietario y el cliente.
          </p>
        </div>
      </section>

      <Section tone="light">
        <SectionHeading
          eyebrow="Si buscas maquinaria"
          title="De la búsqueda al alquiler en cuatro pasos"
          description="Todo el proceso está pensado para que llegues al propietario correcto con la información necesaria desde el primer mensaje."
        />
        <div className="mt-8">
          <HowItWorks />
        </div>
        <div className="mt-6">
          <LinkButton href="/maquinaria" variant="primary">
            <IconSearch size={18} />
            Buscar maquinaria
          </LinkButton>
        </div>
      </Section>

      <section className="grid-blueprint bg-ink-900 py-14 sm:py-20">
        <div className="container-mf">
          <SectionHeading
            tone="dark"
            eyebrow="Si tienes maquinaria"
            title="De la publicación al primer cliente"
          />
          <ol className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {ownerSteps.map((step, index) => (
              <li
                key={step.title}
                className="rounded-2xl border border-white/10 bg-white/5 p-5"
              >
                <span className="font-display text-3xl font-extrabold text-volt-400">
                  0{index + 1}
                </span>
                <h3 className="mt-2 text-lg font-bold text-white">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-200">
                  {step.text}
                </p>
              </li>
            ))}
          </ol>
          <div className="mt-8">
            <LinkButton href="/publicar" variant="volt">
              <IconPlus size={18} />
              Publicar mi maquinaria
            </LinkButton>
          </div>
        </div>
      </section>

      <Section tone="muted">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionHeading
              eyebrow="Verificación"
              title="Qué significa cada insignia"
              description="MaquiFly no reparte sellos de confianza gratis. Cada nivel dice exactamente lo que se comprobó."
            />
            <ul className="mt-6 flex flex-col gap-4">
              {(["registered", "verified", "documented"] as const).map((status) => (
                <li
                  key={status}
                  className="rounded-xl border border-steel-200 bg-white p-4"
                >
                  <VerificationBadge status={status} withHelp />
                </li>
              ))}
            </ul>
            <Callout tone="warn" className="mt-5">
              Los procesos de verificación avanzada están definidos en el
              producto pero todavía no operan: hoy todas las cuentas son
              «propietario registrado». No mostramos una insignia de verificado
              mientras la verificación no exista de verdad.
            </Callout>
          </div>

          <div>
            <SectionHeading
              eyebrow="Reseñas"
              title="Cómo se construye la reputación"
              description="La reputación es la ventaja competitiva de MaquiFly a largo plazo, y por eso es la parte donde menos nos permitimos atajos."
            />
            <ul className="mt-6 flex flex-col gap-3">
              {[
                "Las reseñas las deja quien contactó a un propietario a través de MaquiFly.",
                "Se califica estado del equipo, puntualidad, comunicación y cumplimiento.",
                "El distintivo «alquiler verificado» solo aparece cuando la plataforma registró el alquiler.",
                "El propietario puede responder públicamente a cualquier reseña.",
                "Mientras una máquina no tenga calificaciones reales, su ficha lo dice: «Aún no hay reseñas».",
                "En el futuro los propietarios también podrán calificar a los clientes: comunicación, cumplimiento, cuidado del equipo y puntualidad.",
              ].map((item) => (
                <li
                  key={item}
                  className="rounded-xl border border-steel-200 bg-white p-4 text-[0.95rem] leading-relaxed text-steel-700"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section tone="light" id="preguntas">
        <SectionHeading
          eyebrow="Preguntas frecuentes"
          title="Todo lo que suelen preguntarnos"
        />
        <div className="mt-8 max-w-3xl">
          <Faq items={faq} />
        </div>
      </Section>

      <JsonLd data={faqJsonLd(faq)} />
    </>
  );
}
