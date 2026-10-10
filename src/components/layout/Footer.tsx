import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { siteConfig } from "@/lib/site";
import { activeLocations, upcomingLocations } from "@/lib/data/locations";
import { IconFacebook, IconMail, IconPin, IconWhatsApp } from "@/components/ui/Icon";

const columns = [
  {
    title: "Marketplace",
    links: [
      { href: "/maquinaria", label: "Buscar maquinaria" },
      { href: "/categorias", label: "Categorías" },
      { href: "/alquiler-maquinaria-piura", label: "Alquiler en Piura" },
      { href: "/como-funciona", label: "Cómo funciona" },
      { href: "/blog", label: "Blog" },
    ],
  },
  {
    title: "Propietarios",
    links: [
      { href: "/publicar", label: "Publicar maquinaria" },
      { href: "/planes", label: "Planes y precios" },
      { href: "/planes#fundadores", label: "Programa Socio Fundador" },
      { href: "/planes#destacados", label: "Destacados Express" },
      { href: "/empresas", label: "Para empresas" },
    ],
  },
  {
    title: "MaquiFly",
    links: [
      { href: "/nosotros", label: "Sobre MaquiFly" },
      { href: "/propietarios", label: "Por qué publicar aquí" },
      { href: "/como-funciona#preguntas", label: "Preguntas frecuentes" },
      { href: "/contacto", label: "Contacto" },
    ],
  },
];

const legalLinks = [
  { href: "/terminos", label: "Términos y condiciones" },
  { href: "/privacidad", label: "Política de privacidad" },
];

/** Formatea 51933407807 → +51 933 407 807 */
function prettyPhone(raw: string) {
  const d = raw.replace(/\D/g, "");
  const local = d.startsWith("51") ? d.slice(2) : d;
  return `+51 ${local.replace(/(\d{3})(\d{3})(\d{3})/, "$1 $2 $3")}`;
}

export function Footer() {
  const year = new Date().getFullYear();
  const wa = siteConfig.contact.whatsapp;
  const social = [
    { key: "facebook", label: "Facebook", href: siteConfig.social.facebook, Icon: IconFacebook },
  ].filter((n) => Boolean(n.href));

  return (
    <footer className="grid-blueprint border-t border-white/10 bg-ink-950 text-ink-200">
      <div className="container-mf py-10 sm:py-14">
        <div className="grid grid-cols-2 gap-x-6 gap-y-9 lg:grid-cols-12 lg:gap-10">
          {/* Marca */}
          <div className="col-span-2 lg:col-span-3">
            <Logo tone="dark" size="md" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-300">
              El marketplace de maquinaria para alquiler en el norte del Perú.
              Conectamos a quien la necesita con quien la tiene.
            </p>
            <p className="mt-3 text-sm font-bold text-volt-400">
              {siteConfig.taglineSecondary}
            </p>
            {social.length > 0 && (
              <ul className="mt-5 flex gap-2.5" aria-label="Redes sociales">
                {social.map((n) => (
                  <li key={n.key}>
                    <a
                      href={n.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`MaquiFly en ${n.label}`}
                      className="flex size-10 items-center justify-center rounded-full border border-white/15 text-ink-200 transition-colors hover:border-volt-400 hover:text-volt-400"
                    >
                      <n.Icon size={18} />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Columnas de enlaces */}
          {columns.map((column) => (
            <div key={column.title} className="lg:col-span-2">
              <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-white">
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

          {/* Contacto */}
          <div className="col-span-2 lg:col-span-3">
            <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-white">
              ¿Hablamos?
            </h2>
            <ul className="mt-4 flex flex-col gap-3 text-sm">
              <li>
                <a
                  href={`https://wa.me/${wa}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-ink-200 transition-colors hover:text-volt-400"
                >
                  <IconWhatsApp size={16} className="shrink-0 text-volt-400" />
                  {prettyPhone(wa)}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${siteConfig.contact.email}`}
                  className="inline-flex items-center gap-2 text-ink-200 transition-colors hover:text-volt-400"
                >
                  <IconMail size={16} className="shrink-0 text-volt-400" />
                  {siteConfig.contact.email}
                </a>
              </li>
              <li className="inline-flex items-center gap-2 text-ink-300">
                <IconPin size={16} className="shrink-0 text-volt-400" />
                {siteConfig.contact.city}, Perú
              </li>
            </ul>
          </div>
        </div>

        {/* Franja de operación */}
        <div className="mt-10 grid gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm sm:grid-cols-3 sm:p-5">
          <div>
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-ink-400">
              Operación inicial
            </p>
            <p className="mt-1 text-white">
              {activeLocations.map((l) => l.name).join(", ")}, Perú
            </p>
          </div>
          <div>
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-ink-400">
              Próximamente
            </p>
            <p className="mt-1 text-ink-300">
              {upcomingLocations.map((l) => l.name).join(" · ")}
            </p>
          </div>
          <div>
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-ink-400">
              Moneda
            </p>
            <p className="mt-1 text-ink-300">Soles (S/) · dólares referenciales</p>
          </div>
        </div>

        {/* Legal */}
        <div className="mt-8 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs text-ink-400 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl space-y-1.5 leading-relaxed">
            <p>
              © {year} {siteConfig.legalName}. Todos los derechos reservados.
            </p>
            <p>
              MaquiFly es una plataforma de conexión: no es propietaria de las
              máquinas publicadas ni participa en el contrato de alquiler entre
              las partes.
            </p>
          </div>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {legalLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="transition-colors hover:text-volt-400">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
