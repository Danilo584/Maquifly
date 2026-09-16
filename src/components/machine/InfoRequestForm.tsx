"use client";

import { useId, useState } from "react";
import type { Machine } from "@/lib/types";
import { appendLocal, localId } from "@/lib/local-store";
import { track } from "@/lib/analytics";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { Callout } from "@/components/ui/Callout";
import { IconCheck, IconMail } from "@/components/ui/Icon";

/**
 * Alternativa a WhatsApp para quien prefiere dejar sus datos.
 * Valida en cliente y guarda la solicitud localmente. El envío real (correo
 * al propietario + registro en base de datos) requiere backend.
 */
export function InfoRequestForm({ machine }: { machine: Machine }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState(
    `Hola, necesito el ${machine.name}. Trabajo a realizar: `,
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (name.trim().length < 2) next.name = "Escribe tu nombre.";
    if (contact.trim().length < 6)
      next.contact = "Deja un teléfono o correo donde puedan responderte.";
    if (message.trim().length < 15)
      next.message = "Cuéntale al propietario qué necesitas (mínimo 15 caracteres).";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    appendLocal("info-requests", {
      id: localId("req"),
      machineId: machine.id,
      reference: machine.reference,
      name: name.trim(),
      contact: contact.trim(),
      message: message.trim(),
      createdAt: new Date().toISOString(),
    });
    track({ name: "contact_form_submit", context: `machine:${machine.reference}` });
    setSent(true);
  }

  if (!open) {
    return (
      <Button variant="secondary" fullWidth onClick={() => setOpen(true)}>
        <IconMail size={18} />
        Solicitar información
      </Button>
    );
  }

  if (sent) {
    return (
      <div className="rounded-xl border border-ok-500/30 bg-ok-50 p-4">
        <div className="flex items-start gap-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-ok-500 text-white">
            <IconCheck size={17} />
          </span>
          <div>
            <p className="text-sm font-bold text-ink-900">Solicitud registrada</p>
            <p className="mt-1 text-sm leading-relaxed text-steel-700">
              Quedó guardada en este navegador. El envío al propietario
              necesita backend (correo transaccional + tabla de solicitudes).
              Mientras tanto, WhatsApp es el canal que sí funciona de extremo a
              extremo.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3.5" noValidate>
      <Field label="Tu nombre" htmlFor={`${id}-name`} required error={errors.name}>
        <Input
          id={`${id}-name`}
          value={name}
          onChange={(e) => setName(e.target.value)}
          invalid={Boolean(errors.name)}
          maxLength={80}
          autoComplete="name"
          placeholder="Nombre y apellido o empresa"
        />
      </Field>

      <Field
        label="Teléfono o correo"
        htmlFor={`${id}-contact`}
        required
        error={errors.contact}
      >
        <Input
          id={`${id}-contact`}
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          invalid={Boolean(errors.contact)}
          maxLength={120}
          placeholder="999 999 999 o correo@empresa.pe"
        />
      </Field>

      <Field
        label="¿Qué necesitas?"
        htmlFor={`${id}-message`}
        required
        error={errors.message}
        hint="Ubicación de la obra, fechas y duración estimada ayudan a cotizar rápido."
      >
        <Textarea
          id={`${id}-message`}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          invalid={Boolean(errors.message)}
          maxLength={800}
          className="min-h-28"
        />
      </Field>

      <Callout tone="neutral">
        Tus datos se comparten únicamente con el propietario de esta
        publicación para que pueda responderte.
      </Callout>

      <div className="flex flex-col gap-2 sm:flex-row-reverse">
        <Button type="submit" variant="primary" fullWidth>
          Enviar solicitud
        </Button>
        <Button
          type="button"
          variant="ghost"
          fullWidth
          onClick={() => setOpen(false)}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
