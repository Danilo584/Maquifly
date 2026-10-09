"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

/** Oculta la cabecera y el pie públicos dentro del panel (/admin). */
export function PublicOnly({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  return <>{children}</>;
}
