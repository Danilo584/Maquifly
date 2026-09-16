import type { Metadata } from "next";
import { AdminPanel } from "@/components/admin/AdminPanel";
import { repository } from "@/lib/repository";
import { demoMachines } from "@/lib/data/demo-machines";
import { pageMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export const metadata: Metadata = pageMetadata({
  title: "Panel de administración",
  description: "Esqueleto del panel de moderación de MaquiFly.",
  path: "/admin",
  noIndex: true,
});

export default async function AdminPage() {
  const owners = await repository.listOwners();

  return (
    <>
      <div className="border-b border-steel-200 bg-steel-50">
        <div className="container-mf py-3">
          <Breadcrumbs
            items={[{ label: "Inicio", href: "/" }, { label: "Administración" }]}
          />
        </div>
      </div>

      <div className="container-mf py-8 sm:py-10">
        <h1 className="text-2xl font-extrabold text-ink-900 sm:text-3xl">
          Panel de administración
        </h1>
        <p className="mt-2 max-w-2xl text-[0.95rem] leading-relaxed text-steel-600">
          Desde aquí se moderarán publicaciones, propietarios, reseñas y
          reportes. Esta versión muestra la estructura y los datos disponibles
          hoy.
        </p>

        <div className="mt-8">
          <AdminPanel machines={demoMachines} owners={owners} />
        </div>
      </div>
    </>
  );
}
