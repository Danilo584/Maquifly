import type { NextConfig } from "next";

/**
 * MaquiFly — configuración de Next.js
 *
 * Decisión técnica: el proyecto corre por defecto como app Next.js completa
 * (SSR/SSG + Route Handlers), que es lo que necesitarás cuando conectes
 * Supabase. La variable STATIC_EXPORT=1 genera además una exportación
 * estática para previsualizar o hospedar el MVP sin servidor.
 */
const isStaticExport = process.env.STATIC_EXPORT === "1";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  ...(isStaticExport
    ? {
        output: "export" as const,
        trailingSlash: true,
        images: { unoptimized: true },
      }
    : {}),

  images: {
    // Las fotos reales de las máquinas vivirán en Supabase Storage (o similar).
    // Se declara el patrón aquí para que next/image pueda optimizarlas.
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
    ],
    unoptimized: isStaticExport,
  },

  async headers() {
    if (isStaticExport) return [];
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self)",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
