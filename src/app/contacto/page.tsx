import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import { platformWhatsappUrl } from "@/lib/whatsapp";
import { ContactForm } from "@/components/contact/ContactForm";
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

            <div className="mt-8">
              <ContactForm />
            </div>
          </div>

          <aside className="flex flex-col gap-4 lg:pt-16">
            <div className="rounded-2xl border border-steel-200 bg-white p-5">
              <h2 className="text-base font-bold text-ink-900">
                El canal más rápido
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-steel-600">
                Si tu consulta es urgente, escríbenos por WhatsApp y te
                respondemos al toque.
              </p>
              <LinkButton
                href={platformWhatsappUrl("Consulta desde la web")}
                external
                variant="whatsapp"
                fullWidth
                className="mt-4"
              >
                <IconWhatsApp size={19} />
                Escribir por WhatsApp
              </LinkButton>
            </div>

            <div className="rounded-2xl border border-steel-200 bg-steel-50 p-5">
              <h2 className="text-sm font-bold uppercase tracking-wider text-steel-500">
                Datos de contacto
              </h2>
              <ul className="mt-4 flex flex-col gap-3 text-sm">
                <li className="flex items-center gap-2.5">
                  <IconMail size={17} className="shrink-0 text-steel-400" />
                  <a
                    href={`mailto:${siteConfig.contact.email}`}
                    className="font-medium text-ink-900 hover:text-brand-700 hover:underline"
                  >
                    {siteConfig.contact.email}
                  </a>
                </li>
                <li className="flex items-center gap-2.5">
                  <IconPin size={17} className="shrink-0 text-steel-400" />
                  <span className="text-steel-700">
                    {siteConfig.contact.city}, {siteConfig.contact.region}, Perú
                  </span>
                </li>
              </ul>
              {siteConfig.social.facebook && (
                <p className="mt-4 border-t border-steel-200 pt-4 text-sm text-steel-600">
                  Síguenos en{" "}
                  <a href={siteConfig.social.facebook} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-700 hover:underline">
                    Facebook
                  </a>
                  .
                </p>
              )}
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
