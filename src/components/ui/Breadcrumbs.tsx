import Link from "next/link";
import { IconChevronRight } from "@/components/ui/Icon";
import { absoluteUrl } from "@/lib/site";

export type Crumb = { label: string; href?: string };

/**
 * Migas de pan + BreadcrumbList de schema.org en el mismo componente:
 * la jerarquía que ve el usuario es exactamente la que lee Google.
 */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: absoluteUrl(item.href) } : {}),
    })),
  };

  return (
    <>
      <nav aria-label="Ruta de navegación" className="min-w-0">
        <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-steel-500">
          {items.map((item, index) => (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
              {index > 0 && (
                <IconChevronRight size={14} className="shrink-0 text-steel-400" />
              )}
              {item.href ? (
                <Link
                  href={item.href}
                  className="rounded hover:text-brand-700 hover:underline underline-offset-2"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="font-medium text-steel-700" aria-current="page">
                  {item.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
