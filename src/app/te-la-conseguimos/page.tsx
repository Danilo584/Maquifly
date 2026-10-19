import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { MachineRequestForm } from "@/components/request/MachineRequestForm";

export const metadata: Metadata = pageMetadata({
  title: "Te conseguimos la máquina",
  description:
    "¿No encuentras la maquinaria que necesitas? Dinos qué equipo, dónde y para cuándo, y te buscamos un propietario en tu zona. Gratis y sin compromiso.",
  path: "/te-la-conseguimos",
});

/**
 * Página dedicada del pedido. La búsqueda vacía y las landings enlazan aquí
 * con ?categoria=…&ciudad=… para que el formulario llegue ya rellenado.
 */
export default function MachineRequestPage() {
  return (
    <>
      <div className="border-b border-steel-200 bg-steel-50">
        <div className="container-mf py-3">
          <Breadcrumbs items={[{ label: "Inicio", href: "/" }, { label: "Te conseguimos la máquina" }]} />
        </div>
      </div>

      <div className="container-mf py-10 sm:py-14">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-3xl font-extrabold text-ink-900 sm:text-4xl">
            Te conseguimos la máquina
          </h1>
          <p className="mt-4 text-[1.02rem] leading-relaxed text-steel-600">
            Dinos qué necesitas, dónde y para cuándo. La buscamos entre los
            propietarios de tu zona y te escribimos por WhatsApp con las
            opciones que encontremos.
          </p>
          <div className="mt-8 rounded-2xl border border-steel-200 bg-white p-5 shadow-card sm:p-7">
            <MachineRequestForm context="pagina" readFromUrl />
          </div>
        </div>
      </div>
    </>
  );
}
