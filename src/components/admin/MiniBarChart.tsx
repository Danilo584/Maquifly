"use client";

/**
 * Gráfico de barras simple (una sola serie): una por semana o por mes.
 * Barras finas con punta redondeada, separación de 2 px, cuadrícula tenue,
 * etiqueta solo en el valor más alto y el último, y tooltip al pasar el mouse.
 * Incluye una tabla oculta para lectores de pantalla.
 */
export function MiniBarChart({
  title,
  data,
  format = (v) => String(v),
  color = "var(--color-brand-600)",
  emptyText = "Aún sin datos",
}: {
  title: string;
  data: Array<{ label: string; value: number }>;
  format?: (v: number) => string;
  color?: string;
  emptyText?: string;
}) {
  const max = Math.max(0, ...data.map((d) => d.value));
  const total = data.reduce((s, d) => s + d.value, 0);
  const last = data[data.length - 1]?.value ?? 0;
  const maxIndex = data.findIndex((d) => d.value === max);
  const height = 120;

  return (
    <figure className="rounded-2xl border border-steel-200 bg-white p-4 sm:p-5">
      <figcaption className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-bold text-ink-900">{title}</span>
        <span className="text-xs font-semibold text-steel-500">
          Total: <span className="text-ink-900">{format(total)}</span>
        </span>
      </figcaption>
      <p className="mt-1 text-2xl font-extrabold text-ink-900">
        {format(last)}
        <span className="ml-1.5 text-xs font-semibold text-steel-500">último periodo</span>
      </p>

      {total === 0 ? (
        <div className="mt-3 flex h-[120px] items-center justify-center rounded-xl border border-dashed border-steel-200 text-xs text-steel-400">
          {emptyText}
        </div>
      ) : (
        <div className="relative mt-3" style={{ height }} role="img" aria-label={`${title}: total ${format(total)}`}>
          {/* cuadrícula tenue */}
          {[0.5, 1].map((f) => (
            <div key={f} className="absolute inset-x-0 border-t border-dashed border-steel-100" style={{ bottom: height * f - 1 }} />
          ))}
          <div className="absolute inset-x-0 bottom-0 border-t border-steel-300" />
          <div className="absolute inset-0 flex items-end gap-[2px]">
            {data.map((d, i) => {
              const h = max > 0 ? Math.max(d.value > 0 ? 3 : 0, (d.value / max) * (height - 18)) : 0;
              const showLabel = d.value > 0 && (i === maxIndex || i === data.length - 1);
              return (
                <div key={d.label} className="group relative flex h-full flex-1 flex-col items-center justify-end">
                  {showLabel && <span className="mb-0.5 text-[0.65rem] font-bold text-steel-600">{format(d.value)}</span>}
                  <div
                    className="w-full max-w-7 rounded-t-[4px] transition-opacity group-hover:opacity-80"
                    style={{ height: h, background: color }}
                  />
                  {/* tooltip */}
                  <div className="pointer-events-none absolute bottom-full z-10 mb-1 hidden whitespace-nowrap rounded-lg bg-ink-950 px-2 py-1 text-xs font-semibold text-white shadow-pop group-hover:block">
                    {d.label}: {format(d.value)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {total > 0 && (
        <div className="mt-1.5 flex justify-between text-[0.65rem] text-steel-400">
          <span>{data[0]?.label}</span>
          <span>{data[data.length - 1]?.label}</span>
        </div>
      )}

      <table className="sr-only">
        <caption>{title}</caption>
        <tbody>
          {data.map((d) => (
            <tr key={d.label}>
              <th scope="row">{d.label}</th>
              <td>{format(d.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
