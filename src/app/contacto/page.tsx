import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import { platformWhatsappUrl } from "@/lib/whatsapp";
import { ContactForm } from "@/components/contact/ContactForm";
import { EmailLink } from "@/components/common/EmailLink";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { LinkButton } from "@/components/ui/Button";
import { IconMail, IconPin, IconWhatsApp } from "@/components/ui/Icon";

export const metadata: Metadata = pageMetadata({
  title: "Contacto",
  description:
    "Escríbenos si buscas maquinaria y no la encuentras, si quieres publicar tu equipo o si detectaste un problema en una publicación.",
  path: "/contacto",
});

export default function ContactPage() {
  return (
    <>
      <div className="border-b border-steel-200 bg-steel-50">
        <div className="container-mf py-3">
          <Breadcrumbs items={[{ label: "Inicio", href: "/" }, { label: "Contacto" }]} />
        </div>
      </div>

      <div className="container-mf py-10 sm:py-14">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
          <div>
            <h1 className="text-3xl font-extrabold text-ink-900 sm:text-4xl">
              Hablemos
            </h1>
            <p className="mt-4 max-w-xl text-[1.02rem] leading-relaxed text-steel-600">
              MaquiFly está empezando, así que leemos absolutamente todo lo que
              llega. Si buscas una máquina que todavía no está publicada,
              escríbenos: muchas veces conocemos a alguien que la tiene.
            </p>

            {/* Canales directos: sin formularios de por medio */}
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <LinkButton
                href={platformWhatsappUrl("Hola MaquiFly, les escribo desde la web.")}
                external
                variant="whatsapp"
                size="lg"
                fullWidth
              >
                <IconWhatsApp size={20} />
                Escribir por WhatsApp
              </LinkButton>
              <EmailLink className="inline-flex h-13 w-full items-center justify-center gap-2 rounded-lg bg-ink-900 px-6 text-base font-semibold sm:h-14 sm:text-[1.05rem] text-white transition-colors hover:bg-ink-800">
                <IconMail size={20} />
                Enviar un correo
              </EmailLink>
            </div>
            <p className="mt-2.5 text-sm text-steel-500">
              WhatsApp {"+51 933 407 807"} · {siteConfig.contact.email}
            </p>

            <div className="mt-10 border-t border-steel-200 pt-8">
              <h2 className="text-lg font-bold text-ink-900">
                ¿Prefieres dejarnos un mensaje aquí?
              </h2>
              <p className="mt-1 text-sm text-steel-600">
                Opcional. Lo recibimos al instante y te respondemos por el medio que nos indiques.
              </p>
              <div className="mt-5">
                <ContactForm />
              </div>
            </div>
          </div>

          <aside className="flex flex-col gap-4 lg:pt-24">
            <div className="rounded-2xl border border-steel-200 bg-steel-50 p-5">
              <h2 className="text-sm font-bold uppercase tracking-wider text-steel-500">
                Datos de contacto
              </h2>
              <ul className="mt-4 flex flex-col gap-3 text-sm">
                <li className="flex items-center gap-2.5">
                  <IconMail size={17} className="shrink-0 text-steel-400" />
                  <EmailLink className="font-medium text-ink-900 hover:text-brand-700 hover:underline" />
                </li>
                <li className="flex items-center gap-2.5">
                  <IconPin size={17} className="shrink-0 text-steel-400" />
                  <span className="text-steel-700">
                    {siteConfig.contact.city}, {siteConfig.contact.region}, Perú
                  </span>
                </li>
              </ul>
              {(() => {
                const nets = [
                  { label: "Facebook", href: siteConfig.social.facebook },
                  { label: "Instagram", href: siteConfig.social.instagram },
                  { label: "TikTok", href: siteConfig.social.tiktok },
                ].filter((n) => n.href);
                if (nets.length === 0) return null;
                return (
                  <p className="mt-4 border-t border-steel-200 pt-4 text-sm text-steel-600">
                    Síguenos en{" "}
                    {nets.map((n, i) => (
                      <span key={n.label}>
                        {i > 0 && (i === nets.length - 1 ? " y " : ", ")}
                        <a href={n.href} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-700 hover:underline">
                          {n.label}
                        </a>
                      </span>
                    ))}
                    .
                  </p>
                );
              })()}
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
