import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

/**
 * Manifiesto para instalación en móvil.
 * La mayoría de usuarios de MaquiFly entra desde el celular, así que el sitio
 * se declara instalable desde el primer día.
 */
/**
 * Se declara estática para que también funcione con `output: export`
 * (npm run export), que es como se genera la vista previa del MVP.
 */
export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteConfig.name} — ${siteConfig.tagline}`,
    short_name: siteConfig.name,
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    background_color: "#071628",
    theme_color: "#071628",
    lang: siteConfig.lang,
    categories: ["business", "productivity"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
