import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { IconPin, IconTag } from "@/components/ui/Icon";

/**
 * Abanico de 3 fichas de ejemplo en la sección «Para propietarios»: muestra
 * cómo se ve una máquina publicada en MaquiFly. Son ilustrativas (no son
 * publicaciones reales ni enlazan a ninguna) y no muestran precios inventados.
 * Fotos de Pexels con marcas difuminadas, en /public/propietarios/.
 */
const fichas = [
  { foto: "/propietarios/ficha-tractor.jpg", tipo: "Tractor de oruga", zona: "Piura", giro: "-rotate-6", pos: "left-0 top-8" },
  { foto: "/propietarios/ficha-rodillo.jpg", tipo: "Rodillo compactador", zona: "Sullana", giro: "rotate-0", pos: "left-[11.5rem] top-0 z-10" },
  { foto: "/propietarios/ficha-motoniveladora.jpg", tipo: "Motoniveladora", zona: "Paita", giro: "rotate-6", pos: "left-[23rem] top-10" },
];

export function FichasEjemplo() {
  return (
    <div className="relative mt-14 hidden h-52 lg:block" aria-hidden="true">
      {fichas.map((f, i) => (
        <div
          key={f.tipo}
          className={`absolute w-60 rounded-2xl border border-steel-200 bg-white shadow-pop transition-transform duration-300 motion-safe:hover:-translate-y-2 ${f.pos} ${f.giro}`}
        >
          <div className="relative aspect-[16/9] overflow-hidden rounded-t-2xl bg-ink-900">
            <Image src={f.foto} alt="" fill sizes="240px" className="object-cover" />
            <div className="absolute right-2 top-2">
              <Badge tone="ok" size="sm">
                Disponible
              </Badge>
            </div>
          </div>
          <div className="p-3">
            <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-brand-700">Alquiler</p>
            <p className="text-sm font-bold leading-snug text-ink-900">{f.tipo}</p>
            <p className="mt-1 flex items-center justify-between gap-2 text-xs text-steel-500">
              <span className="inline-flex items-center gap-1">
                <IconPin size={13} className="text-steel-400" />
                {f.zona}
              </span>
              <span className="inline-flex items-center gap-1 font-semibold text-ink-800">
                <IconTag size={13} className="text-brand-600" />
                Tu precio
              </span>
            </p>
          </div>
          {i === 1 && (
            <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-volt-400 px-3 py-1 text-[0.7rem] font-extrabold uppercase tracking-wide text-ink-950 shadow-[0_0_20px_-4px_rgb(200_248_60/0.8)]">
              Así se verá tu máquina
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
