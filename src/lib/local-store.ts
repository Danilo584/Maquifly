"use client";

/**
 * Almacenamiento local temporal.
 * ---------------------------------------------------------------------------
 * IMPORTANTE: esto NO es una base de datos y la interfaz siempre lo dice al
 * usuario. Se usa para que los formularios del MVP (publicar, reportar,
 * reseñar) funcionen de verdad de principio a fin —validan, guardan y se
 * pueden recuperar— mientras no exista backend.
 *
 * Todo lo que se guarda aquí vive solo en el navegador de esa persona, en ese
 * dispositivo. Al conectar Supabase, cada `saveLocal` se reemplaza por su
 * `insert` correspondiente.
 *
 * Todas las operaciones van en try/catch: en navegación privada o con
 * almacenamiento bloqueado, `localStorage` lanza excepción y la aplicación no
 * debe romperse por eso.
 */

const PREFIX = "maquifly:";

export function readLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeLocal(key: string, value: unknown): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function appendLocal<T>(key: string, item: T): T[] {
  const list = readLocal<T[]>(key, []);
  const next = [...list, item];
  writeLocal(key, next);
  return next;
}

export function removeLocal(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(PREFIX + key);
  } catch {
    /* almacenamiento no disponible */
  }
}

/** Identificador local legible para borradores y envíos. */
export function localId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}
