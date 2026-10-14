import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { PublishStart } from "@/components/account/PublishStart";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Publicar mi maquinaria en alquiler — gratis",
  description:
    "Publica tu maquinaria o equipo en MaquiFly y llega a quienes la están buscando en Piura. Crea tu cuenta gratis, elige tu plan y sube tu máquina: tú fijas el precio y las condiciones.",
  path: "/publicar",
  keywords: [
    "publicar maquinaria en alquiler",
    "alquilar mi maquinaria Piura",
    "anunciar excavadora alquiler",
  ],
});

/**
 * Publicar exige una cuenta: así cada máquina tiene un dueño identificado y
 * un plan. Con sesión iniciada, esta página lleva directo a «Agregar
 * máquina»; sin sesión, explica los pasos y lleva al registro.
 */
export default function PublishPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-ink-950">
        <div className="grid-blueprint absolute inset-0" aria-hidden="true" />
        <div className="container-mf relative py-8 sm:py-12">
          <div className="[&_a]:text-ink-300 [&_a:hover]:text-volt-400 [&_span]:text-ink-100 [&_ol]:text-ink-400">
            <Breadcrumbs items={[{ label: "Inicio", href: "/" }, { label: "Publicar maquinaria" }]} />
          </div>
          <h1 className="mt-5 max-w-3xl text-3xl font-extrabold leading-tight text-white sm:text-4xl">
            Publica tu maquinaria y llega a nuevos clientes
          </h1>
          <p className="mt-4 max-w-2xl text-[1.02rem] leading-relaxed text-ink-200">
            Empieza gratis. Tú decides el precio, la disponibilidad y las condiciones; los clientes te escriben por
            WhatsApp.
          </p>
        </div>
      </section>

      <div className="container-mf py-8 sm:py-12">
        <PublishStart />
      </div>
    </>
  );
}
