import type { Metadata } from "next";
import { PublishForm } from "@/components/publish/PublishForm";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Publicar mi maquinaria en alquiler — gratis",
  description:
    "Publica tu maquinaria o equipo en MaquiFly y llega a quienes la están buscando en Piura. Publicar es gratuito: tú fijas el precio y las condiciones.",
  path: "/publicar",
  keywords: [
    "publicar maquinaria en alquiler",
    "alquilar mi maquinaria Piura",
    "anunciar excavadora alquiler",
  ],
});

export default function PublishPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-ink-950">
        <div className="grid-blueprint absolute inset-0" aria-hidden="true" />
        <div className="container-mf relative py-8 sm:py-12">
          <div className="[&_a]:text-ink-300 [&_a:hover]:text-volt-400 [&_span]:text-ink-100 [&_ol]:text-ink-400">
            <Breadcrumbs
              items={[{ label: "Inicio", href: "/" }, { label: "Publicar maquinaria" }]}
            />
          </div>
          <h1 className="mt-5 max-w-3xl text-3xl font-extrabold leading-tight text-white sm:text-4xl">
            Publica tu maquinaria y llega a nuevos clientes
          </h1>
          <p className="mt-4 max-w-2xl text-[1.02rem] leading-relaxed text-ink-200">
            Publicar es gratuito. Tú decides el precio, la disponibilidad y las
            condiciones; los clientes te escriben directamente por WhatsApp.
          </p>
        </div>
      </section>

      <div className="container-mf py-8 sm:py-12">
        <PublishForm />
      </div>
    </>
  );
}
