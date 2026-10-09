"use client";

import { getSupabase, PHOTO_BUCKET } from "@/lib/supabase";

/**
 * ENVÍOS DESDE LA WEB → PANEL
 * ---------------------------------------------------------------------------
 * Todo lo que un visitante envía (contacto, solicitud de información,
 * reporte, solicitud de publicación) se guarda en Supabase y aparece en
 * /admin. Si Supabase aún no está conectado, devuelve `not_configured` y el
 * formulario ofrece WhatsApp: nunca se finge un envío.
 */

export type SendResult = { ok: true } | { ok: false; reason: "not_configured" | "error"; message?: string };

export async function sendContactMessage(input: {
  name: string;
  contact: string;
  topic: string;
  message: string;
  machineId?: string | null;
  kind?: "contact" | "info_request";
}): Promise<SendResult> {
  const supabase = getSupabase();
  if (!supabase) return { ok: false, reason: "not_configured" };
  const { error } = await supabase.from("contact_messages").insert({
    name: input.name.slice(0, 120),
    contact: input.contact.slice(0, 160),
    topic: input.topic,
    message: input.message.slice(0, 4000),
    machine_id: input.machineId ?? null,
    kind: input.kind ?? "contact",
  });
  return error ? { ok: false, reason: "error", message: error.message } : { ok: true };
}

export async function sendReport(input: {
  machineId: string;
  reason: string;
  comment: string;
  contact: string | null;
}): Promise<SendResult> {
  const supabase = getSupabase();
  if (!supabase) return { ok: false, reason: "not_configured" };
  const { error } = await supabase.from("reports").insert({
    machine_id: input.machineId,
    reason: input.reason,
    comment: input.comment.slice(0, 2000),
    reporter_contact: input.contact,
  });
  return error ? { ok: false, reason: "error", message: error.message } : { ok: true };
}

/** Sube las fotos a submissions/<id>/ y guarda la solicitud de publicación. */
export async function sendListingSubmission(input: {
  contactName: string;
  whatsapp: string;
  data: Record<string, unknown>;
  photos: File[];
}): Promise<SendResult> {
  const supabase = getSupabase();
  if (!supabase) return { ok: false, reason: "not_configured" };

  const folder = `submissions/${crypto.randomUUID()}`;
  const paths: string[] = [];
  for (const [i, file] of input.photos.slice(0, 8).entries()) {
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
    const path = `${folder}/${i + 1}.${ext}`;
    const { error } = await supabase.storage
      .from(PHOTO_BUCKET)
      .upload(path, file, { contentType: file.type, upsert: false });
    if (error) return { ok: false, reason: "error", message: `Foto ${i + 1}: ${error.message}` };
    paths.push(path);
  }

  const { error } = await supabase.from("listing_submissions").insert({
    contact_name: input.contactName.slice(0, 120),
    whatsapp: input.whatsapp.slice(0, 40),
    data: input.data,
    photos: paths,
  });
  return error ? { ok: false, reason: "error", message: error.message } : { ok: true };
}
