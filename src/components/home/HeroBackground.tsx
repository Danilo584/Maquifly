"use client";

import { useEffect, useRef, useState } from "react";

type Connection = {
  saveData?: boolean;
  addEventListener?: (type: string, listener: () => void) => void;
  removeEventListener?: (type: string, listener: () => void) => void;
};

/** El poster del hero permanece visible hasta que el video se reproduce. */
export function HeroBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const userPaused = useRef(false);
  const [source, setSource] = useState<string | null>(null);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobile = window.matchMedia("(max-width: 639px)");
    const connection = (navigator as Navigator & { connection?: Connection }).connection;

    function updateSource() {
      // No asignar una URL evita descargar video cuando no se desea animación.
      setSource(
        reducedMotion.matches || connection?.saveData
          ? null
          : mobile.matches
            ? "/videos/maquifly-hero-mobile.mp4"
            : "/videos/maquifly-hero.mp4",
      );
    }

    updateSource();
    reducedMotion.addEventListener("change", updateSource);
    mobile.addEventListener("change", updateSource);
    connection?.addEventListener?.("change", updateSource);
    return () => {
      reducedMotion.removeEventListener("change", updateSource);
      mobile.removeEventListener("change", updateSource);
      connection?.removeEventListener?.("change", updateSource);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !source || failed) return;

    let inView = true;
    let disposed = false;
    setHasPlayed(false);
    setIsPlaying(false);

    function updatePlayback() {
      if (!video) return;
      if (inView && document.visibilityState === "visible" && !userPaused.current) {
        void video.play().catch(() => {
          if (!disposed) setIsPlaying(false);
        });
      } else {
        video.pause();
      }
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        updatePlayback();
      },
      { threshold: 0.05 },
    );
    observer.observe(video);
    document.addEventListener("visibilitychange", updatePlayback);
    updatePlayback();

    return () => {
      disposed = true;
      observer.disconnect();
      document.removeEventListener("visibilitychange", updatePlayback);
      video.pause();
    };
  }, [source, failed]);

  if (!source || failed) return null;

  function togglePlayback() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      userPaused.current = false;
      void video.play().catch(() => setIsPlaying(false));
    } else {
      userPaused.current = true;
      video.pause();
    }
  }

  return (
    <>
      <div
        className="pointer-events-none absolute inset-0 opacity-60 sm:opacity-75 lg:opacity-100"
        aria-hidden="true"
      >
        <video
          ref={videoRef}
          src={source}
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          tabIndex={-1}
          onPlaying={() => {
            setHasPlayed(true);
            setIsPlaying(true);
          }}
          onPause={() => setIsPlaying(false)}
          onError={() => setFailed(true)}
          className={`h-full w-full object-cover object-[70%_center] transition-opacity duration-1000 ${hasPlayed ? "opacity-100" : "opacity-0"}`}
        />
      </div>

      <button
        type="button"
        onClick={togglePlayback}
        aria-label={isPlaying ? "Pausar video de portada" : "Reproducir video de portada"}
        className="absolute bottom-4 right-4 z-20 inline-flex min-h-11 items-center gap-2 rounded-full border border-white/20 bg-ink-950/70 px-4 text-xs font-semibold text-white backdrop-blur-sm transition-colors hover:border-volt-400/60 hover:text-volt-300 sm:bottom-6 sm:right-8"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="currentColor"
          aria-hidden="true"
          focusable="false"
        >
          {isPlaying ? (
            <path d="M4 3h3v10H4zM9 3h3v10H9z" />
          ) : (
            <path d="M5 2.5v11L13 8z" />
          )}
        </svg>
        {isPlaying ? "Pausar" : "Reproducir"}
      </button>
    </>
  );
}
