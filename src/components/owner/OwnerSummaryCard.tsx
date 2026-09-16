import Link from "next/link";
import type { OwnerProfile } from "@/lib/types";
import { locationsById } from "@/lib/data/locations";
import { formatMonthYear, pluralize } from "@/lib/format";
import { RatingStars } from "@/components/reviews/RatingStars";
import { VerificationBadge } from "@/components/owner/VerificationBadge";
import { DemoBadge } from "@/components/common/Demo";
import { IconArrowRight, IconPin } from "@/components/ui/Icon";

export function OwnerSummaryCard({ owner }: { owner: OwnerProfile }) {
  const location = locationsById.get(owner.locationId);
  const initials = owner.businessName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div className="rounded-2xl border border-steel-200 bg-white p-5">
      <h2 className="text-sm font-bold uppercase tracking-wider text-steel-500">
        Propietario
      </h2>

      <div className="mt-4 flex items-start gap-3.5">
        <span
          aria-hidden="true"
          className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-ink-900 text-base font-extrabold text-volt-400"
        >
          {initials}
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/propietario/${owner.slug}`}
              className="text-base font-bold text-ink-900 hover:text-brand-700 hover:underline"
            >
              {owner.businessName}
            </Link>
            {owner.isDemo && <DemoBadge size="sm" />}
          </div>
          <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-steel-600">
            <IconPin size={14} className="text-steel-400" />
            {owner.area ? `${owner.area}, ` : ""}
            {location?.name ?? "Perú"}
          </p>
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-steel-100 pt-4 text-sm">
        <div>
          <dt className="text-xs text-steel-500">En MaquiFly desde</dt>
          <dd className="font-semibold text-ink-900">
            {formatMonthYear(owner.memberSince)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-steel-500">Publicaciones</dt>
          <dd className="font-semibold text-ink-900">
            {pluralize(owner.machineCount, "máquina", "máquinas", "Ninguna")}
          </dd>
        </div>
      </dl>

      <div className="mt-4 border-t border-steel-100 pt-4">
        <RatingStars
          rating={owner.rating}
          count={owner.reviewCount}
          emptyLabel="Sin reseñas todavía"
        />
        <div className="mt-3">
          <VerificationBadge status={owner.verificationStatus} withHelp />
        </div>
      </div>

      <Link
        href={`/propietario/${owner.slug}`}
        className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-brand-700 hover:underline"
      >
        Ver perfil y sus máquinas
        <IconArrowRight size={16} />
      </Link>
    </div>
  );
}
