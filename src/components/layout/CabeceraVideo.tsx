"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Fondo en video para las cabeceras oscuras de las páginas internas (todas
 * menos el blog). Usa el mismo bucle de obra del hero de la portada, pero
 * cada página arranca en otro momento (`inicio`) para que no se vean iguales.
 * - El video va a la derecha y se oscurece hacia el texto; en celular queda
 *   detrás de todo, bien oscuro.
 * - Si la persona pidió «reducir movimiento» o el video falla, queda la
 *   imagen fija de ese mismo momento.
 * Va como primer hijo de la <section> (que ya es relative overflow-hidden).
 */
export type InicioCabecera = 1 | 4 | 7;

export function CabeceraVideo({ inicio = 1 }: { inicio?: InicioCabecera }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [conMovimiento, setConMovimiento] = useState(false);
  const [reproduciendo, setReproduciendo] = useState(false);
  const [fallo, setFallo] = useState(false);
  const poster = `/hero/cabecera-${inicio}.jpg`;

  useEffect(() => {
    const reducir = window.matchMedia("(prefers-reduced-motion: reduce)");
    // Solo en desarrollo: ?video=1 muestra el video aunque el sistema pida menos movimiento.
    const forzar =
      process.env.NODE_ENV !== "production" && new URLSearchParams(window.location.search).has("video");
    const actualizar = () => setConMovimiento(forzar || !reducir.matches);
    actualizar();
    reducir.addEventListener("change", actualizar);
    return () => reducir.removeEventListener("change", actualizar);
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <div className="absolute inset-y-0 right-0 w-full lg:w-[62%]">
        {/* eslint-disable-next-line @next/next/no-img-element -- imagen de respaldo del video */}
        <img src={poster} alt="" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
        {conMovimiento && !fallo && (
          <video
            ref={ref}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            disablePictureInPicture
            poster={poster}
            onLoadedMetadata={() => {
              if (ref.current) ref.current.currentTime = inicio;
            }}
            onPlaying={() => setReproduciendo(true)}
            onError={(e) => {
              if (e.target === e.currentTarget) setFallo(true);
            }}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
              reproduciendo ? "opacity-100" : "opacity-0"
            }`}
          >
            <source media="(max-width: 767px)" src="/hero/hero-obra-movil.webm" type="video/webm" />
            <source media="(max-width: 767px)" src="/hero/hero-obra-movil.mp4" type="video/mp4" />
            <source src="/hero/hero-obra-1280.mp4" type="video/mp4" onError={() => setFallo(true)} />
          </video>
        )}
      </div>
      {/* Oscurecido: en celular parejo; en compu, desde el texto (izquierda) hacia el video */}
      <div className="absolute inset-0 bg-ink-950/80 lg:bg-transparent lg:bg-linear-to-r lg:from-ink-950 lg:from-40% lg:via-ink-950/70 lg:to-ink-950/20" />
      <div className="absolute inset-0 bg-linear-to-t from-ink-950/70 via-transparent to-ink-950/30" />
    </div>
  );
}
