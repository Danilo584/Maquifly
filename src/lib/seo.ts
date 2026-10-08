import type { Metadata } from "next";
import { absoluteUrl, siteConfig } from "@/lib/site";
import type { Machine, OwnerProfile } from "@/lib/types";
import { locationsById } from "@/lib/data/locations";
import { categoriesById } from "@/lib/data/categories";
import { formatMoney, pricingUnitLabel } from "@/lib/format";

/**
 * SEO
 * ---------------------------------------------------------------------------
 * Todas las páginas construyen su metadata con `pageMetadata`, así que el
 * canonical, el Open Graph y el título siguen siempre el mismo patrón y no se
 * olvidan en una página nueva.
 *
 * Importante: el marcado estructurado describe lo que la página realmente
 * contiene. No se emite `aggregateRating` si no hay reseñas reales — además
 * de ser deshonesto, Google penaliza los datos estructurados que no
 * corresponden al contenido visible.
 */

const TITLE_SUFFIX = `${siteConfig.name} — Alquiler de maquinaria en Perú`;

export function pageMetadata({
  title,
  description,
  path,
  noIndex = false,
  images,
  keywords,
}: {
  title: string;
  description: string;
  path: string;
  noIndex?: boolean;
  images?: string[];
  keywords?: string[];
}): Metadata {
  const url = absoluteUrl(path);
  const ogImages = images ?? ["/og-default.png"];

  return {
    title,
    description,
    ...(keywords?.length ? { keywords } : {}),
    alternates: { canonical: url },
    robots: noIndex
      ? { index: false, follow: true }
      : {
          index: true,
          follow: true,
          googleBot: { index: true, follow: true, "max-image-preview": "large" },
        },
    openGraph: {
      type: "website",
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      url,
      title,
      description,
      images: ogImages.map((src) => ({
        url: absoluteUrl(src),
        width: 1200,
        height: 630,
        alt: title,
      })),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImages.map((src) => absoluteUrl(src)),
    },
  };
}

export function titleWithBrand(title: string): string {
  return `${title} | ${siteConfig.name}`;
}

export { TITLE_SUFFIX };

/* --------------------------------------------------------------------------
   Datos estructurados (schema.org)
   -------------------------------------------------------------------------- */

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    logo: absoluteUrl("/icon.svg"),
    description: siteConfig.description,
    email: siteConfig.contact.email,
    areaServed: { "@type": "Country", name: "Perú" },
    address: {
      "@type": "PostalAddress",
      addressLocality: siteConfig.contact.city,
      addressRegion: siteConfig.contact.region,
      addressCountry: siteConfig.contact.country,
    },
    // Solo se listan las redes que existen de verdad (las vacías se filtran).
    sameAs: Object.values(siteConfig.social).filter(Boolean),
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    inLanguage: siteConfig.lang,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteConfig.url}/maquinaria?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * Una publicación se describe como `Product` con `offers`. Se emite
 * `aggregateRating` únicamente cuando hay reseñas reales.
 */
export function machineJsonLd(machine: Machine, owner: OwnerProfile | null) {
  const location = locationsById.get(machine.locationId);
  const category = categoriesById.get(machine.categoryId);

  const offer: Record<string, unknown> = {
    "@type": "Offer",
    url: absoluteUrl(`/maquina/${machine.slug}`),
    priceCurrency: machine.currency,
    availability:
      machine.availability === "unavailable"
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/InStock",
    ...(owner ? { seller: { "@type": "Organization", name: owner.businessName } } : {}),
  };

  if (machine.price !== null) {
    offer.price = machine.price;
    offer.description = `${formatMoney(machine.price, machine.currency)} ${pricingUnitLabel[machine.pricingUnit]}`;
  }

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: machine.name,
    sku: machine.reference,
    brand: { "@type": "Brand", name: machine.brand },
    model: machine.model,
    category: category?.name,
    description: machine.description,
    image: machine.images.map((img) => absoluteUrl(img.url)),
    offers: offer,
    ...(machine.rating !== null && machine.reviewCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: machine.rating,
            reviewCount: machine.reviewCount,
          },
        }
      : {}),
    ...(location
      ? {
          areaServed: {
            "@type": "City",
            name: location.name,
            address: {
              "@type": "PostalAddress",
              addressLocality: location.name,
              addressRegion: location.region,
              addressCountry: "PE",
            },
          },
        }
      : {}),
  };
}

export function ownerJsonLd(owner: OwnerProfile) {
  const location = locationsById.get(owner.locationId);
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: owner.businessName,
    description: owner.description,
    url: absoluteUrl(`/propietario/${owner.slug}`),
    address: {
      "@type": "PostalAddress",
      addressLocality: location?.name ?? "Piura",
      addressRegion: location?.region ?? "Piura",
      addressCountry: "PE",
    },
    ...(owner.rating !== null && owner.reviewCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: owner.rating,
            reviewCount: owner.reviewCount,
          },
        }
      : {}),
  };
}

export function faqJsonLd(items: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

export function articleJsonLd({
  title,
  description,
  path,
  publishedAt,
  updatedAt,
}: {
  title: string;
  description: string;
  path: string;
  publishedAt: string;
  updatedAt?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    inLanguage: siteConfig.lang,
    mainEntityOfPage: absoluteUrl(path),
    datePublished: publishedAt,
    dateModified: updatedAt ?? publishedAt,
    author: { "@type": "Organization", name: siteConfig.name },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      logo: { "@type": "ImageObject", url: absoluteUrl("/icon.svg") },
    },
  };
}
