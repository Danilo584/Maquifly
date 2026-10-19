"use client";

import { useEffect, useState } from "react";

/**
 * Fondo en video del hero: obra activa en bucle de 9 s, sin sonido.
 * - En celular usa el corte vertical; en pantallas medianas, la versión de 1280 px.
 * - Mientras carga, si falla o si la persona pidió «reducir movimiento»,
 *   queda la imagen fija (el primer fotograma del bucle).
 * Los archivos están en /public/hero/. Los degradados oscuros los pone el Hero.
 */
const opacidad = "opacity-60 sm:opacity-75 lg:opacity-100";

export function HeroVideoFondo() {
  const [conMovimiento, setConMovimiento] = useState(false);
  const [reproduciendo, setReproduciendo] = useState(false);
  const [fallo, setFallo] = useState(false);

  useEffect(() => {
    const reducir = window.matchMedia("(prefers-reduced-motion: reduce)");
    // Solo en desarrollo: ?video=1 muestra el video aunque el sistema pida menos movimiento (para revisarlo).
    const forzar =
      process.env.NODE_ENV !== "production" && new URLSearchParams(window.location.search).has("video");
    const actualizar = () => setConMovimiento(forzar || !reducir.matches);
    actualizar();
    reducir.addEventListener("change", actualizar);
    return () => reducir.removeEventListener("change", actualizar);
  }, []);

  return (
    <div className="absolute inset-0" aria-hidden="true">
      <picture>
        <source media="(max-width: 767px)" srcSet="/hero/hero-obra-movil-poster.jpg" />
        {/* eslint-disable-next-line @next/next/no-img-element -- imagen de respaldo con versión para celular */}
        <img
          src="/hero/hero-obra-poster.jpg"
          alt=""
          fetchPriority="high"
          decoding="async"
          className={`absolute inset-0 h-full w-full object-cover ${opacidad}`}
        />
      </picture>

      {conMovimiento && !fallo && (
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          disablePictureInPicture
          poster="/hero/hero-obra-poster.jpg"
          onPlaying={() => setReproduciendo(true)}
          // React hace subir al <video> los errores de cada <source> descartado (p. ej. las
          // versiones de celular en una computadora): solo cuenta el error del propio video.
          onError={(e) => {
            if (e.target === e.currentTarget) setFallo(true);
          }}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            reproduciendo ? opacidad : "opacity-0"
          }`}
        >
          <source media="(max-width: 767px)" src="/hero/hero-obra-movil.webm" type="video/webm" />
          <source media="(max-width: 767px)" src="/hero/hero-obra-movil.mp4" type="video/mp4" />
          <source media="(max-width: 1279px)" src="/hero/hero-obra-1280.mp4" type="video/mp4" />
          <source src="/hero/hero-obra-1920.webm" type="video/webm" />
          {/* Última opción: si tampoco carga, queda la imagen fija. */}
          <source src="/hero/hero-obra-1920.mp4" type="video/mp4" onError={() => setFallo(true)} />
        </video>
      )}
    </div>
  );
}
