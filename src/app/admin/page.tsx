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
  return <AdminApp />;
}
