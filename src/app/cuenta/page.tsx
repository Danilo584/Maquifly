import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { AccountApp } from "@/components/account/AccountApp";

export const metadata: Metadata = pageMetadata({
  title: "Mi cuenta",
  description: "Gestiona tus máquinas, tu plan y tus estadísticas en MaquiFly.",
  path: "/cuenta",
  noIndex: true,
});

export default function AccountPage() {
  return <AccountApp />;
}
