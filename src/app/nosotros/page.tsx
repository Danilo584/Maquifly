import type { Metadata } from "next";
import Image from "next/image";
import type { ReactNode } from "react";
import { pageMetadata } from "@/lib/seo";
import { LogoMark } from "@/components/brand/Logo";
import { LinkButton } from "@/components/ui/Button";
import {
  CategoryIcon,
  IconArrowRight,
  IconChart,
  IconCheck,
  IconEye,
  IconGem,
  IconPin,
  IconTarget,
  IconUsers,
} from "@/components/ui/Icon";

export const metadata: Metadata = pageMetadata({
  title: "Sobre nosotros",
  description:
    "Quiénes somos en MaquiFly: nuestra misión, visión y valores. Conectamos a propietarios de maquinaria con personas y empresas que la necesitan en todo el Perú.",
  path: "/nosotros",
});

const valores = [
  { titulo: "Confianza", texto: "Información real y verificada." },
  { titulo: "Transparencia", texto: "Precios directos del propietario." },
  { titulo: "Seguridad", texto: "Un entorno confiable para ambas partes." },
  { titulo: "Innovación", texto: "Soluciones tecnológicas para un sector más eficiente." },
  { titulo: "Compromiso con el desarrollo", texto: "Impulsamos proyectos y oportunidades en el Perú." },
];

// Sin cifras: la plataforma no muestra números que todavía no existen.
const impacto = [
  { icono: <CategoryIcon name="loader" size={38} />, titulo: "+ Maquinaria", texto: "en diversas categorías" },
  { icono: <IconUsers size={38} />, titulo: "+ Propietarios", texto: "con nuevos clientes" },
  { icono: <IconPin size={38} />, titulo: "+ Regiones", texto: "en todo el Perú" },
  { icono: <IconChart size={38} />, titulo: "Más proyectos", texto: "impulsando el país" },
];

function Tarjeta({
  icono,
  fondoIcono,
  titulo,
  children,
}: {
  icono: ReactNode;
  fondoIcono: string;
  titulo: string;
  children: ReactNode;
}) {
  return (
    <article className="flex gap-4 rounded-2xl border border-steel-200 bg-white p-5 shadow-card sm:gap-5 sm:p-7">
      <div
        className={`grid h-14 w-14 shrink-0 place-items-center rounded-full sm:h-16 sm:w-16 ${fondoIcono}`}
      >
        {icono}
      </div>
      <div className="min-w-0">
        <h2 className="text-[1.45rem] font-extrabold leading-tight sm:text-2xl">{titulo}</h2>
        <span className="mt-3 block h-1 w-10 rounded-full bg-brand-600" aria-hidden="true" />
        <div className="mt-4">{children}</div>
      </div>
    </article>
  );
}

export default function AboutPage() {
  return (
    <>
      {/* Cabecera: excavadora al atardecer. En compu va a la derecha, anclada
          abajo a la derecha; en celular queda detrás de todo, oscurecida. */}
      <section className="relative overflow-hidden bg-ink-950">
        <div className="absolute inset-0 [container-type:size] lg:left-auto lg:w-[68%]" aria-hidden="true">
          <Image
            src="/nosotros/excavadora-atardecer.jpg"
            alt=""
            fill
            priority
            sizes="(min-width: 1024px) 68vw, 100vw"
            className="object-cover object-[30%_50%] lg:object-[100%_100%]"
          />
          <div className="absolute inset-0 bg-ink-950/75 lg:bg-transparent lg:bg-linear-to-r lg:from-ink-950 lg:via-ink-950/55 lg:via-15% lg:to-transparent lg:to-40%" />
          {/* La foto trae una zona retocada abajo a la derecha (836×354 px de
              origen). Con la foto anclada abajo-derecha, su escala es
              max(ancho/836, alto/354), así que estas medidas en cqw/cqh la
              tapan justo a cualquier tamaño de pantalla. */}
          <div className="absolute hidden items-center gap-[max(1.67cqw,3.95cqh)] rounded-2xl border border-white/20 bg-ink-950/80 px-[max(2.4cqw,5.65cqh)] backdrop-blur-md [bottom:max(1.91cqw,4.52cqh)] [height:max(9.93cqw,23.45cqh)] [right:max(6.58cqw,15.54cqh)] [width:max(34.69cqw,81.92cqh)] lg:flex">
            <IconUsers className="h-[max(4.19cqw,9.89cqh)] w-[max(4.19cqw,9.89cqh)] shrink-0 text-volt-400" />
            <p className="font-display text-[max(1.89cqw,4.46cqh)] font-bold leading-snug text-white">
              Maquinaria real
              <br />
              para proyectos reales
            </p>
          </div>
        </div>

        <div className="container-mf relative py-12 sm:py-16 lg:py-10">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 py-1.5 pl-1.5 pr-3.5 text-xs font-bold uppercase tracking-[0.12em] text-white backdrop-blur-sm">
            <LogoMark size={22} className="text-ink-900" />
            Sobre nosotros
          </p>
          <h1 className="mt-5 max-w-3xl text-[2.15rem] font-extrabold leading-[1.08] text-white sm:text-5xl lg:text-[3.1rem]">
            Conectamos <span className="text-volt-400">maquinaria,</span>{" "}
            <br className="hidden sm:block" />
            impulsamos oportunidades
          </h1>
          <p className="mt-5 max-w-xl text-[1.05rem] leading-relaxed text-ink-100 sm:text-lg">
            En MaquiFly creemos en un sector de maquinaria más conectado,
            transparente y accesible. Facilitamos el alquiler de maquinaria
            pesada entre propietarios y arrendatarios en todo el Perú.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <LinkButton href="/publicar" variant="volt" size="lg">
              Publicar mi maquinaria
              <IconArrowRight size={19} />
            </LinkButton>
            <LinkButton href="/como-funciona" variant="outline" size="lg">
              Conocer cómo funciona
            </LinkButton>
          </div>
        </div>
      </section>

      {/* Misión, visión y valores */}
      <section className="bg-steel-50 py-10 sm:py-14">
        <div className="container-mf grid gap-5 lg:grid-cols-[1fr_1fr_1.25fr]">
          <Tarjeta
            titulo="Nuestra misión"
            fondoIcono="bg-volt-400/35 text-ink-900"
            icono={<IconTarget size={30} strokeWidth={2} />}
          >
            <p className="text-[1.02rem] leading-relaxed text-steel-600">
              Conectar propietarios de maquinaria pesada con personas y empresas
              que la necesitan, facilitando un alquiler seguro, transparente y
              eficiente en todo el Perú.
            </p>
          </Tarjeta>

          <Tarjeta
            titulo="Nuestra visión"
            fondoIcono="bg-brand-50 text-brand-700 ring-1 ring-brand-100"
            icono={<IconEye size={30} strokeWidth={2} />}
          >
            <p className="text-[1.02rem] leading-relaxed text-steel-600">
              Ser la plataforma líder de alquiler de maquinaria pesada en
              Latinoamérica, reconocida por la confianza de nuestra comunidad,
              la innovación tecnológica y el impacto positivo en el desarrollo
              del sector.
            </p>
          </Tarjeta>

          <Tarjeta
            titulo="Nuestros valores"
            fondoIcono="bg-ink-950 text-volt-400"
            icono={<IconGem size={28} strokeWidth={2} />}
          >
            <ul className="flex flex-col gap-2.5">
              {valores.map((valor) => (
                <li key={valor.titulo} className="flex gap-3">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-volt-400 text-ink-950">
                    <IconCheck size={13} strokeWidth={3} />
                  </span>
                  <span>
                    <span className="block font-bold leading-tight text-ink-900">{valor.titulo}</span>
                    <span className="text-sm text-steel-600">{valor.texto}</span>
                  </span>
                </li>
              ))}
            </ul>
          </Tarjeta>
        </div>
      </section>

      {/* Lo que impulsamos */}
      <section className="relative overflow-hidden bg-ink-950">
        {/* Las montañas de la misma foto de la cabecera, apagadas */}
        <Image
          src="/nosotros/excavadora-atardecer.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-[0%_35%] opacity-50"
        />
        <div className="absolute inset-0 bg-linear-to-r from-ink-950 via-ink-950/75 to-ink-950/60" />
        <div className="absolute inset-0 bg-ink-800/30 mix-blend-color" aria-hidden="true" />

        <div className="container-mf relative grid gap-8 py-12 sm:py-16 lg:grid-cols-[0.85fr_2fr] lg:items-center lg:gap-10">
          <div>
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">Nuestro impacto</h2>
            <span className="mt-4 block h-1 w-12 rounded-full bg-volt-400" aria-hidden="true" />
            <p className="mt-4 text-lg leading-relaxed text-ink-100">
              Más maquinaria en movimiento.
              <br />
              Más proyectos hechos realidad.
            </p>
          </div>
          <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {impacto.map((item) => (
              <li
                key={item.titulo}
                className="flex flex-col items-center rounded-2xl border border-white/15 bg-white/[0.06] px-3 py-6 text-center backdrop-blur-sm"
              >
                <span className="text-volt-400">{item.icono}</span>
                <p className="mt-3 font-display text-[1.05rem] font-extrabold leading-tight text-volt-400 sm:text-lg">
                  {item.titulo}
                </p>
                <p className="mt-1 text-sm text-ink-100">{item.texto}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Cierre con la foto del trabajador con chaleco MaquiFly */}
      <section className="relative overflow-hidden bg-white">
        <div className="container-mf relative grid gap-5 py-12 sm:py-16 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-10 lg:py-16 lg:pr-[46%]">
          <h2 className="text-3xl font-extrabold leading-tight sm:text-4xl">
            Creemos en un Perú que <span className="text-brand-600">construye</span>
          </h2>
          <div>
            <p className="text-[1.02rem] leading-relaxed text-steel-700">
              La maquinaria mueve más que tierra, mueve oportunidades.
            </p>
            <p className="mt-2 text-[1.02rem] leading-relaxed text-steel-700">
              En MaquiFly trabajamos para que más personas, empresas y proyectos
              puedan acceder a la maquinaria que necesitan, de forma simple,
              segura y rápida.
            </p>
            <LinkButton href="/publicar" variant="primary" className="mt-6">
              Publicar mi maquinaria
              <IconArrowRight size={18} />
            </LinkButton>
          </div>
        </div>

        <div className="relative h-60 sm:h-80 lg:absolute lg:inset-y-0 lg:right-0 lg:h-auto lg:w-[44%]">
          {/* Franja lima que asoma por el corte diagonal de la foto */}
          <div
            className="absolute inset-0 hidden bg-volt-400 [clip-path:polygon(5%_40%,40%_40%,40%_100%,-4.6%_100%)] lg:block"
            aria-hidden="true"
          />
          <div className="absolute inset-0 lg:[clip-path:polygon(22%_0,100%_0,100%_100%,6%_100%)]">
            <Image
              src="/nosotros/trabajador-maquifly-hd.jpg"
              alt="Trabajador con casco y chaleco de MaquiFly mira una excavadora en obra al atardecer"
              fill
              sizes="(min-width: 1024px) 44vw, 100vw"
              quality={90}
              className="object-cover object-[75%_50%] lg:object-[70%_50%]"
            />
          </div>
        </div>
      </section>
    </>
  );
}
