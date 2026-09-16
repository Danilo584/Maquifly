import type { Review } from "@/lib/types";

/**
 * RESEÑAS — deliberadamente vacío.
 * ---------------------------------------------------------------------------
 * MaquiFly no muestra ni una sola reseña inventada. La reputación es la
 * principal ventaja competitiva del proyecto y pierde todo su valor si se
 * siembra con datos falsos: un propietario real detecta en segundos que las
 * reseñas no corresponden a alquileres que existieron.
 *
 * Toda la interfaz de reseñas está construida y funciona (resumen, desglose
 * por criterio, listado, formulario, respuesta del propietario, estados
 * vacíos). Cuando este arreglo se llene con reseñas reales desde Supabase,
 * la interfaz se activa sola.
 *
 * Mientras tanto, cada máquina y cada propietario muestran:
 *   "Aún no hay reseñas. Sé el primero en calificar este alquiler."
 * y NO se muestra ninguna estrella ni promedio.
 */
export const reviews: Review[] = [];

/** Recalcula promedio y conteo a partir de reseñas reales. Nunca inventa. */
export function summarize(list: Review[]): { rating: number | null; count: number } {
  if (list.length === 0) return { rating: null, count: 0 };
  const sum = list.reduce((acc, r) => acc + r.rating, 0);
  return { rating: Math.round((sum / list.length) * 10) / 10, count: list.length };
}
