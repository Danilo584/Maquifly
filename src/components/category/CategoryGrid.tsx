import Link from "next/link";
import type { Category } from "@/lib/types";
import { CategoryIcon, IconArrowRight } from "@/components/ui/Icon";
import { pluralize } from "@/lib/format";

export function CategoryCard({
  category,
  count,
  showDescription = false,
}: {
  category: Category;
  count?: number;
  showDescription?: boolean;
}) {
  return (
    <Link
      href={`/maquinaria/${category.slug}`}
      className="group flex items-center gap-3 rounded-xl border border-steel-200 bg-white p-3 sm:flex-col sm:items-start sm:gap-0 sm:p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-card-hover"
    >
      <span className="flex size-10 shrink-0 items-center sm:size-11 justify-center rounded-lg bg-ink-900 text-volt-400 transition-colors group-hover:bg-brand-700">
        <CategoryIcon name={category.icon} size={24} />
      </span>
      <span className="flex min-w-0 flex-col">
      <span className="text-[0.9rem] font-bold leading-snug text-ink-900 sm:mt-3.5 sm:text-[0.95rem]">
        {category.name}
      </span>
      {showDescription ? (
        <span className="mt-1.5 text-sm leading-relaxed text-steel-600">
          {category.shortDescription}
        </span>
      ) : null}
      <span className="mt-0.5 text-xs font-medium text-steel-500 sm:mt-2">
        {typeof count === "number"
          ? pluralize(count, "publicación", "publicaciones", "Aún sin publicaciones")
          : "Ver disponibles"}
      </span>
      </span>
      <span className="mt-3 hidden sm:inline-flex items-center gap-1 text-sm font-bold text-brand-700 opacity-0 transition-opacity group-hover:opacity-100">
        Ver <IconArrowRight size={15} />
      </span>
    </Link>
  );
}

export function CategoryGrid({
  items,
  counts,
  showDescription = false,
}: {
  items: Category[];
  counts?: Record<string, number>;
  showDescription?: boolean;
}) {
  return (
    <div className="grid grid-cols-1 gap-2 min-[400px]:grid-cols-2 sm:gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {items.map((category) => (
        <CategoryCard
          key={category.slug}
          category={category}
          count={counts?.[category.slug] ?? 0}
          showDescription={showDescription}
        />
      ))}
    </div>
  );
}
