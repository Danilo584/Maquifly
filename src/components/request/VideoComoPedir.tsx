"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Video corto (24 s, sin sonido) que muestra cómo se pide una máquina con el
 * formulario «Te la conseguimos». Se reproduce solo cuando está a la vista;
 * si la persona pidió «reducir movimiento», queda quieto con controles para
 * que lo inicie ella misma.
 */
export function VideoComoPedir({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [reducir, setReducir] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducir(mq.matches);
    if (mq.matches) return;

    const obs = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.35 },
    );
    obs.observe(video);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      className={`overflow-hidden rounded-2xl border border-white/10 bg-ink-950 shadow-[0_30px_70px_-24px_rgb(200_248_60/0.35)] ${className}`}
    >
      <video
        ref={ref}
        muted
        loop
        playsInline
        preload="metadata"
        controls={reducir}
        poster="/te-la-conseguimos/como-pedir-poster.jpg"
        aria-label="Demostración: cómo pedir una máquina en MaquiFly paso a paso"
        className="block aspect-square w-full object-cover"
      >
        <source src="/te-la-conseguimos/como-pedir.webm" type="video/webm" />
        <source src="/te-la-conseguimos/como-pedir.mp4" type="video/mp4" />
      </video>
    </div>
  );
}
