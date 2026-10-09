import Image from "next/image";
import Link from "next/link";
import type { Machine } from "@/lib/types";
import { categoriesById } from "@/lib/data/categories";
import { locationsById } from "@/lib/data/locations";
import { availabilityLabel, formatPrice, pricingUnitLabel } from "@/lib/format";
import { Badge } from "@/components/ui/Badge";
import { DemoBadge } from "@/components/common/Demo";
import { IconOperator, IconPin, IconTruck } from "@/components/ui/Icon";
import { RatingStars } from "@/components/reviews/RatingStars";
import { FeaturedBadge, FounderBadge, machineIsFeatured } from "@/components/owner/PlanBadges";

const availabilityTone = {
  available: "ok",
  limited: "warn",
  unavailable: "neutral",
} as const;

export function MachineCard({
  machine,
  priority = false,
}: {
  machine: Machine;
  priority?: boolean;
}) {
  const category = categoriesById.get(machine.categoryId);
  const location = locationsById.get(machine.locationId);
  const price = formatPrice(machine);
  const cover = machine.images[0];

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-steel-200 bg-white shadow-card transition-shadow duration-200 hover:shadow-card-hover focus-within:shadow-card-hover">
      <div className="relative aspect-[4/3] overflow-hidden bg-ink-900">
        {cover ? (
          <Image
            src={cover.url}
            alt={cover.alt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            priority={priority}
            /* Las vistas previas del formulario usan blob: — next/image no
               puede optimizarlas, así que se sirven tal cual. */
            unoptimized={!cover.url.startsWith("/")}
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-ink-300">
            Sin fotografías
          </div>
        )}

        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {machine.isDemo && <DemoBadge size="sm" />}
          {!machine.isDemo && machineIsFeatured(machine) && <FeaturedBadge />}
          {!machine.isDemo && machine.ownerIsFounder && <FounderBadge />}
          {/* En una publicación DEMO la etiqueta DEMO ya lo dice todo:
              no se apilan dos avisos sobre la misma imagen. */}
          {!machine.isDemo && cover?.isPlaceholder && (
            <Badge
              tone="dark"
              size="sm"
              title="Ilustración referencial: el propietario aún no ha subido fotografías reales."
            >
              Sin fotos reales
            </Badge>
          )}
        </div>

        <div className="absolute right-3 top-3">
          <Badge tone={availabilityTone[machine.availability]} size="sm">
            {availabilityLabel[machine.availability]}
          </Badge>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        {category && (
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-700">
            {category.singular}
          </p>
        )}

        <h3 className="mt-1 text-base font-bold leading-snug text-ink-900">
          {/* El enlace cubre toda la tarjeta, pero el texto accesible es el nombre. */}
          <Link href={`/maquina/${machine.slug}`} className="before:absolute before:inset-0">
            {machine.name}
          </Link>
        </h3>

        <p className="mt-1 text-sm text-steel-500">
          {machine.brand} · {machine.model}
          {machine.year ? ` · ${machine.year}` : ""}
        </p>

        <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-steel-600">
          <IconPin size={15} className="shrink-0 text-steel-400" />
          <span className="truncate">
            {machine.area}
            {location ? `, ${location.name}` : ""}
          </span>
        </p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {machine.operatorAvailable && (
            <Badge tone="brand" size="sm">
              <IconOperator size={13} />
              Con operador
            </Badge>
          )}
          {machine.transportAvailable && (
            <Badge tone="brand" size="sm">
              <IconTruck size={13} />
              Con transporte
            </Badge>
          )}
        </div>

        <div className="mt-auto pt-4">
          <RatingStars
            rating={machine.rating}
            count={machine.reviewCount}
            size="sm"
            emptyLabel="Aún sin reseñas"
          />

          <div className="mt-2 flex items-end justify-between gap-3 border-t border-steel-100 pt-3">
            <div className="min-w-0">
              {price.amount ? (
                <>
                  <p className="text-lg font-extrabold leading-none text-ink-900">
                    {price.amount}
                    <span className="ml-0.5 text-sm font-semibold text-steel-500">
                      {price.unit}
                    </span>
                  </p>
                  <p className="mt-1 text-xs text-steel-500">
                    Precio {pricingUnitLabel[machine.pricingUnit]}
                    {machine.isDemo ? " (DEMO)" : ""}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-base font-bold leading-none text-ink-900">
                    Consultar precio
                  </p>
                  <p className="mt-1 text-xs text-steel-500">
                    El propietario cotiza según el trabajo
                  </p>
                </>
              )}
            </div>
            <span className="shrink-0 text-sm font-bold text-brand-700 group-hover:underline">
              Ver detalles
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
