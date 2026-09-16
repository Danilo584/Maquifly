import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchResults } from "@/components/search/SearchResults";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...pageMetadata({
    title: "Buscar maquinaria y equipos en alquiler",
    description:
      "Busca maquinaria y equipos disponibles para alquiler: filtra por categoría, ciudad, disponibilidad, operador y transporte, y contacta directamente al propietario.",
    path: "/maquinaria",
  }),
  /**
   * Los resultados filtrados no se indexan: generarían cientos de URLs casi
   * idénticas compitiendo entre sí. El tráfico orgánico entra por las páginas
   * de categoría y por las landings locales, que sí tienen contenido propio.
   */
  robots: { index: false, follow: true },
};

export default function SearchPage() {
  return (
    <>
      <div className="border-b border-steel-200 bg-steel-50">
        <div className="container-mf py-3">
          <Breadcrumbs
            items={[{ label: "Inicio", href: "/" }, { label: "Buscar maquinaria" }]}
          />
        </div>
      </div>

      <Suspense
        fallback={
          <div className="container-mf py-16">
            <p className="text-sm text-steel-500">Cargando buscador…</p>
          </div>
        }
      >
        <SearchResults />
      </Suspense>
    </>
  );
}
