"use client";

import type { ReactNode } from "react";
import { siteConfig } from "@/lib/site";

/**
 * Enlace al correo de MaquiFly que abre directo la redacción del correo.
 * - En celular usa mailto: (abre Gmail u otra app de correo).
 * - En computadora abre Gmail en una pestaña nueva, porque en muchas PCs
 *   mailto: no tiene programa de correo configurado y "no pasa nada".
 */
export function EmailLink({
  children,
  className,
  subject = "Consulta desde la web de MaquiFly",
}: {
  children?: ReactNode;
  className?: string;
  subject?: string;
}) {
  const to = siteConfig.contact.email;
  const mailto = `mailto:${to}?subject=${encodeURIComponent(subject)}`;
  const gmail = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&su=${encodeURIComponent(subject)}`;

  function onClick(event: React.MouseEvent<HTMLAnchorElement>) {
    const isTouch =
      typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
    if (isTouch) return; // el celular maneja mailto: bien
    event.preventDefault();
    window.open(gmail, "_blank", "noopener,noreferrer");
  }

  return (
    <a href={mailto} onClick={onClick} className={className}>
      {children ?? to}
    </a>
  );
}
