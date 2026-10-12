"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const KEY = "maquifly:aviso-cookies";

/**
 * Aviso de cookies y almacenamiento.
 * MaquiFly hoy NO usa cookies publicitarias ni de seguimiento; solo
 * almacenamiento técnico necesario. Por eso basta un aviso informativo con
 * «Entendido». Si algún día se conecta Google Analytics o el píxel de Meta,
 * este aviso debe pasar a pedir consentimiento (Aceptar / Rechazar) antes de
 * cargarlos.
 */
export function CookieNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!window.localStorage.getItem(KEY)) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  function accept() {
    try {
      window.localStorage.setItem(KEY, new Date().toISOString());
    } catch {
      /* sin almacenamiento: el aviso solo se cierra en esta visita */
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Aviso de cookies"
      className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-3xl rounded-2xl border border-white/10 bg-ink-950 p-4 text-sm text-ink-200 shadow-pop sm:inset-x-6 sm:bottom-6 sm:flex sm:items-center sm:gap-5 sm:p-5"
    >
      <p className="leading-relaxed">
        <span className="font-bold text-white">Usamos solo lo necesario.</span>{" "}
        MaquiFly guarda en tu navegador datos técnicos para que la web funcione
        (por ejemplo, el borrador de tu publicación). No usamos cookies
        publicitarias ni de seguimiento.{" "}
        <Link href="/privacidad#cookies" className="font-semibold text-volt-400 underline underline-offset-2">
          Más información
        </Link>
      </p>
      <button
        type="button"
        onClick={accept}
        className="mt-3 inline-flex h-11 w-full shrink-0 items-center justify-center rounded-lg bg-volt-400 px-5 font-bold text-ink-950 transition-colors hover:bg-volt-300 sm:mt-0 sm:w-auto"
      >
        Entendido
      </button>
    </div>
  );
}
