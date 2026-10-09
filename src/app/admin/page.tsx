import type { Metadata } from "next";
import { AdminApp } from "@/components/admin/AdminApp";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Panel de control",
  description: "Panel de administración de MaquiFly.",
  path: "/admin",
  noIndex: true,
});

export default function AdminPage() {
  return (
    <div className="min-h-[70vh] bg-steel-50">
      <div className="container-mf py-8 sm:py-10">
        <h1 className="text-2xl font-extrabold text-ink-900 sm:text-3xl">Panel de control</h1>
        <p className="mt-1 text-sm text-steel-600">Mensajes, publicaciones, propietarios, pagos y reportes de MaquiFly.</p>
        <div className="mt-6">
          <AdminApp />
        </div>
      </div>
    </div>
  );
}
