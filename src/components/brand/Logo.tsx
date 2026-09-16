import Link from "next/link";

/**
 * IDENTIDAD PROVISIONAL DE MAQUIFLY
 * ---------------------------------------------------------------------------
 * Concepto del isotipo: una "M" construida con trazos angulares —el perfil de
 * un brazo articulado— y un vector de despegue que sale del último trazo.
 * Une las dos mitades del nombre: MAQUI (maquinaria, industrial, angular) y
 * FLY (movimiento, tecnología, velocidad).
 *
 * Es geométrico y monocromo a propósito: funciona a 16 px como favicon, en
 * una sola tinta sobre vinilo, y se sustituye por el logotipo definitivo
 * cambiando únicamente este archivo.
 */

type MarkProps = {
  size?: number;
  /** El vector de despegue se oculta en tamaños pequeños para no ensuciar. */
  showVector?: boolean;
  className?: string;
};

export function LogoMark({ size = 36, showVector = true, className }: MarkProps) {
  const withVector = showVector && size >= 28;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <rect width="40" height="40" rx="11" fill="currentColor" />
      <path
        d="M8 30.5V14L16 22.5L24 14V30.5"
        stroke="var(--color-volt-400)"
        strokeWidth="4.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {withVector && (
        <path
          d="M27.5 18.5L33.5 12.5M33.5 12.5H28.6M33.5 12.5V17.4"
          stroke="var(--color-ink-50)"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

type LogoProps = {
  /** "dark" = sobre fondo oscuro; "light" = sobre fondo claro. */
  tone?: "dark" | "light";
  size?: "sm" | "md" | "lg";
  withTagline?: boolean;
  href?: string | null;
  className?: string;
};

const sizeMap = {
  sm: { mark: 30, text: "text-[1.05rem]", tag: "text-[0.6rem]" },
  md: { mark: 38, text: "text-xl", tag: "text-[0.65rem]" },
  lg: { mark: 52, text: "text-3xl", tag: "text-xs" },
} as const;

export function Logo({
  tone = "light",
  size = "md",
  withTagline = false,
  href = "/",
  className = "",
}: LogoProps) {
  const s = sizeMap[size];
  const markColor = tone === "dark" ? "text-ink-800" : "text-ink-900";
  const wordColor = tone === "dark" ? "text-white" : "text-ink-900";
  const tagColor = tone === "dark" ? "text-ink-200" : "text-steel-500";

  const content = (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark size={s.mark} className={markColor} />
      <span className="flex flex-col leading-none">
        <span
          className={`font-display font-extrabold tracking-[-0.045em] ${s.text} ${wordColor}`}
        >
          Maqui<span className="text-brand-600">Fly</span>
        </span>
        {withTagline && (
          <span className={`mt-1 font-medium tracking-wide ${s.tag} ${tagColor}`}>
            Conectamos maquinaria con proyectos
          </span>
        )}
      </span>
    </span>
  );

  if (!href) return content;

  return (
    <Link
      href={href}
      className="inline-flex rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4"
      aria-label="MaquiFly — ir al inicio"
    >
      {content}
    </Link>
  );
}
