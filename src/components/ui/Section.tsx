import type { ReactNode } from "react";

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  tone = "light",
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  tone?: "light" | "dark";
  align?: "left" | "center";
}) {
  const dark = tone === "dark";
  return (
    <div
      className={`flex flex-col gap-4 ${
        align === "center"
          ? "items-center text-center"
          : "sm:flex-row sm:items-end sm:justify-between"
      }`}
    >
      <div className={align === "center" ? "max-w-2xl" : "max-w-2xl"}>
        {eyebrow && (
          <p
            className={`mb-2 text-xs font-bold uppercase tracking-[0.14em] ${
              dark ? "text-volt-400" : "text-brand-600"
            }`}
          >
            {eyebrow}
          </p>
        )}
        <h2
          className={`text-[1.6rem] font-extrabold leading-tight sm:text-3xl ${dark ? "text-white" : ""}`}
        >
          {title}
        </h2>
        {description && (
          <p
            className={`mt-3 text-[0.98rem] leading-relaxed ${
              dark ? "text-ink-200" : "text-steel-600"
            }`}
          >
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function Section({
  children,
  className = "",
  tone = "light",
  id,
}: {
  children: ReactNode;
  className?: string;
  tone?: "light" | "muted" | "dark";
  id?: string;
}) {
  const tones = {
    light: "bg-white",
    muted: "bg-steel-50",
    dark: "bg-ink-900 text-ink-100",
  };
  return (
    <section id={id} className={`${tones[tone]} py-10 sm:py-20 ${className}`}>
      <div className="container-mf">{children}</div>
    </section>
  );
}
