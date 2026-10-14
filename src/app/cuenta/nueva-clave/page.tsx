import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { NewPasswordForm } from "@/components/account/NewPasswordForm";

export const metadata: Metadata = pageMetadata({
  title: "Nueva contraseña",
  description: "Crea una contraseña nueva para tu cuenta de MaquiFly.",
  path: "/cuenta/nueva-clave",
  noIndex: true,
});

export default function NewPasswordPage() {
  return (
    <div className="container-mf py-12 sm:py-16">
      <div className="mx-auto max-w-md">
        <NewPasswordForm />
      </div>
    </div>
  );
}
