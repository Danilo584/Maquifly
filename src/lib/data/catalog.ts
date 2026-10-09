import type { Machine, OwnerProfile } from "@/lib/types";

/**
 * CATÁLOGO REAL — mientras no esté conectado Supabase
 * ---------------------------------------------------------------------------
 * Aquí van SOLO propietarios y máquinas reales, con fotos reales.
 * El catálogo de demostración se eliminó (oct. 2026).
 *
 * Cada máquina debe apuntar a un propietario de `catalogOwners` por `ownerId`.
 * Al conectar Supabase, estos registros se cargan en las tablas
 * `owner_profiles` y `machines` y este archivo queda vacío.
 */

export const catalogOwners: OwnerProfile[] = [];

export const catalogMachines: Machine[] = [];
