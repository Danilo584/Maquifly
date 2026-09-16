import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { LinkButton } from "@/components/ui/Button";
import { Callout } from "@/components/ui/Callout";
import { IconCheck, IconPlus, IconUser } from "@/components/ui/Icon";

export const metadata: Metadata = pageMetadata({
  title: "Iniciar sesión",
  description:
    "Las cuentas de usuario de MaquiFly están en desarrollo. Mientras tanto puedes publicar tu maquinaria sin necesidad de crear una cuenta.",
  path: "/ingresar",
  noIndex: true,
});

/**
 * No se muestra un formulario de inicio de sesión que no autentica a nadie.
 * Un campo de contraseña falso invita a que la gente escriba contraseñas
 * reales en un formulario que no las protege: es un riesgo de seguridad, no
 * un detalle de diseño.
 */
export default function SignInPage() {
  return (
    <>
      <div className="border-b border-steel-200 bg-steel-50">
        <div className="container-mf py-3">
          <Breadcrumbs
            items={[{ label: "Inicio", href: "/" }, { label: "Iniciar sesión" }]}
          />
        </div>
      </div>

      <div className="container-mf py-14 sm:py-20">
        <div className="mx-auto max-w-lg">
          <div className="rounded-2xl border border-steel-200 bg-white p-7 text-center sm:p-9">
            <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-ink-900 text-volt-400">
              <IconUser size={26} />
            </span>
            <h1 className="mt-5 text-2xl font-extrabold text-ink-900">
              Las cuentas todavía no están activas
            </h1>
            <p className="mt-3 text-[0.95rem] leading-relaxed text-steel-600">
              Preferimos no mostrarte un formulario de inicio de sesión que no
              autentica nada. Cuando el sistema de cuentas esté conectado, este
              será el lugar para entrar.
            </p>

            <div className="mt-6 rounded-xl border border-steel-200 bg-steel-50 p-5 text-left">
              <p className="text-sm font-bold text-ink-900">
                Qué podrás hacer con tu cuenta
              </p>
              <ul className="mt-3 flex flex-col gap-2">
                {[
                  "Gestionar tus publicaciones y su disponibilidad.",
                  "Ver cuántas personas vieron y contactaron cada máquina.",
                  "Responder públicamente a las reseñas que recibas.",
                  "Solicitar la verificación de propietario.",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <IconCheck size={15} className="mt-0.5 shrink-0 text-ok-500" />
                    <span className="text-sm leading-relaxed text-steel-700">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <LinkButton href="/publicar" variant="primary" size="lg" fullWidth>
                <IconPlus size={19} />
                Publicar sin cuenta
              </LinkButton>
              <LinkButton href="/contacto" variant="secondary" fullWidth>
                Escribir a MaquiFly
              </LinkButton>
            </div>
          </div>

          <Callout tone="warn" className="mt-5" title="Nota técnica">
            La autenticación prevista es Supabase Auth con verificación por
            número de teléfono (el mismo que se usa para WhatsApp), porque en
            este mercado el teléfono identifica mejor que el correo. Las
            políticas de acceso a datos por fila (RLS) ya están escritas en{" "}
            <code>supabase/schema.sql</code>.
          </Callout>
        </div>
      </div>
    </>
  );
}
