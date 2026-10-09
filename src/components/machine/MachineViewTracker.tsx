"use client";

import { useEffect } from "react";
import { trackMachineEvent } from "@/lib/machine-events";

/** Registra una vista de la ficha (una por sesión). No dibuja nada. */
export function MachineViewTracker({ machineId, isDemo }: { machineId: string; isDemo: boolean }) {
  useEffect(() => {
    if (!isDemo) trackMachineEvent(machineId, "view");
  }, [machineId, isDemo]);
  return null;
}
