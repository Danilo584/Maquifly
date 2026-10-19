import Image from "next/image";
import { formatPEN, formatUSD, toUSD, type BoostPackage } from "@/lib/plans";
import { LinkButton } from "@/components/ui/Button";
import { IconArrowRight, IconBolt, IconCheck } from "@/components/ui/Icon";

/**
 * Destacados Express en /planes: la tarjeta del paquete (con fotos de fondo
 * oscurecidas y cinta de obra) y, al lado, un mosaico con una máquina de cada
 * tipo: retroexcavadora, miniexcavadora, minicargador y cargador frontal.
 * Fotos de Pexels con las marcas difuminadas, en /public/destacados/.
 */
const mosaico = [
  { src: "/destacados/retro.jpg", destacado: true },
  { src: "/destacados/miniexc.jpg" },
  { src: "/destacados/minicarg.jpg" },
  { src: "/destacados/cargador.jpg" },
];

const ventajas = [
  "Primeros lugares del buscador",
  "Etiqueta «Destacado» en la ficha",
  "Sin plan mensual ni contrato",
];

export function DestacadoExpress({ boost }: { boost: BoostPackage }) {
  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,26rem)_1fr]">
      {/* Tarjeta del paquete */}
      <div className="relative overflow-hidden rounded-[1.4rem] border-2 border-volt-400/60 bg-ink-950 shadow-[0_30px_70px_-24px_rgb(200_248_60/0.5)]">
        <div className="absolute inset-0" aria-hidden="true">
          <div className="absolute -inset-10 grid rotate-[-6deg] scale-110 grid-cols-2 grid-rows-2 gap-2 opacity-60">
            {mosaico.map((f) => (
              <div key={f.src} className="relative overflow-hidden rounded-lg">
                <Image src={f.src} alt="" fill sizes="220px" className="object-cover" />
              </div>
            ))}
          </div>
          <div className="absolute inset-0 bg-linear-to-b from-ink-950/75 via-ink-950/95 to-ink-950" />
        </div>
        <div className="cinta-obra relative h-2.5" aria-hidden="true" />

        <div className="relative p-7 sm:p-8">
          <div className="flex items-center gap-3">
            <span className="flex size-12 items-center justify-center rounded-xl bg-volt-400 text-ink-950 shadow-[0_0_26px_-4px_rgb(200_248_60/0.85)]">
              <IconBolt size={24} />
            </span>
            <span className="rounded-full border border-volt-400/40 bg-volt-400/15 px-2.5 py-1 text-[0.7rem] font-bold uppercase tracking-wide text-volt-300">
              Pago único
            </span>
          </div>
          <h3 className="mt-5 text-2xl font-extrabold text-white">{boost.days} días destacada</h3>
          <p className="mt-1 font-display text-5xl font-extrabold tracking-tight text-white sm:text-6xl">
            {formatPEN(boost.pricePEN)}
            <span className="ml-2 align-middle text-base font-semibold tracking-normal text-ink-300">
              ≈ {formatUSD(toUSD(boost.pricePEN))}
            </span>
          </p>
          <p className="mt-1 text-sm text-ink-200">Una máquina, pago único, se activa al verificar el pago.</p>
          <ul className="mt-5 flex flex-col gap-2.5 text-sm">
            {ventajas.map((v) => (
              <li key={v} className="flex items-center gap-2.5 text-ink-50">
                <span className="flex size-[18px] shrink-0 items-center justify-center rounded-full bg-volt-400 text-ink-950">
                  <IconCheck size={12} strokeWidth={3} />
                </span>
                {v}
              </li>
            ))}
          </ul>
          <LinkButton
            href={`/pagar/${boost.id}`}
            variant="volt"
            className="mt-7 shadow-[0_0_30px_-6px_rgb(200_248_60/0.8)]"
          >
            Destacar mi máquina
            <IconArrowRight size={18} />
          </LinkButton>
        </div>
      </div>

      {/* Mosaico: una máquina de cada tipo */}
      <div className="grid grid-cols-2 gap-3 lg:min-h-72 lg:grid-rows-2" aria-hidden="true">
        {mosaico.map((f) => (
          <div key={f.src} className="relative aspect-[4/3] overflow-hidden rounded-2xl lg:aspect-auto">
            <Image src={f.src} alt="" fill sizes="(max-width: 1024px) 50vw, 25vw" className="object-cover" />
            <div className="absolute inset-0 bg-linear-to-t from-ink-950/70 via-transparent to-transparent" />
            {f.destacado && (
              <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-ink-950 px-2.5 py-1 text-[0.7rem] font-bold uppercase tracking-wide text-volt-400">
                <IconBolt size={12} />
                Destacado
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
