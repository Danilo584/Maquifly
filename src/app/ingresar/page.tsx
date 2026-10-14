import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { AuthForm } from "@/components/account/AuthForm";

export const metadata: Metadata = pageMetadata({
  title: "Iniciar sesión",
  description:
    "Ingresa o crea tu cuenta de propietario en MaquiFly para publicar tu maquinaria, editarla y ver sus estadísticas.",
  path: "/ingresar",
  noIndex: true,
});

/**
 * Inicio de sesión real con Supabase Auth (correo + contraseña).
 * Las contraseñas nunca pasan por nuestro código de servidor: van directo a
 * Supabase, que las guarda cifradas.
 */
export default function SignInPage() {
  return (
    <>
      <div className="border-b border-steel-200 bg-steel-50">
        <div className="container-mf py-3">
          <Breadcrumbs items={[{ label: "Inicio", href: "/" }, { label: "Iniciar sesión" }]} />
        </div>
      </div>

      <div className="container-mf py-10 sm:py-16">
        <div className="mx-auto max-w-4xl">
          <AuthForm />
        </div>
      </div>
    </>
  );
}
