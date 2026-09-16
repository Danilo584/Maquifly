"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { categories } from "@/lib/data/categories";
import { activeLocations, upcomingLocations } from "@/lib/data/locations";
import { searchHref } from "@/lib/search-params";
import { track } from "@/lib/analytics";
import { Button } from "@/components/ui/Button";
import { IconSearch } from "@/components/ui/Icon";

/**
 * Buscador principal. Es un formulario real: navega a /maquinaria con los
 * filtros en la URL, de modo que funciona igual escrito a mano, compartido
 * por WhatsApp o enviado desde aquí.
 */
export function SearchBar({
  variant = "hero",
  defaultQuery = "",
  defaultCategory = "",
  defaultLocation = "",
}: {
  variant?: "hero" | "compact";
  defaultQuery?: string;
  defaultCategory?: string;
  defaultLocation?: string;
}) {
  const router = useRouter();
  const id = useId();
  const [q, setQ] = useState(defaultQuery);
  const [category, setCategory] = useState(defaultCategory);
  const [location, setLocation] = useState(defaultLocation);

  const hero = variant === "hero";

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    track({
      name: "search_submit",
      query: q,
      category: category || undefined,
      location: location || undefined,
    });
    router.push(
      searchHref({
        q: q.trim() || undefined,
        category: category || undefined,
        location: location || undefined,
      }),
    );
  }

  const selectClass =
    "h-12 w-full appearance-none rounded-lg border border-steel-200 bg-white px-3.5 text-[0.95rem] text-ink-900 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 focus:outline-none";

  return (
    <form
      onSubmit={onSubmit}
      role="search"
      aria-label="Buscar maquinaria"
      className={
        hero
          ? "rounded-2xl border border-white/10 bg-white p-3 shadow-pop sm:p-4"
          : "rounded-xl border border-steel-200 bg-white p-3"
      }
    >
      <div className="grid gap-2.5 sm:gap-3 lg:grid-cols-[1.4fr_1fr_1fr_auto]">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor={`${id}-q`}
            className="px-1 text-xs font-bold uppercase tracking-wider text-steel-500"
          >
            ¿Qué maquinaria necesitas?
          </label>
          <div className="relative">
            <IconSearch
              size={18}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-steel-400"
            />
            <input
              id={`${id}-q`}
              name="q"
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Minicargador, excavadora, volquete…"
              autoComplete="off"
              className="h-12 w-full rounded-lg border border-steel-200 bg-white pl-10 pr-3 text-[0.95rem] text-ink-900 placeholder:text-steel-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor={`${id}-cat`}
            className="px-1 text-xs font-bold uppercase tracking-wider text-steel-500"
          >
            Categoría
          </label>
          <select
            id={`${id}-cat`}
            name="categoria"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={selectClass}
          >
            <option value="">Todas las categorías</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor={`${id}-loc`}
            className="px-1 text-xs font-bold uppercase tracking-wider text-steel-500"
          >
            ¿Dónde?
          </label>
          <select
            id={`${id}-loc`}
            name="ciudad"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className={selectClass}
          >
            <option value="">Todo el Perú</option>
            {activeLocations.map((l) => (
              <option key={l.slug} value={l.slug}>
                {l.name}
              </option>
            ))}
            <optgroup label="Próximamente">
              {upcomingLocations.map((l) => (
                <option key={l.slug} value={l.slug}>
                  {l.name}
                </option>
              ))}
            </optgroup>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <span
            aria-hidden="true"
            className="hidden px-1 text-xs font-bold uppercase tracking-wider text-transparent lg:block"
          >
            Buscar
          </span>
          <Button type="submit" variant="primary" className="h-12 px-7" fullWidth>
            <IconSearch size={18} />
            Buscar
          </Button>
        </div>
      </div>
    </form>
  );
}
