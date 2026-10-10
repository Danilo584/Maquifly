import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { siteConfig } from "@/lib/site";
import { categories } from "@/lib/data/categories";
import { activeLocations, upcomingLocations } from "@/lib/data/locations";
import { IconMail, IconPin } from "@/components/ui/Icon";

const columns = [
  {
    title: "Explorar",
    links: [
      { href: "/maquinaria", label: "Buscar maquinaria" },
      { href: "/categorias", label: "Categorías" },
      { href: "/publicar", label: "Publicar maquinaria" },
      { href: "/alquiler-maquinaria-piura", label: "Alquiler de maquinaria en Piura" },
    ],
  },
  {
    title: "Información",
    links: [
      { href: "/como-funciona", label: "Cómo funciona" },
      { href: "/nosotros", label: "Sobre MaquiFly" },
      { href: "/propietarios", label: "Para propietarios" },
      { href: "/planes", label: "Planes y precios" },
      { href: "/empresas", label: "Para empresas" },
      { href: "/blog", label: "Blog" },
      { href: "/contacto", label: "Contacto" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/terminos", label: "Términos y condiciones" },
      { href: "/privacidad", label: "Política de privacidad" },
    ],
  },
];

const socialNetworks = [
  { key: "instagram", label: "Instagram" },
  { key: "facebook", label: "Facebook" },
  { key: "tiktok", label: "TikTok" },
  { key: "linkedin", label: "LinkedIn" },
] as const;

export function Footer() {
  const year = new Date().getFullYear();
  const topCategories = categories.slice(0, 8);
  const hasSocial = socialNetworks.some((n) => siteConfig.social[n.key]);

  return (
    <footer className="grid-blueprint border-t border-white/10 bg-ink-950 text-ink-200">
      <div className="container-mf py-10 sm:py-16">
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-12 md:gap-10">
          <div className="col-span-2 md:col-span-4">
            <Logo tone="dark" size="md" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-300">
              {siteConfig.tagline} Plataforma que conecta propietarios de
              maquinaria con proyectos que la necesitan.
            </p>
            <div className="mt-5 flex flex-col gap-2 text-sm">
              <span className="inline-flex items-center gap-2 text-ink-300">
                <IconPin size={16} className="text-volt-400" />
                {siteConfig.contact.city}, Perú
              </span>
              <a
                href={`mailto:${siteConfig.contact.email}`}
                className="inline-flex w-fit items-center gap-2 text-ink-200 hover:text-white"
              >
                <IconMail size={16} className="text-volt-400" />
                {siteConfig.contact.email}
              </a>
            </div>
          </div>

          {columns.map((column) => (
            <div key={column.title} className="md:col-span-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                {column.title}
              </h2>
              <ul className="mt-4 flex flex-col gap-2.5">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-ink-300 transition-colors hover:text-volt-400"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="hidden md:col-span-2 md:block">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              Categorías
            </h2>
            <ul className="mt-4 flex flex-col gap-2.5">
              {topCategories.map((category) => (
                <li key={category.slug}>
                  <Link
                    href={`/maquinaria/${category.slug}`}
                    className="text-sm text-ink-300 transition-colors hover:text-volt-400"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-white/10 pt-6 sm:mt-12 sm:pt-8">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-bold uppercase tracking-wider text-ink-400">
              Cobertura
            </p>
            <p className="text-sm text-ink-300">
              <span className="text-white">
                Activo en{" "}
                {activeLocations.map((l) => l.name).join(", ")}
              </span>
              <span className="text-ink-400">
                {" "}
                · Próximamente {upcomingLocations.map((l) => l.name).join(", ")}
              </span>
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4 border-t border-white/10 pt-6 sm:mt-8 sm:gap-5 sm:pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-relaxed text-ink-400">
            © {year} {siteConfig.legalName}. MaquiFly es una plataforma de
            conexión: no es propietaria de las máquinas publicadas ni participa
            en el contrato de alquiler entre las partes.
          </p>

          <div className="text-xs text-ink-400">
            {hasSocial ? (
              <ul className="flex gap-4">
                {socialNetworks
                  .filter((n) => siteConfig.social[n.key])
                  .map((n) => (
                    <li key={n.key}>
                      <a
                        href={siteConfig.social[n.key]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-volt-400"
                      >
                        {n.label}
                      </a>
                    </li>
                  ))}
              </ul>
            ) : (
              /* No se enlazan perfiles que todavía no existen. */
              <p className="max-w-xs">
                Redes sociales en preparación. Cuando existan, se enlazan aquí.
              </p>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
