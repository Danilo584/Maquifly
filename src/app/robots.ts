import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

/**
 * Se declara estática para que también funcione con `output: export`
 * (npm run export), que es como se genera la vista previa del MVP.
 */
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/ingresar",
          // Los resultados con filtros generan muchas URLs casi idénticas.
          // El tráfico orgánico debe entrar por categorías y landings.
          "/maquinaria?",
        ],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  };
}
