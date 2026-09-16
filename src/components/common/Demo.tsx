import Link from "next/link";
import { Badge } from "@/components/ui/Badge";

/**
 * SEÑALIZACIÓN DEL CONTENIDO DE DEMOSTRACIÓN
 * ---------------------------------------------------------------------------
 * Regla del proyecto: nada ficticio puede parecer real. Estos componentes son
 * la única forma en que el catálogo DEMO aparece en pantalla, y se usan en
 * TODAS partes: tarjeta, ficha, perfil de propietario y resultados.
 */

export function DemoBadge({ size = "md" }: { size?: "sm" | "md" }) {
  return (
    <Badge
      tone="demo"
      size={size}
      title="Publicación de demostración: no corresponde a una máquina real disponible."
    >
      DEMO
    </Badge>
  );
}

/** Aviso a ancho completo. Se muestra sobre listados y fichas de demostración. */
export function DemoNotice({
  variant = "listing",
  className = "",
}: {
  variant?: "listing" | "catalog" | "owner";
  className?: string;
}) {
  const text = {
    listing:
      "Esta es una publicación de demostración. La máquina, el propietario, el precio y la disponibilidad no son reales, y el botón de WhatsApp no envía mensajes a ningún número.",
    catalog:
      "Estás viendo el catálogo de demostración de MaquiFly. Las publicaciones sirven para probar el buscador y los filtros: ninguna corresponde a una máquina real disponible.",
    owner:
      "Este perfil es de demostración. La empresa no existe y sus datos de contacto no son reales.",
  }[variant];

  return (
    <div
      role="note"
      className={`flex flex-col gap-2 rounded-xl border border-warn-500/40 bg-warn-50 px-4 py-3 text-sm text-steel-800 sm:flex-row sm:items-center sm:gap-3 ${className}`}
    >
      <span className="shrink-0">
        <DemoBadge />
      </span>
      <p className="leading-relaxed">
        {text}{" "}
        <Link
          href="/publicar"
          className="font-semibold text-brand-700 underline underline-offset-2 hover:text-brand-800"
        >
          Publica tu maquinaria real
        </Link>{" "}
        para reemplazar estos ejemplos.
      </p>
    </div>
  );
}
