"use client";

import { formatPEN, planOrder, plans, type PlanId } from "@/lib/plans";
import { IconCheck } from "@/components/ui/Icon";

/**
 * Selector de plan para el registro y el perfil. Muestra lo esencial de
 * cada plan (de src/lib/plans.ts); el detalle completo está en /planes.
 */
export function PlanPicker({
  value,
  onChange,
  name = "plan",
}: {
  value: PlanId;
  onChange: (plan: PlanId) => void;
  name?: string;
}) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-1.5 text-sm font-semibold text-ink-900">Elige tu plan</legend>
      {planOrder.map((id) => {
        const p = plans[id];
        const inputId = `${name}-${id}`;
        const highlights = p.benefits.slice(0, 2);
        return (
          <label
            key={id}
            htmlFor={inputId}
            className="flex cursor-pointer items-start gap-3 rounded-xl border border-steel-200 bg-white p-3.5 transition-colors hover:border-steel-300 has-checked:border-brand-500 has-checked:bg-brand-50 has-checked:ring-2 has-checked:ring-brand-500/15"
          >
            <input
              id={inputId}
              type="radio"
              name={name}
              value={id}
              checked={value === id}
              onChange={() => onChange(id)}
              className="mt-1 size-4.5 shrink-0 accent-brand-600"
            />
            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-baseline justify-between gap-x-3">
                <span className="font-bold text-ink-900">{p.name}</span>
                <span className="text-sm font-extrabold text-ink-900">
                  {p.pricePEN === 0 ? "Gratis" : formatPEN(p.pricePEN)}
                  {p.pricePEN > 0 && <span className="font-semibold text-steel-500"> /mes</span>}
                </span>
              </span>
              <span className="block text-xs text-steel-500">{p.idealFor}</span>
              <span className="mt-1.5 flex flex-col gap-1">
                {highlights.map((b) => (
                  <span key={b} className="flex items-start gap-1.5 text-xs text-steel-700">
                    <IconCheck size={13} className="mt-0.5 shrink-0 text-ok-500" />
                    {b}
                  </span>
                ))}
              </span>
            </span>
          </label>
        );
      })}
      <p className="text-xs leading-relaxed text-steel-500">
        Los planes pagados se activan cuando verificamos tu pago. Mientras tanto publicas con Fly Start. Puedes cambiar de
        plan cuando quieras.
      </p>
    </fieldset>
  );
}

/** Lee el plan elegido al registrarse (guardado en los datos de la cuenta). */
export function planChoiceFrom(metadata: Record<string, unknown> | undefined): PlanId {
  const raw = metadata?.plan_choice;
  return raw === "plus" || raw === "pro" ? raw : "start";
}
