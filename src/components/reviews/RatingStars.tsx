import { IconStar } from "@/components/ui/Icon";

/**
 * REGLA CRÍTICA DEL PROYECTO
 * ---------------------------------------------------------------------------
 * Si no hay reseñas reales, este componente NO dibuja estrellas. Ni grises,
 * ni vacías, ni un "0.0". Devuelve un texto neutro.
 *
 * Es deliberado: una fila de estrellas vacías se lee igual que una mala
 * calificación, y una fila de estrellas de relleno es directamente mentira.
 */
export function RatingStars({
  rating,
  count,
  size = "md",
  emptyLabel = "Aún no hay reseñas",
  showCount = true,
  className = "",
}: {
  rating: number | null;
  count: number;
  size?: "sm" | "md" | "lg";
  emptyLabel?: string;
  showCount?: boolean;
  className?: string;
}) {
  const dims = { sm: 14, md: 17, lg: 22 }[size];
  const text = { sm: "text-xs", md: "text-sm", lg: "text-base" }[size];

  if (rating === null || count === 0) {
    return (
      <p className={`${text} text-steel-500 ${className}`}>{emptyLabel}</p>
    );
  }

  const rounded = Math.round(rating);

  return (
    <div
      className={`flex items-center gap-1.5 ${className}`}
      aria-label={`Calificación ${rating} de 5 según ${count} ${count === 1 ? "reseña" : "reseñas"}`}
    >
      <span className="flex" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((i) => (
          <IconStar
            key={i}
            size={dims}
            filled={i <= rounded}
            className={i <= rounded ? "text-warn-500" : "text-steel-300"}
          />
        ))}
      </span>
      <span className={`${text} font-bold text-ink-900`}>{rating.toFixed(1)}</span>
      {showCount && (
        <span className={`${text} text-steel-500`}>
          ({count} {count === 1 ? "reseña" : "reseñas"})
        </span>
      )}
    </div>
  );
}
