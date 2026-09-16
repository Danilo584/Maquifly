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
      <div className="grid-blueprint absolute inset-0" aria-hidden="true" />
      <div
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-volt-400/60 to-transparent"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-40 -top-40 size-[34rem] rounded-full bg-brand-700/25 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-52 -left-32 size-[30rem] rounded-full bg-volt-500/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="container-mf relative py-14 sm:py-20 lg:py-24">
        <div className="max-w-3xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-volt-400/30 bg-volt-400/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-volt-300">
            <span className="size-1.5 rounded-full bg-volt-400" aria-hidden="true" />
            Iniciando en {city}, Perú
          </p>

          <h1 className="mt-5 text-[2.1rem] font-extrabold leading-[1.08] text-white text-balance-tight sm:text-5xl lg:text-[3.6rem]">
            Encuentra la maquinaria que tu proyecto necesita
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-200 sm:text-lg">
            Encuentra maquinaria y equipos disponibles para alquiler y conecta
            directamente con propietarios. Sin intermediarios y sin llamadas a
            ciegas: ves las características, la ubicación y las condiciones
            antes de escribir.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
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

        <div className="mt-10 lg:mt-12">
          <SearchBar variant="hero" />
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="text-sm font-medium text-ink-300">Búsquedas frecuentes:</span>
          {quickLinks
            .filter((q) => categories.some((c) => c.slug === q.slug))
            .map((q) => (
              <Link
                key={q.slug}
                href={`/maquinaria/${q.slug}`}
                className="rounded-full border border-white/15 px-3 py-1 text-sm text-ink-200 transition-colors hover:border-volt-400/50 hover:text-volt-300"
              >
                {q.label}
              </Link>
            ))}
          <Link
            href="/categorias"
            className="inline-flex items-center gap-1 text-sm font-semibold text-volt-400 hover:text-volt-300"
          >
            Ver todas <IconArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}
