import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";
import { categories } from "@/lib/data/categories";
import { seoLandings } from "@/lib/data/seo-landings";
import { blogPosts } from "@/lib/data/blog";
import { repository } from "@/lib/repository";
import { catalogMachines as demoMachines, catalogOwners as demoOwners } from "@/lib/data/catalog";

/**
 * Sitemap generado desde los mismos datos que alimentan las páginas: no puede
 * quedar desactualizado al añadir una categoría o una landing.
 *
 * Se excluyen a propósito:
 *  - /maquinaria (resultados filtrados, marcados noindex)
 *  - las publicaciones y perfiles DEMO, que no deben aparecer en Google como
 *    si fueran maquinaria real disponible
 *  - /admin y /ingresar
 */
/**
 * Se declara estática para que también funcione con `output: export`
 * (npm run export), que es como se genera la vista previa del MVP.
 */
export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/categorias"), lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: absoluteUrl("/publicar"), lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: absoluteUrl("/propietarios"), lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: absoluteUrl("/planes"), lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: absoluteUrl("/empresas"), lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: absoluteUrl("/como-funciona"), lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/nosotros"), lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: absoluteUrl("/contacto"), lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: absoluteUrl("/blog"), lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: absoluteUrl("/terminos"), lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: absoluteUrl("/privacidad"), lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((category) => ({
    url: absoluteUrl(`/maquinaria/${category.slug}`),
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  const landingRoutes: MetadataRoute.Sitemap = seoLandings.map((landing) => ({
    url: absoluteUrl(`/${landing.slug}`),
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  const blogRoutes: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: absoluteUrl(`/blog/${post.slug}`),
    lastModified: new Date(post.updatedAt ?? post.publishedAt),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const demoMachineSlugs = new Set(
    demoMachines.filter((m) => m.isDemo).map((m) => m.slug),
  );
  const demoOwnerSlugs = new Set(demoOwners.filter((o) => o.isDemo).map((o) => o.slug));

  const machineSlugs = await repository.listMachineSlugs();
  const machineRoutes: MetadataRoute.Sitemap = machineSlugs
    .filter((slug) => !demoMachineSlugs.has(slug))
    .map((slug) => ({
      url: absoluteUrl(`/maquina/${slug}`),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

  const ownerSlugs = await repository.listOwnerSlugs();
  const ownerRoutes: MetadataRoute.Sitemap = ownerSlugs
    .filter((slug) => !demoOwnerSlugs.has(slug))
    .map((slug) => ({
      url: absoluteUrl(`/propietario/${slug}`),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    }));

  return [
    ...staticRoutes,
    ...landingRoutes,
    ...categoryRoutes,
    ...machineRoutes,
    ...ownerRoutes,
    ...blogRoutes,
  ];
}
