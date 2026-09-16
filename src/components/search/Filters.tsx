"use client";

import type { SearchFilters } from "@/lib/types";
import { categories } from "@/lib/data/categories";
import { activeLocations, locationsBySlug, upcomingLocations } from "@/lib/data/locations";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { IconClose } from "@/components/ui/Icon";

/**
 * Panel de filtros. No guarda estado propio: cada cambio se traduce en una
 * nueva URL, y la URL es la única fuente de verdad del buscador.
 */
export function Filters({
  filters,
  counts,
  onChange,
  onReset,
}: {
  filters: SearchFilters;
  counts: Record<string, number>;
  onChange: (patch: Partial<SearchFilters>) => void;
  onReset: () => void;
}) {
  const selectedLocation = filters.location
    ? locationsBySlug.get(filters.location)
    : undefined;

  return (
    <div className="flex flex-col gap-6">
      <FilterGroup title="Categoría">
        <div className="flex flex-col gap-1">
          <FilterRadio
            name="categoria"
            checked={!filters.category}
            onChange={() => onChange({ category: undefined })}
            label="Todas las categorías"
          />
          {categories.map((category) => (
            <FilterRadio
              key={category.slug}
              name="categoria"
              checked={filters.category === category.slug}
              onChange={() => onChange({ category: category.slug })}
              label={category.name}
              count={counts[category.slug] ?? 0}
            />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Ciudad">
        <div className="flex flex-col gap-1">
          <FilterRadio
            name="ciudad"
            checked={!filters.location}
            onChange={() => onChange({ location: undefined, area: undefined })}
            label="Todo el Perú"
          />
          {activeLocations.map((location) => (
            <FilterRadio
              key={location.slug}
              name="ciudad"
              checked={filters.location === location.slug}
              onChange={() => onChange({ location: location.slug, area: undefined })}
              label={location.name}
            />
          ))}
          {upcomingLocations.map((location) => (
            <FilterRadio
              key={location.slug}
              name="ciudad"
              checked={filters.location === location.slug}
              onChange={() => onChange({ location: location.slug, area: undefined })}
              label={location.name}
              hint="Próximamente"
            />
          ))}
        </div>
      </FilterGroup>

      {selectedLocation && (
        <FilterGroup title={`Zona en ${selectedLocation.name}`}>
          <div className="flex flex-col gap-1">
            <FilterRadio
              name="zona"
              checked={!filters.area}
              onChange={() => onChange({ area: undefined })}
              label="Toda la ciudad"
            />
            {selectedLocation.districts.map((district) => (
              <FilterRadio
                key={district}
                name="zona"
                checked={filters.area === district}
                onChange={() => onChange({ area: district })}
                label={district}
              />
            ))}
          </div>
        </FilterGroup>
      )}

      <FilterGroup title="Condiciones">
        <div className="flex flex-col gap-2">
          <FilterCheck
            checked={Boolean(filters.operator)}
            onChange={(v) => onChange({ operator: v || undefined })}
            label="Con operador disponible"
          />
          <FilterCheck
            checked={Boolean(filters.transport)}
            onChange={(v) => onChange({ transport: v || undefined })}
            label="Con transporte disponible"
          />
          <FilterCheck
            checked={Boolean(filters.withPrice)}
            onChange={(v) => onChange({ withPrice: v || undefined })}
            label="Solo con precio publicado"
          />
        </div>
      </FilterGroup>

      <FilterGroup title="Disponibilidad">
        <div className="flex flex-col gap-1">
          <FilterRadio
            name="disponibilidad"
            checked={!filters.availability}
            onChange={() => onChange({ availability: undefined })}
            label="Cualquiera"
          />
          <FilterRadio
            name="disponibilidad"
            checked={filters.availability === "available"}
            onChange={() => onChange({ availability: "available" })}
            label="Disponible"
          />
          <FilterRadio
            name="disponibilidad"
            checked={filters.availability === "limited"}
            onChange={() => onChange({ availability: "limited" })}
            label="Disponibilidad limitada"
          />
        </div>
      </FilterGroup>

      <Button variant="ghost" size="sm" onClick={onReset} className="self-start">
        <IconClose size={16} />
        Limpiar todos los filtros
      </Button>
    </div>
  );
}

function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="border-t border-steel-200 pt-5 first:border-0 first:pt-0">
      <legend className="mb-3 text-sm font-bold text-ink-900">{title}</legend>
      {children}
    </fieldset>
  );
}

function FilterRadio({
  name,
  checked,
  onChange,
  label,
  count,
  hint,
}: {
  name: string;
  checked: boolean;
  onChange: () => void;
  label: string;
  count?: number;
  hint?: string;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-steel-100">
      <span className="flex min-w-0 items-center gap-2.5">
        <input
          type="radio"
          name={name}
          checked={checked}
          onChange={onChange}
          className="size-4 shrink-0 accent-brand-600"
        />
        <span
          className={`leading-snug ${checked ? "font-semibold text-ink-900" : "text-steel-700"}`}
        >
          {label}
        </span>
        {hint && (
          <Badge tone="neutral" size="sm">
            {hint}
          </Badge>
        )}
      </span>
      {typeof count === "number" && (
        <span className="shrink-0 text-xs tabular-nums text-steel-400">{count}</span>
      )}
    </label>
  );
}

function FilterCheck({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-steel-100">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 shrink-0 accent-brand-600"
      />
      <span className={checked ? "font-semibold text-ink-900" : "text-steel-700"}>
        {label}
      </span>
    </label>
  );
}
