"use client";

import { useId, useState } from "react";
import type { ReportReason } from "@/lib/types";
import { appendLocal, localId } from "@/lib/local-store";
import { track } from "@/lib/analytics";
import { Button } from "@/components/ui/Button";
import { Field, RadioCard, Textarea, Input } from "@/components/ui/Field";
import { Callout } from "@/components/ui/Callout";
import { IconCheck, IconClose, IconFlag } from "@/components/ui/Icon";

const reasons: Array<{ value: ReportReason; label: string; description: string }> = [
  {
    value: "false_info",
    label: "Información falsa",
    description: "Las características o el estado no corresponden a la máquina.",
  },
  {
    value: "wrong_price",
    label: "Precio incorrecto",
    description: "El precio publicado no es el que cobra el propietario.",
  },
  {
    value: "not_available",
    label: "Máquina no disponible",
    description: "El equipo ya no está disponible para alquiler.",
  },
  {
    value: "inappropriate",
    label: "Contenido inapropiado",
    description: "Texto o imágenes que no corresponden a la plataforma.",
  },
  {
    value: "possible_scam",
    label: "Posible estafa",
    description: "Pidieron adelantos sospechosos o hay señales de fraude.",
  },
  { value: "other", label: "Otro motivo", description: "Cuéntanos qué ocurre." },
];

export function ReportListing({
  machineId,
  reference,
}: {
  machineId: string;
  reference: string;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason | "">("");
  const [comment, setComment] = useState("");
  const [contact, setContact] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!reason) {
      setError("Selecciona un motivo para continuar.");
      return;
    }
    if (reason === "other" && comment.trim().length < 10) {
      setError("Cuéntanos brevemente qué ocurre (al menos 10 caracteres).");
      return;
    }
    setError(null);

    appendLocal("reports", {
      id: localId("rep"),
      machineId,
      reference,
      reason,
      comment: comment.trim(),
      reporterContact: contact.trim() || null,
      createdAt: new Date().toISOString(),
      status: "open",
    });

    track({ name: "report_submit", machineId, reason });
    setSent(true);
  }

  function close() {
    setOpen(false);
    setSent(false);
    setReason("");
    setComment("");
    setContact("");
    setError(null);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap text-sm font-medium text-steel-500 underline underline-offset-2 transition-colors hover:text-danger-700"
      >
        <IconFlag size={15} />
        Reportar publicación
      </button>

      {open && (
        <div className="fixed inset-0 z-60 flex items-end justify-center sm:items-center sm:p-4">
          <div
            className="absolute inset-0 bg-ink-950/60"
            onClick={close}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${id}-title`}
            className="relative max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-5 shadow-pop sm:rounded-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <h2 id={`${id}-title`} className="text-lg font-bold text-ink-900">
                {sent ? "Reporte registrado" : "Reportar publicación"}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                className="px-2"
                aria-label="Cerrar"
                onClick={close}
              >
                <IconClose size={20} />
              </Button>
            </div>

            {sent ? (
              <div className="mt-4">
                <div className="flex items-center gap-3 rounded-xl border border-ok-500/30 bg-ok-50 p-4">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-ok-500 text-white">
                    <IconCheck size={18} />
                  </span>
                  <p className="text-sm leading-relaxed text-steel-800">
                    Gracias por avisar. Los reportes ayudan a que MaquiFly sea
                    un lugar confiable.
                  </p>
                </div>
                <Callout tone="warn" className="mt-4">
                  <strong>Estado real de esta función:</strong> tu reporte quedó
                  guardado únicamente en este navegador. El envío al equipo de
                  MaquiFly requiere backend (tabla <code>reports</code> y panel
                  de moderación), que todavía no está conectado.
                </Callout>
                <Button variant="primary" fullWidth className="mt-4" onClick={close}>
                  Cerrar
                </Button>
              </div>
            ) : (
              <form onSubmit={submit} className="mt-4 flex flex-col gap-4" noValidate>
                <p className="text-sm leading-relaxed text-steel-600">
                  Cuéntanos qué problema encontraste en la publicación{" "}
                  <span className="font-semibold text-ink-900">{reference}</span>.
                </p>

                <fieldset className="flex flex-col gap-2">
                  <legend className="mb-1 text-sm font-semibold text-ink-900">
                    Motivo <span className="text-danger-500">*</span>
                  </legend>
                  {reasons.map((item) => (
                    <RadioCard
                      key={item.value}
                      id={`${id}-${item.value}`}
                      name={`${id}-reason`}
                      value={item.value}
                      checked={reason === item.value}
                      onChange={() => setReason(item.value)}
                      label={item.label}
                      description={item.description}
                    />
                  ))}
                </fieldset>

                <Field
                  label="Detalle"
                  htmlFor={`${id}-comment`}
                  hint="Opcional, salvo que hayas marcado «Otro motivo»."
                >
                  <Textarea
                    id={`${id}-comment`}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    maxLength={600}
                    placeholder="Describe brevemente el problema…"
                    className="min-h-24"
                  />
                </Field>

                <Field
                  label="Tu contacto"
                  htmlFor={`${id}-contact`}
                  hint="Opcional. Solo si quieres que te respondamos."
                >
                  <Input
                    id={`${id}-contact`}
                    type="text"
                    inputMode="email"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    maxLength={120}
                    placeholder="Correo o WhatsApp"
                  />
                </Field>

                {error && (
                  <p role="alert" className="text-sm font-medium text-danger-700">
                    {error}
                  </p>
                )}

                <div className="flex flex-col gap-2 sm:flex-row-reverse">
                  <Button type="submit" variant="danger" fullWidth>
                    Enviar reporte
                  </Button>
                  <Button type="button" variant="secondary" fullWidth onClick={close}>
                    Cancelar
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
