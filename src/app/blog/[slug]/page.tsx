import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { blogPosts, getPost, sortedPosts } from "@/lib/data/blog";
import { categoriesBySlug } from "@/lib/data/categories";
import { formatDate } from "@/lib/format";
import { articleJsonLd, pageMetadata } from "@/lib/seo";

import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Badge } from "@/components/ui/Badge";
import { Callout } from "@/components/ui/Callout";
import { LinkButton } from "@/components/ui/Button";
import { JsonLd } from "@/components/seo/JsonLd";
import { IconArrowRight, IconSearch } from "@/components/ui/Icon";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Artículo no encontrado" };

  return {
    ...pageMetadata({
      title: post.title,
      description: post.excerpt,
      path: `/blog/${post.slug}`,
      keywords: post.keywords,
    }),
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt ?? post.publishedAt,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const related = sortedPosts.filter((p) => p.slug !== post.slug).slice(0, 3);
  const relatedCategories = post.categorySlugs
    .map((s) => categoriesBySlug.get(s))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  return (
    <>
      <div className="border-b border-steel-200 bg-steel-50">
        <div className="container-mf py-3">
          <Breadcrumbs
            items={[
              { label: "Inicio", href: "/" },
              { label: "Blog", href: "/blog" },
              { label: post.title },
            ]}
          />
        </div>
      </div>

      <div className="container-mf py-8 sm:py-12">
        <div className="grid gap-10 lg:grid-cols-[1fr_18rem] lg:gap-14">
          <article className="min-w-0 max-w-2xl">
            <div className="flex flex-wrap gap-1.5">
              {relatedCategories.map((category) => (
                <Link key={category.slug} href={`/maquinaria/${category.slug}`}>
                  <Badge tone="brand" size="sm">
                    {category.name}
                  </Badge>
                </Link>
              ))}
            </div>

            <h1 className="mt-4 text-3xl font-extrabold leading-tight text-ink-900 sm:text-4xl">
              {post.title}
            </h1>

            <p className="mt-4 text-lg leading-relaxed text-steel-600">
              {post.excerpt}
            </p>

            <p className="mt-5 border-b border-steel-200 pb-5 text-sm text-steel-500">
              Publicado el {formatDate(post.publishedAt)} · {post.readingMinutes} min
              de lectura · Equipo MaquiFly
            </p>

            <div className="mt-7 flex flex-col gap-5">
              {post.body.map((block, index) => {
                switch (block.type) {
                  case "h2":
                    return (
                      <h2
                        key={index}
                        className="mt-4 text-2xl font-extrabold text-ink-900"
                      >
                        {block.text}
                      </h2>
                    );
                  case "h3":
                    return (
                      <h3 key={index} className="mt-2 text-lg font-bold text-ink-900">
                        {block.text}
                      </h3>
                    );
                  case "ul":
                    return (
                      <ul key={index} className="flex flex-col gap-2.5 pl-1">
                        {block.items.map((item) => (
                          <li key={item} className="flex gap-3">
                            <span
                              aria-hidden="true"
                              className="mt-2.5 size-1.5 shrink-0 rounded-full bg-volt-500"
                            />
                            <span className="text-[1.02rem] leading-relaxed text-steel-700">
                              {item}
                            </span>
                          </li>
                        ))}
                      </ul>
                    );
                  case "ol":
                    return (
                      <ol key={index} className="flex flex-col gap-3">
                        {block.items.map((item, i) => (
                          <li key={item} className="flex gap-3">
                            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-ink-900 text-xs font-bold text-volt-400">
                              {i + 1}
                            </span>
                            <span className="text-[1.02rem] leading-relaxed text-steel-700">
                              {item}
                            </span>
                          </li>
                        ))}
                      </ol>
                    );
                  case "note":
                    return (
                      <Callout key={index} tone="info">
                        {block.text}
                      </Callout>
                    );
                  case "p":
                  default:
                    return (
                      <p
                        key={index}
                        className="text-[1.02rem] leading-relaxed text-steel-700"
                      >
                        {block.text}
                      </p>
                    );
                }
              })}
            </div>

            <div className="mt-10 rounded-2xl border border-steel-200 bg-steel-50 p-6">
              <h2 className="text-lg font-bold text-ink-900">
                ¿Buscas el equipo del que habla este artículo?
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-steel-600">
                Revisa la maquinaria publicada en MaquiFly y contacta
                directamente al propietario.
              </p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <LinkButton
                  href={
                    relatedCategories[0]
                      ? `/maquinaria/${relatedCategories[0].slug}`
                      : "/maquinaria"
                  }
                  variant="primary"
                  size="sm"
                >
                  <IconSearch size={17} />
                  Ver equipos disponibles
                </LinkButton>
                <LinkButton href="/publicar" variant="secondary" size="sm">
                  Publicar mi maquinaria
                </LinkButton>
              </div>
            </div>
          </article>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <h2 className="text-sm font-bold uppercase tracking-wider text-steel-500">
              Seguir leyendo
            </h2>
            <ul className="mt-4 flex flex-col gap-4">
              {related.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={`/blog/${item.slug}`}
                    className="group block rounded-xl border border-steel-200 bg-white p-4 transition-colors hover:border-brand-300"
                  >
                    <p className="text-sm font-bold leading-snug text-ink-900 group-hover:text-brand-800">
                      {item.title}
                    </p>
                    <p className="mt-1.5 text-xs text-steel-500">
                      {item.readingMinutes} min de lectura
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/blog"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-brand-700 hover:underline"
            >
              Ver todos los artículos <IconArrowRight size={16} />
            </Link>
          </aside>
        </div>
      </div>

      <JsonLd
        data={articleJsonLd({
          title: post.title,
          description: post.excerpt,
          path: `/blog/${post.slug}`,
          publishedAt: post.publishedAt,
          updatedAt: post.updatedAt,
        })}
      />
    </>
  );
}
