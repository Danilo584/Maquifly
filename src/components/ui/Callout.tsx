import type { ReactNode } from "react";
import { IconAlert, IconInfo, IconCheck } from "@/components/ui/Icon";

const tones = {
  info: {
    wrapper: "border-brand-200 bg-brand-50 text-steel-800",
    icon: "text-brand-600",
    Icon: IconInfo,
  },
  warn: {
    wrapper: "border-warn-500/40 bg-warn-50 text-steel-800",
    icon: "text-warn-700",
    Icon: IconAlert,
  },
  ok: {
    wrapper: "border-ok-500/30 bg-ok-50 text-steel-800",
    icon: "text-ok-700",
    Icon: IconCheck,
  },
  neutral: {
    wrapper: "border-steel-200 bg-steel-50 text-steel-700",
    icon: "text-steel-500",
    Icon: IconInfo,
  },
} as const;

export function Callout({
  tone = "info",
  title,
  children,
  className = "",
}: {
  tone?: keyof typeof tones;
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  const t = tones[tone];
  return (
    <div
      className={`flex gap-3 rounded-xl border px-4 py-3.5 text-sm leading-relaxed ${t.wrapper} ${className}`}
    >
      <t.Icon size={18} className={`mt-0.5 shrink-0 ${t.icon}`} />
      <div className="min-w-0">
        {title && <p className="font-bold text-ink-900">{title}</p>}
        <div className={title ? "mt-1" : ""}>{children}</div>
      </div>
    </div>
  );
}
