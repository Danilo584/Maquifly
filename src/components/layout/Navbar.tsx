"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { Button, LinkButton } from "@/components/ui/Button";
import { IconClose, IconMenu, IconPlus, IconUser } from "@/components/ui/Icon";

const navLinks = [
  { href: "/maquinaria", label: "Buscar maquinaria" },
  { href: "/categorias", label: "Categorías" },
  { href: "/como-funciona", label: "Cómo funciona" },
  { href: "/propietarios", label: "Para propietarios" },
  { href: "/planes", label: "Planes" },
  { href: "/blog", label: "Blog" },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // El menú móvil se cierra al navegar: sin esto, el usuario aterriza en la
  // página nueva con el panel todavía encima.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Bloquea el scroll del fondo mientras el panel está abierto.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Escape cierra el panel (navegación por teclado).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

  return (
    <header className="sticky top-0 z-50 border-b border-steel-200 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="container-mf">
        <div className="flex h-16 items-center justify-between gap-4 lg:h-18">
          <Logo size="sm" />

          <nav aria-label="Navegación principal" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={isActive(link.href) ? "page" : undefined}
                    className={`inline-flex h-9 items-center rounded-lg px-3 text-[0.9rem] font-medium transition-colors ${
                      isActive(link.href)
                        ? "bg-brand-50 text-brand-800"
                        : "text-steel-700 hover:bg-steel-100 hover:text-ink-900"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <LinkButton href="/ingresar" variant="ghost" size="sm">
              <IconUser size={17} />
              Iniciar sesión
            </LinkButton>
            <LinkButton href="/publicar" variant="primary" size="sm">
              <IconPlus size={17} />
              Publicar maquinaria
            </LinkButton>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <LinkButton href="/publicar" variant="primary" size="sm">
              Publicar
            </LinkButton>
            <Button
              variant="secondary"
              size="sm"
              className="px-2.5"
              aria-expanded={open}
              aria-controls="menu-movil"
              aria-label={open ? "Cerrar menú" : "Abrir menú"}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <IconClose size={20} /> : <IconMenu size={20} />}
            </Button>
          </div>
        </div>
      </div>

      {open && (
        <div className="lg:hidden">
          <div
            className="fixed inset-0 top-16 z-40 bg-ink-950/40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div
            id="menu-movil"
            className="fixed inset-x-0 top-16 z-50 max-h-[calc(100dvh-4rem)] overflow-y-auto border-b border-steel-200 bg-white p-4 shadow-pop"
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-widest text-steel-500">
                Menú
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="px-2"
                aria-label="Cerrar menú"
                onClick={() => setOpen(false)}
              >
                <IconClose size={20} />
              </Button>
            </div>
            <nav aria-label="Navegación principal móvil">
              <ul className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      aria-current={isActive(link.href) ? "page" : undefined}
                      className={`flex h-12 items-center rounded-lg px-3 text-base font-semibold ${
                        isActive(link.href)
                          ? "bg-brand-50 text-brand-800"
                          : "text-ink-900 hover:bg-steel-100"
                      }`}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="mt-4 flex flex-col gap-2 border-t border-steel-200 pt-4">
              <LinkButton href="/publicar" variant="primary" size="md" fullWidth>
                <IconPlus size={18} />
                Publicar mi maquinaria
              </LinkButton>
              <LinkButton href="/ingresar" variant="secondary" size="md" fullWidth>
                <IconUser size={18} />
                Iniciar sesión
              </LinkButton>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
