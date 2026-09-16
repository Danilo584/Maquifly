import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

export type ButtonVariant =
  | "primary"
  | "volt"
  | "secondary"
  | "ghost"
  | "outline"
  | "whatsapp"
  | "danger";

export type ButtonSize = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-colors duration-150 disabled:opacity-50 disabled:pointer-events-none select-none";

const variants: Record<ButtonVariant, string> = {
  // Acción primaria sobre fondo claro.
  primary: "bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800",
  // Acento lima: SOLO sobre superficies oscuras (contraste sobre blanco insuficiente).
  volt: "bg-volt-400 text-ink-950 hover:bg-volt-300 active:bg-volt-500",
  secondary:
    "bg-white text-ink-900 border border-steel-300 hover:bg-steel-50 active:bg-steel-100",
  outline:
    "bg-transparent text-white border border-white/30 hover:bg-white/10 active:bg-white/15",
  ghost: "bg-transparent text-ink-800 hover:bg-steel-100 active:bg-steel-200",
  whatsapp: "bg-[#128C7E] text-white hover:bg-[#0f7a6d] active:bg-[#0c6659]",
  danger: "bg-danger-500 text-white hover:bg-danger-700",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-11 px-5 text-[0.95rem]",
  lg: "h-13 px-6 text-base sm:h-14 sm:px-7 sm:text-[1.05rem]",
};

function classes(
  variant: ButtonVariant,
  size: ButtonSize,
  fullWidth: boolean,
  className: string,
) {
  return [
    base,
    variants[variant],
    sizes[size],
    fullWidth ? "w-full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

type CommonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
  children: ReactNode;
};

type ButtonProps = CommonProps &
  Omit<ComponentPropsWithoutRef<"button">, "className" | "children">;

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  children,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button type={type} className={classes(variant, size, fullWidth, className)} {...rest}>
      {children}
    </button>
  );
}

type LinkButtonProps = CommonProps & {
  href: string;
  external?: boolean;
  prefetch?: boolean;
  "aria-label"?: string;
  rel?: string;
  target?: string;
  onClick?: () => void;
};

export function LinkButton({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  href,
  external = false,
  children,
  ...rest
}: LinkButtonProps) {
  const cls = classes(variant, size, fullWidth, className);

  if (external) {
    return (
      <a
        href={href}
        className={cls}
        target="_blank"
        rel="noopener noreferrer"
        {...rest}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={cls} {...rest}>
      {children}
    </Link>
  );
}
