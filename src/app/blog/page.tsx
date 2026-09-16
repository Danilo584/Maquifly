import type { Metadata } from "next";
import Link from "next/link";
import { sortedPosts } from "@/lib/data/blog";
import { categoriesBySlug } from "@/lib/data/categories";
import { formatDate } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Section } from "@/components/ui/Section";
import { Badge } from "@/components/ui/Badge";
import { IconArrowRight } from "@/components/ui/Icon";

export const metadata: Metadata = pageMetadata({
  title: "Blog — Guías sobre alquiler de maquinaria",
  description:
    "Guías prácticas sobre alquiler de maquinaria en Perú: cómo se forma el precio, con operador o sin operador, qué equipo necesita tu obra y qué revisar antes de alquilar.",
  path: "/blog",
});

export default function BlogIndexPage() {
  const [featured, ...rest] = sortedPosts;

  return (
    <>
      <section className="relative overflow-hidden bg-ink-950">
        <div className="grid-blueprint absolute inset-0" aria-hidden="true" />
        <div className="container-mf relative py-8 sm:py-12">
          <div className="[&_a]:text-ink-300 [&_a:hover]:text-volt-400 [&_span]:text-ink-100 [&_ol]:text-ink-400">
            <Breadcrumbs items={[{ label: "Inicio", href: "/" }, { label: "Blog" }]} />
          </div>
          <h1 className="mt-5 max-w-3xl text-3xl font-extrabold leading-tight text-white sm:text-4xl">
            Guías para alquilar maquinaria sin sorpresas
          </h1>
          <p className="mt-4 max-w-2xl text-[1.02rem] leading-relaxed text-ink-200">
            Respondemos las preguntas que la gente hace de verdad antes de
            alquilar un equipo. Sin cifras inventadas y sin relleno.
          </p>
        </div>
      </section>

      <Section tone="light">
        {featured && (
          <Link
            href={`/blog/${featured.slug}`}
            className="group grid gap-6 rounded-2xl border border-steel-200 bg-white p-6 transition-shadow hover:shadow-card-hover sm:p-8 lg:grid-cols-[1.4fr_1fr] lg:items-center"
          >
            <div>
              <Badge tone="brand">Último artículo</Badge>
              <h2 className="mt-3 text-2xl font-extrabold leading-tight text-ink-900 group-hover:text-brand-800 sm:text-3xl">
                {featured.title}
              </h2>
              <p className="mt-3 text-[0.98rem] leading-relaxed text-steel-600">
                {featured.excerpt}
              </p>
              <p className="mt-4 text-sm text-steel-500">
                {formatDate(featured.publishedAt)} · {featured.readingMinutes} min de
                lectura
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-brand-700">
                Leer artículo <IconArrowRight size={16} />
              </span>
            </div>
            <div className="hidden lg:block">
              <div className="grid-blueprint flex aspect-[4/3] items-end rounded-xl bg-ink-900 p-6">
                <p className="font-display text-2xl font-extrabold leading-tight text-white">
                  Encuentra.
                  <br />
                  Alquila.
                  <br />
                  <span className="text-volt-400">Trabaja.</span>
                </p>
              </div>
            </div>
          </Link>
        )}

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((post) => (
            <article
              key={post.slug}
              className="group relative flex h-full flex-col rounded-2xl border border-steel-200 bg-white p-5 transition-shadow hover:shadow-card-hover"
            >
              <div className="flex flex-wrap gap-1.5">
                {post.categorySlugs.slice(0, 2).map((slug) => (
                  <Badge key={slug} tone="neutral" size="sm">
                    {categoriesBySlug.get(slug)?.name ?? slug}
                  </Badge>
                ))}
              </div>
              <h2 className="mt-3 text-lg font-bold leading-snug text-ink-900">
                <Link
                  href={`/blog/${post.slug}`}
                  className="before:absolute before:inset-0 group-hover:text-brand-800"
                >
                  {post.title}
                </Link>
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-steel-600">
                {post.excerpt}
              </p>
              <p className="mt-auto pt-4 text-xs text-steel-500">
                {formatDate(post.publishedAt)} · {post.readingMinutes} min
              </p>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}
