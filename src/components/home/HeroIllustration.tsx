/**
 * Ilustración del hero: un minicargador en estilo «plano técnico».
 *
 * Es una ilustración vectorial (no una foto) a propósito: no simula ser una
 * máquina real del catálogo. Cuando haya una buena foto propia, se puede
 * reemplazar este componente por un <Image> sin tocar el resto del hero.
 * Va inline (sin petición extra) y pesa unos pocos KB.
 */
export function HeroIllustration({ className = "" }: { className?: string }) {
  const lime = "#c8f83c";
  const line = "#eef3fa";
  const steel = "#7ba0cd";
  const dark = "#040e1b";
  const mid = "#132c4b";

  return (
    <div className={`relative ${className}`} aria-hidden="true">
      {/* Halo detrás de la máquina */}
      <div className="absolute inset-[12%] rounded-full bg-brand-600/25 blur-3xl" />

      <svg
        viewBox="0 0 560 380"
        className="relative h-auto w-full"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Círculo técnico de fondo */}
        <circle cx="285" cy="215" r="190" stroke={steel} strokeOpacity="0.18" />
        <circle
          cx="285"
          cy="215"
          r="160"
          stroke={steel}
          strokeOpacity="0.14"
          strokeDasharray="3 9"
        />
        <path d="M95 215 H120 M450 215 H475 M285 25 V50" stroke={lime} strokeOpacity="0.5" strokeWidth="1.5" />

        {/* Suelo */}
        <path d="M30 352 H530" stroke={lime} strokeOpacity="0.6" strokeWidth="1.5" />
        <path d="M60 362 H500" stroke={steel} strokeOpacity="0.25" strokeDasharray="2 10" />

        {/* Montículo de arena a la izquierda */}
        <path d="M18 352 Q55 300 92 318 Q110 326 118 352 Z" fill={mid} stroke={steel} strokeOpacity="0.5" strokeWidth="1.5" />
        <path d="M40 336 l4 -3 M66 322 l5 -2 M88 334 l3 -3" stroke={steel} strokeOpacity="0.6" strokeWidth="2" />

        {/* Líneas de movimiento detrás */}
        <path d="M440 250 H500 M450 272 H520 M455 294 H495" stroke={steel} strokeOpacity="0.35" strokeWidth="2" />

        {/* ── Chasis inferior ── */}
        <path
          d="M168 312 V262 Q168 252 178 252 H402 Q414 252 420 264 L428 288 V312 Z"
          fill={mid}
          stroke={line}
          strokeWidth="3"
        />

        {/* Torre trasera (motor) */}
        <path
          d="M344 252 V158 Q344 148 354 148 H392 Q402 148 406 158 L418 200 V252 Z"
          fill={dark}
          stroke={line}
          strokeWidth="3"
        />
        <path d="M356 172 H394 M358 186 H398 M360 200 H402 M362 214 H406" stroke={steel} strokeOpacity="0.7" strokeWidth="2" />
        {/* Escape */}
        <path d="M372 148 V128" stroke={line} strokeWidth="5" />
        <path d="M378 118 q8 -6 4 -14 M388 120 q9 -8 3 -18" stroke={steel} strokeOpacity="0.45" strokeWidth="2" />

        {/* Cabina */}
        <path
          d="M214 252 V146 Q214 132 228 132 H322 Q330 132 334 138 L344 154 V252 Z"
          fill={dark}
          stroke={line}
          strokeWidth="3"
        />
        {/* Barras de protección (ROPS) */}
        <path d="M230 148 H326 M230 148 V244 M326 148 V244 M230 180 H326 M230 212 H326" stroke={steel} strokeOpacity="0.55" strokeWidth="2" />
        {/* Operador */}
        <circle cx="282" cy="186" r="12" fill={steel} fillOpacity="0.9" />
        <path d="M264 232 Q266 206 282 204 Q298 206 300 232" fill={steel} fillOpacity="0.9" />
        <path d="M262 210 L248 222" stroke={steel} strokeWidth="5" />
        {/* Casco del operador */}
        <path d="M270 182 Q270 168 282 168 Q294 168 294 182 Z" fill={lime} />

        {/* Pistón hidráulico */}
        <path d="M398 236 L330 134" stroke={steel} strokeWidth="10" />
        <path d="M398 236 L362 182" stroke={line} strokeWidth="5" />

        {/* Brazos de levante */}
        <path
          d="M398 160 L330 116 Q322 111 312 112 L196 122 Q182 124 176 136 L132 252"
          stroke={dark}
          strokeWidth="22"
        />
        <path
          d="M398 160 L330 116 Q322 111 312 112 L196 122 Q182 124 176 136 L132 252"
          stroke={lime}
          strokeWidth="15"
        />
        <circle cx="398" cy="160" r="9" fill={dark} stroke={line} strokeWidth="3" />

        {/* Cuchara */}
        <path
          d="M142 238 L84 236 Q72 236 68 248 L56 306 Q54 316 64 318 L134 320 Q142 320 144 312 L150 262 Q152 244 142 238 Z"
          fill={lime}
          stroke={dark}
          strokeWidth="3"
        />
        <path d="M86 248 L76 304 M104 248 L98 306 M122 250 L118 308" stroke={dark} strokeOpacity="0.35" strokeWidth="2.5" />
        <path d="M58 318 H138" stroke={dark} strokeWidth="4" />
        {/* Arena cargada */}
        <path d="M70 240 Q92 220 112 228 Q128 220 142 238 Z" fill={mid} stroke={steel} strokeOpacity="0.6" strokeWidth="1.5" />
        <circle cx="132" cy="252" r="8" fill={dark} stroke={line} strokeWidth="3" />

        {/* Ruedas */}
        {[
          { cx: 214, cy: 316 },
          { cx: 372, cy: 316 },
        ].map(({ cx, cy }) => (
          <g key={cx}>
            <circle cx={cx} cy={cy} r="38" fill={dark} stroke={line} strokeWidth="3" />
            <circle cx={cx} cy={cy} r="31" stroke={steel} strokeOpacity="0.5" strokeWidth="5" strokeDasharray="5 6" />
            <circle cx={cx} cy={cy} r="16" fill={mid} stroke={line} strokeWidth="2.5" />
            <circle cx={cx} cy={cy} r="6" fill={lime} />
          </g>
        ))}

      </svg>

      {/* Tarjeta flotante */}
      <div className="relative ml-auto mt-1 flex w-fit items-center gap-3 rounded-2xl border border-white/10 bg-ink-900/85 px-4 py-3 shadow-xl backdrop-blur">
        <span className="flex size-10 items-center justify-center rounded-full bg-volt-400 text-ink-950">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20.5l1.6-5.2A8.5 8.5 0 1 1 21 11.5z" />
          </svg>
        </span>
        <span className="leading-tight">
          <span className="block text-sm font-bold text-white">Cotiza directo</span>
          <span className="block text-xs text-ink-300">con el propietario por WhatsApp</span>
        </span>
      </div>
    </div>
  );
}
