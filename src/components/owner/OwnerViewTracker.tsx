"use client";

import { useEffect } from "react";

/**
 * Registra una visita al perfil del propietario (una por sesión). No dibuja
 * nada. Carga Supabase en segundo plano, después de mostrar la página, para
 * no hacerla más pesada.
 */
export function OwnerViewTracker({ ownerId, isDemo }: { ownerId: string; isDemo: boolean }) {
  useEffect(() => {
    if (isDemo) return;
    import("@/lib/machine-events").then(({ trackOwnerView }) => trackOwnerView(ownerId));
  }, [ownerId, isDemo]);
  return null;
}
