import type { ReactNode } from "react";

/**
 * Estado vacío estándar.
 * MaquiFly muestra estados vacíos honestos en lugar de rellenar la pantalla
 * con cifras o contenido inventado.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  tone = "neutral",
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  secondaryAction?: ReactNode;
  tone?: "neutral" | "dashed";
}) {
  return (
    <div
      className={
        tone === "dashed"
          ? "flex flex-col items-center rounded-2xl border-2 border-dashed border-steel-300 bg-steel-50/60 px-6 py-12 text-center"
          : "flex flex-col items-center rounded-2xl border border-steel-200 bg-white px-6 py-12 text-center"
      }
    >
      {icon && (
        <span className="mb-4 flex size-12 items-center justify-center rounded-full bg-steel-100 text-steel-500">
          {icon}
        </span>
      )}
      <h3 className="text-lg font-bold text-ink-900">{title}</h3>
      {description && (
        <p className="mt-2 max-w-md text-sm leading-relaxed text-steel-600">
          {description}
        </p>
      )}
      {(action || secondaryAction) && (
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}
