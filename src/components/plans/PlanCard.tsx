import type { ReactNode } from "react";
import {
  FOUNDER_DISCOUNT,
  formatPEN,
  formatUSD,
  founderPricePEN,
  toUSD,
  type Plan,
  type PlanId,
} from "@/lib/plans";
import type { MachineIconName } from "@/lib/types";
import { LinkButton } from "@/components/ui/Button";
import {
  CategoryIcon,
  IconArrowRight,
  IconAward,
  IconBolt,
  IconBuilding,
  IconCheck,
  IconFlag,
  IconPlus,
  IconStar,
} from "@/components/ui/Icon";

/**
 * Tarjeta de un plan en /planes, con lenguaje de obra y maquinaria:
 * - Fly Start: claro, sobre malla de plano técnico, con un cargador.
 * - Fly Plus: oscuro, con cinta de obra arriba y borde lima → azul que gira, con una excavadora.
 * - Fly Pro: azul de plano de ingeniería, con una grúa (empresas y flotas).
 * Cada una lleva su «placa de capacidad», como la placa metálica de una máquina.
 * Nombres, precios y beneficios salen de src/lib/plans.ts.
 */
interface Tema {
  oscuro: boolean;
  Icono: typeof IconFlag;
  maquina: MachineIconName;
  tarjeta: string;
  cabecera: string;
  patron: string;
  adorno: ReactNode;
  chip: string;
  titulo: string;
  subtitulo: string;
  dibujo: string;
  placa: string;
  placaEtiqueta: string;
  remache: string;
  precio: string;
  suave: string;
  medio: string;
  descuento: string;
  socio: string;
  regla: string;
  incluye: string;
  check: string;
  beneficio: string;
  /** Etiqueta arriba a la derecha (p. ej. «Recomendado»). */
  insignia?: { texto: string; clase: string };
  /** Marco degradado de 2 px alrededor de la tarjeta. */
  /** Clases extra para el botón principal. */
  boton?: string;
  marco?: { fondo: string; sombra: string; gira?: boolean };
}

const desvanecer = "[mask-image:linear-gradient(to_bottom_left,black_10%,transparent_85%)]";

const temas: Record<PlanId, Tema> = {
  start: {
    oscuro: false,
    Icono: IconFlag,
    maquina: "loader",
    tarjeta:
      "border border-steel-200 bg-white text-ink-900 shadow-card transition duration-300 hover:shadow-card-hover motion-safe:hover:-translate-y-1",
    cabecera: "border-b border-steel-200 bg-steel-50",
    patron: `grid-blueprint-light ${desvanecer}`,
    adorno: null,
    chip: "bg-ink-900 text-volt-400",
    titulo: "text-ink-900",
    subtitulo: "text-steel-600",
    dibujo: "text-steel-300",
    placa: "border-steel-300 bg-white text-ink-900",
    placaEtiqueta: "text-steel-500",
    remache: "bg-steel-300",
    precio: "text-ink-900",
    suave: "text-steel-500",
    medio: "text-steel-600",
    descuento: "",
    socio: "",
    regla: "text-steel-300",
    incluye: "",
    check: "bg-ok-50 text-ok-700",
    beneficio: "text-steel-700",
  },
  plus: {
    oscuro: true,
    Icono: IconBolt,
    maquina: "excavator",
    tarjeta: "bg-ink-950 text-white",
    cabecera: "",
    patron: `grid-blueprint ${desvanecer}`,
    adorno: (
      <div className="absolute -right-20 -top-24 size-72 rounded-full bg-volt-400/20 blur-3xl" />
    ),
    chip: "bg-volt-400 text-ink-950 shadow-[0_0_24px_-4px_rgb(200_248_60/0.7)]",
    titulo: "text-white",
    subtitulo: "text-ink-200",
    dibujo: "text-volt-400/35",
    placa: "border-volt-400/40 bg-volt-400/10 text-volt-300",
    placaEtiqueta: "text-ink-300",
    remache: "bg-volt-400/60",
    precio: "text-white",
    suave: "text-ink-300",
    medio: "text-ink-200",
    descuento: "bg-volt-400 text-ink-950",
    socio: "bg-volt-400/10 text-volt-300 ring-1 ring-inset ring-volt-400/30",
    regla: "text-white/20",
    incluye: "bg-volt-400/10 text-volt-300 ring-1 ring-inset ring-volt-400/25",
    check: "bg-volt-400 text-ink-950",
    beneficio: "text-ink-100",
    insignia: { texto: "Recomendado", clase: "bg-volt-400 text-ink-950" },
    marco: { fondo: "halo-conico", sombra: "shadow-[0_24px_60px_-22px_rgb(200_248_60/0.5)] lg:-translate-y-3", gira: true },
  },
  pro: {
    oscuro: true,
    Icono: IconBuilding,
    maquina: "crane",
    tarjeta: "bg-linear-to-b from-[#16110a] via-ink-950 to-ink-950 text-white",
    cabecera: "bg-linear-to-br from-[#2b2009] via-[#0d0f16] to-ink-950",
    patron: `grid-blueprint ${desvanecer}`,
    adorno: (
      <>
        <div className="absolute -right-16 -top-20 size-72 rounded-full bg-[#e6b94f]/25 blur-3xl" />
        <div className="absolute -right-12 -top-12 size-44 rounded-full border border-[#e6b94f]/25" />
        <div className="absolute -right-24 -top-24 size-72 rounded-full border border-[#e6b94f]/15" />
        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-[#fff1c1] to-transparent" />
        <div className="absolute inset-y-0 left-0 w-1/3 bg-linear-to-r from-transparent via-[#fff1c1]/15 to-transparent opacity-0 motion-safe:opacity-100 motion-safe:brillo-pasa" />
      </>
    ),
    chip: "bg-linear-to-br from-[#fff1c1] via-[#e6b94f] to-[#b8860b] text-ink-950 shadow-[0_0_28px_-4px_rgb(230_185_79/0.8)]",
    titulo: "bg-linear-to-r from-[#fff1c1] via-[#f0c75e] to-[#d4a537] bg-clip-text text-transparent",
    subtitulo: "text-[#f3e3bd]/80",
    dibujo: "text-[#e6b94f]/40",
    placa: "border-[#e6b94f]/50 bg-[#e6b94f]/10 text-[#f5d27a]",
    placaEtiqueta: "text-[#f3e3bd]/70",
    remache: "bg-[#e6b94f]",
    precio: "text-white",
    suave: "text-ink-300",
    medio: "text-ink-200",
    descuento: "bg-linear-to-r from-[#fff1c1] via-[#e6b94f] to-[#b8860b] text-ink-950",
    socio: "bg-[#e6b94f]/10 text-[#f5d27a] ring-1 ring-inset ring-[#e6b94f]/40",
    regla: "text-[#e6b94f]/30",
    incluye: "bg-[#e6b94f]/10 text-[#f5d27a] ring-1 ring-inset ring-[#e6b94f]/35",
    check: "bg-linear-to-br from-[#fff1c1] via-[#e6b94f] to-[#b8860b] text-ink-950",
    beneficio: "text-ink-100",
    insignia: { texto: "Más completo", clase: "bg-linear-to-r from-[#fff1c1] via-[#e6b94f] to-[#b8860b] text-ink-950" },
    boton:
      "bg-linear-to-r from-[#f5d27a] via-[#e6b94f] to-[#c9971f] text-ink-950! shadow-[0_8px_24px_-8px_rgb(230_185_79/0.7)] hover:brightness-110",
    marco: {
      fondo: "halo-dorado",
      sombra: "shadow-[0_24px_70px_-18px_rgb(230_185_79/0.55)]",
      gira: true,
    },
  },};

export function PlanCard({ plan, founderOpen }: { plan: Plan; founderOpen: boolean }) {
  const t = temas[plan.id];
  const founderPrice = founderPricePEN(plan);
  const conPromo = plan.pricePEN > 0 && founderOpen && plan.founderDiscountMonths > 0;
  const recomendado = plan.id === "plus";
  const capacidad = plan.maxMachines === null ? "Ilimitada" : `${plan.maxMachines} máquinas`;

  const tarjeta = (
    <article
      className={`group relative flex h-full flex-col overflow-hidden ${
        t.marco ? "rounded-[calc(1.4rem-2px)]" : "rounded-[1.25rem]"
      } ${t.tarjeta}`}
    >
      {/* Fly Plus: cinta de obra arriba */}
      {recomendado && <div className="cinta-obra h-2.5 shrink-0" aria-hidden="true" />}

      <header className={`relative h-[13rem] shrink-0 overflow-hidden px-6 pt-5 ${t.cabecera}`}>
        <div className={`pointer-events-none absolute inset-0 ${t.patron}`} aria-hidden="true" />
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          {t.adorno}
        </div>
        {/* Una sola máquina dibujada en línea, sin marcas */}
        <CategoryIcon
          name={t.maquina}
          size={150}
          className={`pointer-events-none absolute -bottom-4 -right-3 size-28 sm:-bottom-5 sm:size-[150px] ${t.dibujo}`}
        />

        <div className="relative">
          <div className="flex items-center justify-between gap-3">
            <span className={`flex size-12 items-center justify-center rounded-xl ${t.chip}`}>
              <t.Icono size={24} />
            </span>
            {t.insignia && (
              <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-wide ${t.insignia.clase}`}>
                <IconStar size={13} />
                {t.insignia.texto}
              </span>
            )}
          </div>
          <h2 className={`mt-4 text-2xl font-extrabold tracking-tight ${t.titulo}`}>{plan.name}</h2>
          <p className={`mt-1 text-sm ${t.subtitulo}`}>{plan.idealFor}</p>

          {/* Placa de capacidad, como la placa metálica remachada de una máquina */}
          <p className={`relative mt-4 inline-flex items-baseline gap-2 rounded-md border px-4 py-1.5 ${t.placa}`}>
            {["left-1 top-1", "right-1 top-1", "left-1 bottom-1", "right-1 bottom-1"].map((pos) => (
              <span key={pos} className={`absolute size-1 rounded-full ${pos} ${t.remache}`} aria-hidden="true" />
            ))}
            <span className={`text-[0.65rem] font-bold uppercase tracking-[0.2em] ${t.placaEtiqueta}`}>Capacidad</span>
            <span className="text-sm font-extrabold">{capacidad}</span>
          </p>
        </div>
      </header>

      <div className="relative flex h-[13rem] shrink-0 flex-col justify-center px-6">
        {plan.pricePEN === 0 ? (
          <>
            <p className="font-display text-5xl font-extrabold tracking-tight text-ink-900">
              <span className="bg-[linear-gradient(transparent_62%,var(--color-volt-300)_62%)] px-1">
                Gratis
              </span>
            </p>
            <p className="mt-2 text-sm text-steel-500">Sin tarjeta y sin contrato</p>
          </>
        ) : conPromo ? (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-md px-2 py-0.5 text-xs font-extrabold ${t.descuento}`}>
                −{Math.round(FOUNDER_DISCOUNT * 100)}%
              </span>
              <p className={`text-sm ${t.suave}`}>
                Precio normal:{" "}
                <span className="line-through">
                  {formatPEN(plan.pricePEN)} · {formatUSD(toUSD(plan.pricePEN))}
                </span>{" "}
                /mes
              </p>
            </div>
            <p className={`mt-2 font-display text-5xl font-extrabold tracking-tight ${t.precio}`}>
              {formatPEN(founderPrice)}
              <span className={`text-base font-semibold tracking-normal ${t.suave}`}> /mes</span>
            </p>
            <p className={`mt-1 text-sm font-semibold ${t.medio}`}>{formatUSD(toUSD(founderPrice))} /mes</p>
            <p className={`mt-3 inline-flex self-start items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${t.socio}`}>
              <IconAward size={15} className="shrink-0" />
              Precio Socio Fundador ·{" "}
              {plan.founderDiscountMonths === 1 ? "primer mes" : `primeros ${plan.founderDiscountMonths} meses`}
            </p>
          </>
        ) : (
          <>
            <p className={`font-display text-5xl font-extrabold tracking-tight ${t.precio}`}>
              {formatPEN(plan.pricePEN)}
              <span className={`text-base font-semibold tracking-normal ${t.suave}`}> /mes</span>
            </p>
            <p className={`mt-1 text-sm font-semibold ${t.medio}`}>{formatUSD(toUSD(plan.pricePEN))} /mes</p>
          </>
        )}
      </div>

      {/* Separador con marcas de regla de obra */}
      <div className={`regla-obra mx-6 h-2 shrink-0 ${t.regla}`} aria-hidden="true" />

      <ul className="relative flex flex-1 flex-col gap-2.5 px-6 py-5 text-sm">
        {plan.includesPrevious && (
          <li className={`flex items-center gap-2.5 rounded-lg px-3 py-2 font-bold ${t.incluye}`}>
            <IconPlus size={16} className="shrink-0" />
            {plan.includesPrevious}
          </li>
        )}
        {plan.benefits.map((benefit) => (
          <li key={benefit} className="flex items-start gap-2.5">
            <span className={`mt-px flex size-[18px] shrink-0 items-center justify-center rounded-full ${t.check}`}>
              <IconCheck size={12} strokeWidth={3} />
            </span>
            <span className={t.beneficio}>{benefit}</span>
          </li>
        ))}
      </ul>

      {plan.pricePEN === 0 && (
        <p className="mx-6 mb-5 flex items-start gap-3 rounded-xl border border-dashed border-steel-300 bg-steel-50 p-3.5 text-sm leading-snug text-steel-600">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-ink-900 text-volt-400">
            <IconBolt size={17} />
          </span>
          Con Fly Plus y Fly Pro, el cliente te escribe directo a tu WhatsApp.
        </p>
      )}

      <div className="relative px-6 pb-6">
        {plan.pricePEN === 0 ? (
          <LinkButton href="/publicar" variant="secondary" fullWidth>
            Publicar gratis
            <IconArrowRight size={18} className="motion-safe:transition-transform group-hover:translate-x-0.5" />
          </LinkButton>
        ) : (
          <LinkButton href={`/ingresar?plan=${plan.id}`} variant={recomendado ? "volt" : "primary"}
            className={t.boton} fullWidth>
            Elegir {plan.name}
            <IconArrowRight size={18} className="motion-safe:transition-transform group-hover:translate-x-0.5" />
          </LinkButton>
        )}
      </div>
    </article>
  );

  if (!t.marco) return tarjeta;

  // Marco degradado de 2 px detrás de la tarjeta (en Fly Plus gira si se permite movimiento).
  return (
    <div className={`relative h-full overflow-hidden rounded-[1.4rem] p-[2px] ${t.marco.sombra}`}>
      {t.marco.gira ? (
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden rounded-[1.4rem]"
          aria-hidden="true"
        >
          <div className={`aspect-square w-[300%] shrink-0 motion-safe:halo-giratorio ${t.marco.fondo}`} />
        </div>
      ) : (
        <div className={`pointer-events-none absolute inset-0 rounded-[1.4rem] ${t.marco.fondo}`} aria-hidden="true" />
      )}
      {tarjeta}
    </div>
  );
}