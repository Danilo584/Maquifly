import type { ReactNode } from "react";

export type BadgeTone =
  | "neutral"
  | "brand"
  | "volt"
  | "ok"
  | "warn"
  | "danger"
  | "dark"
  | "demo";

const tones: Record<BadgeTone, string> = {
  neutral: "bg-steel-100 text-steel-700 ring-steel-200",
  brand: "bg-brand-50 text-brand-800 ring-brand-200",
  volt: "bg-volt-200 text-volt-900 ring-volt-400",
  ok: "bg-ok-50 text-ok-700 ring-ok-500/30",
  warn: "bg-warn-50 text-warn-700 ring-warn-500/30",
  danger: "bg-danger-50 text-danger-700 ring-danger-500/30",
  dark: "bg-ink-900 text-ink-50 ring-white/10",
  // La etiqueta DEMO usa un tono deliberadamente distinto a todo lo demás
  // para que nunca se confunda con un estado real de la plataforma.
  demo: "bg-warn-500 text-ink-950 ring-warn-700/40",
};

export function Badge({
  children,
  tone = "neutral",
  size = "md",
  className = "",
  title,
}: {
  children: ReactNode;
  tone?: BadgeTone;
  size?: "sm" | "md";
  className?: string;
  title?: string;
}) {
  const sizing =
    size === "sm"
      ? "text-[0.68rem] px-1.5 py-0.5 gap-1"
      : "text-xs px-2 py-0.5 gap-1.5";
  return (
    <span
      title={title}
      className={`inline-flex items-center rounded-full font-semibold ring-1 ring-inset ${tones[tone]} ${sizing} ${className}`}
    >
      {children}
    </span>
  );
}
