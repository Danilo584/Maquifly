"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import type { SearchFilters, SortOption } from "@/lib/types";
import {
  applyFilters,
  paginate,
  sortMachines,
} from "@/lib/repository/demo-repository";
import { demoMachines } from "@/lib/data/demo-machines";
import { categoriesBySlug } from "@/lib/data/categories";
import { locationsBySlug } from "@/lib/data/locations";
import {
  buildSearchQuery,
  countActiveFilters,
  parseSearchParams,
  sortLabels,
} from "@/lib/search-params";
import { availabilityLabel } from "@/lib/format";
import { track } from "@/lib/analytics";

import { Filters } from "@/components/search/Filters";
import { SearchBar } from "@/components/search/SearchBar";
import { MachineCard } from "@/components/machine/MachineCard";
import { DemoNotice } from "@/components/common/Demo";
import { Button, LinkButton } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Callout } from "@/components/ui/Callout";
import {
  IconClose,
  IconFilter,
  IconPlus,
  IconSearch,
} from "@/components/ui/Icon";

/**
 * DECISIÓN TÉCNICA
 * ---------------------------------------------------------------------------
 * El buscador se resuelve en el cliente a partir de la URL. Motivos:
 *
 *  1. Los filtros se aplican al instante, sin recargar ni esperar al servidor.
 *  2. La URL sigue siendo compartible y el botón "atrás" funciona.
 *  3. Permite exportar el sitio de forma estática para el MVP.
 *
 * Lo indexable NO depende de esta página: las páginas de categoría
 * (/maquinaria/[categoria]) y las landings locales (/alquiler-…-piura) se
 * generan en el servidor con contenido completo. Esta vista lleva
 * `robots: noindex` a propósito, para no competir consigo misma en Google
 * con cientos de combinaciones de filtros.
 *
 * Cuando el catálogo pase a Supabase, se reemplaza `useMemo` por una llamada
 * a `/api/maquinaria` con los mismos parámetros; el resto del componente no
 * cambia.
 */
export function SearchResults() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filters = useMemo<SearchFilters>(
    () => parseSearchParams(Object.fromEntries(searchParams.entries())),
    [searchParams],
  );

  const result = useMemo(() => {
    const filtered = applyFilters(demoMachines, filters);
    return paginate(sortMachines(filtered, filters), filters.page ?? 1);
  }, [filters]);

  // Conteo por categoría respetando el resto de filtros, para que los números
  // del panel lateral coincidan con lo que el usuario obtendrá al hacer clic.
  const counts = useMemo(() => {
    const base = applyFilters(demoMachines, { ...filters, category: undefined });
    const map: Record<string, number> = {};
    for (const machine of base) {
      for (const [slug, category] of categoriesBySlug) {
        if (category.id === machine.categoryId) {
          map[slug] = (map[slug] ?? 0) + 1;
        }
      }
    }
    return map;
  }, [filters]);

  const push = useCallback(
    (next: SearchFilters) => {
      router.push(`/maquinaria${buildSearchQuery(next)}`, { scroll: false });
    },
    [router],
  );

  const update = useCallback(
    (patch: Partial<SearchFilters>) => {
      const next = { ...filters, ...patch, page: 1 };
      const [key, value] = Object.entries(patch)[0] ?? [];
      if (key) track({ name: "filter_apply", filter: key, value: String(value) });
      push(next);
    },
    [filters, push],
  );

  const reset = useCallback(() => {
    router.push("/maquinaria", { scroll: false });
  }, [router]);

  // Cierra el panel móvil al cambiar los filtros.
  useEffect(() => {
    setDrawerOpen(false);
  }, [searchParams]);

  const activeCount = countActiveFilters(filters);
  const anyResults = result.machines.length > 0;
  const demoResults = result.machines.some((m) => m.isDemo);
  const ratingSortWithoutReviews =
    filters.sort === "rating" && result.machines.every((m) => m.rating === null);

  return (
    <div className="container-mf py-6 sm:py-8">
      <div className="mb-6">
        <SearchBar
          variant="compact"
          defaultQuery={filters.q ?? ""}
          defaultCategory={filters.category ?? ""}
          defaultLocation={filters.location ?? ""}
        />
      </div>

      <div className="lg:grid lg:grid-cols-[18.5rem_1fr] lg:gap-8">
        {/* Panel de filtros — escritorio */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 max-h-[calc(100dvh-8rem)] overflow-y-auto rounded-2xl border border-steel-200 bg-white p-5">
            <h2 className="mb-5 text-base font-bold text-ink-900">Filtros</h2>
            <Filters
              filters={filters}
              counts={counts}
              onChange={update}
              onReset={reset}
            />
          </div>
        </aside>

        <div className="min-w-0">
          <ResultsToolbar
            total={result.total}
            filters={filters}
            activeCount={activeCount}
            onSortChange={(sort) => push({ ...filters, sort, page: 1 })}
            onOpenFilters={() => setDrawerOpen(true)}
          />

          <ActiveChips filters={filters} onChange={update} onReset={reset} />

          {ratingSortWithoutReviews && (
            <Callout tone="warn" className="mt-4">
              Todavía no hay reseñas reales en MaquiFly, así que no es posible
              ordenar por valoración. Se muestran primero los equipos
              disponibles y más recientes.
            </Callout>
          )}

          {demoResults && <DemoNotice variant="catalog" className="mt-4" />}

          <div className="mt-5">
            {anyResults ? (
              <>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {result.machines.map((machine, index) => (
                    <MachineCard
                      key={machine.id}
                      machine={machine}
                      priority={index < 3}
                    />
                  ))}
                </div>
                <Pagination
                  page={result.page}
                  totalPages={result.totalPages}
                  filters={filters}
                />
              </>
            ) : (
              <EmptyState
                tone="dashed"
                icon={<IconSearch size={24} />}
                title="No encontramos maquinaria con esos filtros"
                description="Prueba ampliando la búsqueda: quita algún filtro, cambia de categoría o busca en toda la ciudad. Si el equipo que necesitas todavía no está publicado, escríbenos y lo buscamos entre los propietarios de la zona."
                action={
                  <Button variant="primary" onClick={reset}>
                    <IconClose size={18} />
                    Cambiar filtros
                  </Button>
                }
                secondaryAction={
                  <LinkButton href="/contacto" variant="secondary">
                    Pedir ayuda para encontrarlo
                  </LinkButton>
                }
              />
            )}
          </div>

          {!anyResults && (
            <div className="mt-6 rounded-2xl border border-steel-200 bg-steel-50 p-6">
              <h2 className="text-base font-bold text-ink-900">
                ¿Tienes esta maquinaria y está parada?
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-steel-600">
                Hay gente buscando exactamente este equipo en MaquiFly. Publicar
                es gratuito y tu anuncio aparece en esta misma búsqueda.
              </p>
              <LinkButton href="/publicar" variant="primary" size="sm" className="mt-4">
                <IconPlus size={17} />
                Publicar mi maquinaria
              </LinkButton>
            </div>
          )}
        </div>
      </div>

      {/* Panel de filtros — móvil */}
      {drawerOpen && (
        <div className="fixed inset-0 z-60 lg:hidden">
          <div
            className="absolute inset-0 bg-ink-950/50"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Filtros de búsqueda"
            className="absolute inset-y-0 right-0 flex w-[min(22rem,90vw)] flex-col bg-white shadow-pop"
          >
            <div className="flex items-center justify-between border-b border-steel-200 px-4 py-3">
              <h2 className="text-base font-bold text-ink-900">Filtros</h2>
              <Button
                variant="ghost"
                size="sm"
                className="px-2"
                aria-label="Cerrar filtros"
                onClick={() => setDrawerOpen(false)}
              >
                <IconClose size={20} />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <Filters
                filters={filters}
                counts={counts}
                onChange={update}
                onReset={reset}
              />
            </div>
            <div className="border-t border-steel-200 p-4">
              <Button
                variant="primary"
                fullWidth
                onClick={() => setDrawerOpen(false)}
              >
                Ver {result.total} {result.total === 1 ? "resultado" : "resultados"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ResultsToolbar({
  total,
  filters,
  activeCount,
  onSortChange,
  onOpenFilters,
}: {
  total: number;
  filters: SearchFilters;
  activeCount: number;
  onSortChange: (sort: SortOption) => void;
  onOpenFilters: () => void;
}) {
  const category = filters.category
    ? categoriesBySlug.get(filters.category)
    : undefined;
  const location = filters.location
    ? locationsBySlug.get(filters.location)
    : undefined;

  const heading = [
    category ? category.name : "Maquinaria y equipos",
    location ? `en ${location.name}` : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="flex flex-col gap-3 border-b border-steel-200 pb-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-xl font-extrabold text-ink-900 sm:text-2xl">{heading}</h1>
        <p className="mt-1 text-sm text-steel-500">
          {total === 0
            ? "Sin resultados con los filtros actuales"
            : `${total} ${total === 1 ? "publicación encontrada" : "publicaciones encontradas"}`}
          {filters.q ? ` para «${filters.q}»` : ""}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          className="lg:hidden"
          onClick={onOpenFilters}
        >
          <IconFilter size={17} />
          Filtros
          {activeCount > 0 && (
            <span className="ml-0.5 rounded-full bg-brand-600 px-1.5 text-xs font-bold text-white">
              {activeCount}
            </span>
          )}
        </Button>

        <label className="flex items-center gap-2 text-sm">
          <span className="hidden text-steel-500 sm:inline">Ordenar por</span>
          <select
            value={filters.sort ?? "relevance"}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="h-9 rounded-lg border border-steel-300 bg-white px-2.5 text-sm font-medium text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/15"
          >
            {(Object.keys(sortLabels) as SortOption[]).map((option) => (
              <option key={option} value={option}>
                {sortLabels[option]}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}

function ActiveChips({
  filters,
  onChange,
  onReset,
}: {
  filters: SearchFilters;
  onChange: (patch: Partial<SearchFilters>) => void;
  onReset: () => void;
}) {
  const chips: Array<{ label: string; clear: () => void }> = [];

  if (filters.category) {
    chips.push({
      label: categoriesBySlug.get(filters.category)?.name ?? filters.category,
      clear: () => onChange({ category: undefined }),
    });
  }
  if (filters.location) {
    chips.push({
      label: locationsBySlug.get(filters.location)?.name ?? filters.location,
      clear: () => onChange({ location: undefined, area: undefined }),
    });
  }
  if (filters.area) {
    chips.push({ label: filters.area, clear: () => onChange({ area: undefined }) });
  }
  if (filters.operator) {
    chips.push({
      label: "Con operador",
      clear: () => onChange({ operator: undefined }),
    });
  }
  if (filters.transport) {
    chips.push({
      label: "Con transporte",
      clear: () => onChange({ transport: undefined }),
    });
  }
  if (filters.withPrice) {
    chips.push({
      label: "Con precio publicado",
      clear: () => onChange({ withPrice: undefined }),
    });
  }
  if (filters.availability) {
    chips.push({
      label: availabilityLabel[filters.availability],
      clear: () => onChange({ availability: undefined }),
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <button
          key={chip.label}
          type="button"
          onClick={chip.clear}
          className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 py-1 pl-3 pr-2 text-sm font-medium text-brand-800 transition-colors hover:bg-brand-100"
        >
          {chip.label}
          <IconClose size={14} />
          <span className="sr-only">Quitar filtro</span>
        </button>
      ))}
      <button
        type="button"
        onClick={onReset}
        className="text-sm font-semibold text-steel-500 underline underline-offset-2 hover:text-ink-900"
      >
        Limpiar todo
      </button>
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  filters,
}: {
  page: number;
  totalPages: number;
  filters: SearchFilters;
}) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav aria-label="Paginación de resultados" className="mt-8 flex justify-center">
      <ul className="flex flex-wrap items-center gap-1.5">
        <li>
          <PageLink
            disabled={page === 1}
            href={`/maquinaria${buildSearchQuery({ ...filters, page: page - 1 })}`}
            label="Anterior"
          />
        </li>
        {pages.map((p) => (
          <li key={p}>
            <Link
              href={`/maquinaria${buildSearchQuery({ ...filters, page: p })}`}
              aria-current={p === page ? "page" : undefined}
              className={`inline-flex size-9 items-center justify-center rounded-lg text-sm font-semibold transition-colors ${
                p === page
                  ? "bg-brand-600 text-white"
                  : "border border-steel-300 bg-white text-steel-700 hover:bg-steel-100"
              }`}
            >
              {p}
            </Link>
          </li>
        ))}
        <li>
          <PageLink
            disabled={page === totalPages}
            href={`/maquinaria${buildSearchQuery({ ...filters, page: page + 1 })}`}
            label="Siguiente"
          />
        </li>
      </ul>
    </nav>
  );
}

function PageLink({
  disabled,
  href,
  label,
}: {
  disabled: boolean;
  href: string;
  label: string;
}) {
  if (disabled) {
    return (
      <span className="inline-flex h-9 items-center rounded-lg border border-steel-200 px-3 text-sm font-semibold text-steel-300">
        {label}
      </span>
    );
  }
  return (
    <Link
      href={href}
      className="inline-flex h-9 items-center rounded-lg border border-steel-300 bg-white px-3 text-sm font-semibold text-steel-700 transition-colors hover:bg-steel-100"
    >
      {label}
    </Link>
  );
}
