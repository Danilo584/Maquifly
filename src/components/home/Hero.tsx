import Image from "next/image";
import Link from "next/link";
import { SearchBar } from "@/components/search/SearchBar";
import { LinkButton } from "@/components/ui/Button";
import { IconArrowRight, IconPlus, IconSearch } from "@/components/ui/Icon";
import { activeLocations } from "@/lib/data/locations";
import { categories } from "@/lib/data/categories";

const quickLinks = [
  { slug: "minicargadores", label: "Minicargadores" },
  { slug: "excavadoras", label: "Excavadoras" },
  { slug: "retroexcavadoras", label: "Retroexcavadoras" },
  { slug: "volquetes", label: "Volquetes" },
  { slug: "generadores", label: "Generadores" },
];

export function Hero() {
  const city = activeLocations[0]?.name ?? "Piura";

  return (
    <section className="relative overflow-hidden bg-ink-950">
      {/* Foto de fondo: el lado izquierdo es oscuro para que el texto se lea */}
      <Image
        src="/hero-maquinaria.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-[70%_center] opacity-60 sm:opacity-75 lg:opacity-100"
      />
      {/* Degradados para asegurar contraste del texto y del buscador */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/80 to-ink-950/10"
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-ink-950 via-ink-950/60 to-transparent"
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-volt-400/60 to-transparent"
        aria-hidden="true"
      />

      <div className="container-mf relative pb-10 pt-8 sm:py-20 lg:py-28">
        <div className="max-w-3xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-volt-400/30 bg-volt-400/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-volt-300">
            <span className="size-1.5 rounded-full bg-volt-400" aria-hidden="true" />
            Iniciando en {city}, Perú
          </p>

          <h1 className="mt-4 text-[1.9rem] font-extrabold leading-[1.08] sm:mt-5 text-white text-balance-tight sm:text-5xl lg:text-[3.6rem]">
            Encuentra la maquinaria que tu proyecto necesita
          </h1>

          <p className="mt-3 max-w-2xl text-[0.95rem] leading-relaxed sm:mt-5 sm:text-base text-ink-200 sm:text-lg">
            Encuentra maquinaria y equipos disponibles para alquiler y conecta
            directamente con propietarios.
            <span className="hidden sm:inline">
              {" "}Sin comisiones y sin llamadas a ciegas: ves las características,
              la ubicación y las condiciones antes de escribir.
            </span>
          </p>

          <div className="mt-7 hidden gap-3 sm:flex sm:flex-row">
            <LinkButton href="/maquinaria" variant="volt" size="lg">
              <IconSearch size={19} />
              Buscar maquinaria
            </LinkButton>
            <LinkButton href="/publicar" variant="outline" size="lg">
              <IconPlus size={19} />
              Publicar mi maquinaria
            </LinkButton>
          </div>
        </div>

        <div className="mt-6 sm:mt-10 lg:mt-12">
          <SearchBar variant="hero" />
        </div>

        <div className="-mx-4 mt-5 flex items-center gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:mt-6 sm:flex-wrap sm:gap-x-3 sm:gap-y-2 sm:overflow-visible sm:px-0 [scrollbar-width:none]">
          <span className="hidden text-sm font-medium text-ink-300 sm:inline">Búsquedas frecuentes:</span>
          {quickLinks
            .filter((q) => categories.some((c) => c.slug === q.slug))
            .map((q) => (
              <Link
                key={q.slug}
                href={`/maquinaria/${q.slug}`}
                className="shrink-0 rounded-full border border-white/15 px-3 py-1 text-sm text-ink-200 transition-colors hover:border-volt-400/50 hover:text-volt-300"
              >
                {q.label}
              </Link>
            ))}
          <Link
            href="/categorias"
            className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-volt-400 hover:text-volt-300"
          >
            Ver todas <IconArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}
